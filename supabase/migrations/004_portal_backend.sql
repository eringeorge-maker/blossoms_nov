-- =============================================================
-- Blossoms Fest — Migration 004: portal backend
--   * Real sign-in: students link their register number to a CHRIST email (email OTP),
--     admins sign in from an invite list
--   * Attendance, notifications, server-side team registration, winners
--   * Admin analytics, defaulter lists, exports, student search, class list
--   * Security fixes on 002 (student self-update, open audit inserts)
-- Every function is SECURITY DEFINER with a pinned search_path and checks the caller itself.
-- =============================================================

-- ── 1. Column additions ──────────────────────────────────────
alter table public.students
  add column if not exists class_name text,
  add column if not exists programme  text;

create index if not exists students_class_idx on public.students(class_name);
create index if not exists students_auth_user_idx on public.students(auth_user_id);

alter table public.events
  add column if not exists registration_enabled boolean not null default true,
  add column if not exists registration_closed  boolean not null default false,
  add column if not exists whatsapp_group_url   text,
  add column if not exists points               numeric(5,2),
  add column if not exists finals_rule          text;

do $$ begin
  alter table public.events add constraint events_whatsapp_url_check
    check (whatsapp_group_url is null or whatsapp_group_url ~ '^https://(chat\.whatsapp\.com|wa\.me|whatsapp\.com)/');
exception when duplicate_object then null; end $$;

-- Slots can now carry a date with no fixed time (online submissions, "timing TBA").
alter table public.event_schedule_slots add column if not exists slot_date date;

do $$
declare c text;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.event_schedule_slots'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%tbd%'
  loop
    execute format('alter table public.event_schedule_slots drop constraint %I', c);
  end loop;
end $$;

do $$ begin
  alter table public.event_schedule_slots add constraint event_schedule_slots_time_check
    check ((starts_at is null and ends_at is null)
        or (starts_at is not null and ends_at is not null and ends_at > starts_at));
exception when duplicate_object then null; end $$;

create unique index if not exists teams_event_name_uidx on public.teams(event_id, lower(team_name));

alter table public.event_winners
  add column if not exists declared_by uuid references public.admin_profiles(id),
  add column if not exists declared_at timestamptz not null default now();

create unique index if not exists event_winners_student_uidx on public.event_winners(event_id, student_id) where student_id is not null;
create unique index if not exists event_winners_team_uidx    on public.event_winners(event_id, team_id)    where team_id is not null;

-- ── 2. New tables ────────────────────────────────────────────
do $$ begin
  create type contact_role_enum as enum ('faculty_coordinator', 'student_head');
exception when duplicate_object then null; end $$;

do $$ begin
  create type attendance_status_enum as enum ('present', 'absent');
exception when duplicate_object then null; end $$;

create table if not exists public.event_contacts (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events(id) on delete cascade,
  role          contact_role_enum not null,
  name          text not null,
  phone         text,
  display_order smallint not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists event_contacts_event_idx on public.event_contacts(event_id, role, display_order);

create table if not exists public.class_representatives (
  id              uuid primary key default gen_random_uuid(),
  full_name       text not null,
  register_number text,
  class_name      text not null,
  phone           text,
  created_at      timestamptz not null default now()
);

create table if not exists public.admin_invites (
  email      text primary key check (email = lower(email)),
  full_name  text not null,
  role       user_role_enum not null default 'event_coordinator' check (role <> 'student'),
  invited_by uuid references public.admin_profiles(id),
  created_at timestamptz not null default now(),
  claimed_at timestamptz
);

create table if not exists public.event_attendance (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status     attendance_status_enum not null,
  marked_by  uuid references public.admin_profiles(id),
  marked_at  timestamptz not null default now(),
  unique (event_id, student_id)
);
create index if not exists event_attendance_student_idx on public.event_attendance(student_id, status);

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text not null,
  link       text,
  audience   text not null default 'all' check (audience in ('all', 'event', 'student')),
  event_id   uuid references public.events(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  created_by uuid references public.admin_profiles(id),
  created_at timestamptz not null default now(),
  check (
       (audience = 'all'     and event_id is null     and student_id is null)
    or (audience = 'event'   and event_id is not null and student_id is null)
    or (audience = 'student' and student_id is not null and event_id is null)
  )
);
create index if not exists notifications_created_idx on public.notifications(created_at desc);
create index if not exists notifications_student_idx on public.notifications(student_id) where student_id is not null;
create index if not exists notifications_event_idx   on public.notifications(event_id)   where event_id is not null;

create table if not exists public.notification_receipts (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  student_id      uuid not null references public.students(id) on delete cascade,
  read_at         timestamptz,
  dismissed_at    timestamptz,
  primary key (notification_id, student_id)
);

alter table public.event_contacts        enable row level security;
alter table public.class_representatives enable row level security;
alter table public.admin_invites         enable row level security;
alter table public.event_attendance      enable row level security;
alter table public.notifications         enable row level security;
alter table public.notification_receipts enable row level security;

-- ── 3. Helpers ───────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admin_profiles where auth_user_id = auth.uid() and is_active);
$$;

create or replace function public.current_admin_profile_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.admin_profiles where auth_user_id = auth.uid() and is_active limit 1;
$$;

-- Super admins and content editors manage every event; coordinators only their assigned ones.
create or replace function public.can_manage_event(p_event_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_admin_role() in ('super_admin', 'content_editor'), false)
      or exists(
           select 1 from public.event_coordinator_assignments eca
           join public.admin_profiles ap on ap.id = eca.admin_profile_id
           where ap.auth_user_id = auth.uid() and ap.is_active and eca.event_id = p_event_id
         );
$$;

create or replace function public.require_admin()
returns void language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN: admin access required' using errcode = '42501';
  end if;
end $$;

create or replace function public.is_christ_email(p_email text)
returns boolean language sql immutable as $$
  select coalesce(lower(p_email) ~ '^[a-z0-9._%+-]+@([a-z0-9-]+\.)*christuniversity\.in$', false);
$$;

-- True when some part of the student's name (3+ letters) appears in the email's local part.
-- CHRIST addresses are built from the name (firstname.lastname@dept.christuniversity.in),
-- so this blocks most attempts to claim someone else's register number.
create or replace function public.email_matches_name(p_email text, p_full_name text)
returns boolean language sql immutable as $$
  select exists(
    select 1
    from regexp_split_to_table(lower(coalesce(p_full_name, '')), '[^a-z]+') as part
    where length(part) >= 3
      and position(part in regexp_replace(split_part(lower(p_email), '@', 1), '[^a-z]', '', 'g')) > 0
  );
$$;

create or replace function public.mask_name(p_full_name text)
returns text language sql immutable as $$
  select string_agg(left(w, 1) || repeat('*', greatest(length(w) - 1, 0)), ' ')
  from regexp_split_to_table(trim(coalesce(p_full_name, '')), '\s+') as w;
$$;

-- ── 4. RLS: security fixes + new tables ──────────────────────
-- Students used to be able to update every column of their own row (including
-- register_number / is_verified). Profile edits now go through update_my_profile().
drop policy if exists "Student can update own permitted fields" on public.students;

-- Audit rows are written only by SECURITY DEFINER functions (table owner bypasses RLS).
drop policy if exists "System inserts audit logs" on public.audit_logs;

drop policy if exists "Admins read all students" on public.students;
create policy "Admins read all students" on public.students
  for select using (public.is_admin());

drop policy if exists "Admins read all registrations" on public.event_registrations;
create policy "Admins read all registrations" on public.event_registrations
  for select using (public.is_admin());

drop policy if exists "Admins read teams" on public.teams;
create policy "Admins read teams" on public.teams for select using (public.is_admin());
drop policy if exists "Admins read team members" on public.team_members;
create policy "Admins read team members" on public.team_members for select using (public.is_admin());

drop policy if exists "Public reads event contacts" on public.event_contacts;
create policy "Public reads event contacts" on public.event_contacts for select using (true);
drop policy if exists "Admins manage event contacts" on public.event_contacts;
create policy "Admins manage event contacts" on public.event_contacts
  for all using (public.can_manage_event(event_id)) with check (public.can_manage_event(event_id));

drop policy if exists "Admins read class reps" on public.class_representatives;
create policy "Admins read class reps" on public.class_representatives for select using (public.is_admin());
drop policy if exists "Super admin manages class reps" on public.class_representatives;
create policy "Super admin manages class reps" on public.class_representatives
  for all using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "Super admin manages admin invites" on public.admin_invites;
create policy "Super admin manages admin invites" on public.admin_invites
  for all using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "Admins read attendance" on public.event_attendance;
create policy "Admins read attendance" on public.event_attendance for select using (public.is_admin());
drop policy if exists "Student reads own attendance" on public.event_attendance;
create policy "Student reads own attendance" on public.event_attendance
  for select using (student_id = public.current_student_id());

drop policy if exists "Admins manage notifications" on public.notifications;
create policy "Admins manage notifications" on public.notifications
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Student reads own receipts" on public.notification_receipts;
create policy "Student reads own receipts" on public.notification_receipts
  for select using (student_id = public.current_student_id());

drop policy if exists "Admins read admin profiles" on public.admin_profiles;
create policy "Admins read admin profiles" on public.admin_profiles for select using (public.is_admin());

drop policy if exists "Admins read all events" on public.events;
create policy "Admins read all events" on public.events for select using (public.is_admin());

-- Winners: coordinators of an event may declare them too (002 allowed super_admin / content_editor only).
drop policy if exists "Coordinators manage winners" on public.event_winners;
create policy "Coordinators manage winners" on public.event_winners
  for all using (public.can_manage_event(event_id)) with check (public.can_manage_event(event_id));

drop policy if exists "Super admin manages venues" on public.venues;
create policy "Super admin manages venues" on public.venues
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ── 5. Sign-in ───────────────────────────────────────────────

-- Called before sending the login code, so a student learns about a wrong register number
-- or email before waiting for an email. Reveals only a masked name.
create or replace function public.student_claim_precheck(p_register_number text, p_email text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_reg   text := trim(coalesce(p_register_number, ''));
  v_s     public.students%rowtype;
begin
  if not public.is_christ_email(v_email) then
    return jsonb_build_object('ok', false, 'code', 'INVALID_EMAIL',
      'message', 'Use your CHRIST email address (ending in christuniversity.in).');
  end if;

  select * into v_s from public.students where register_number = v_reg;
  if not found or v_s.student_status <> 'active' then
    return jsonb_build_object('ok', false, 'code', 'NOT_FOUND',
      'message', 'That register number is not on the Blossoms 2026-27 student list.');
  end if;

  if v_s.auth_user_id is not null then
    if lower(coalesce(v_s.institutional_email, '')) = v_email then
      return jsonb_build_object('ok', true, 'code', 'RETURNING', 'name_hint', public.mask_name(v_s.full_name));
    end if;
    return jsonb_build_object('ok', false, 'code', 'CLAIMED',
      'message', 'This register number is already linked to a different email. Ask a Blossoms admin to reset it.');
  end if;

  if v_s.institutional_email is not null and lower(v_s.institutional_email) <> v_email then
    return jsonb_build_object('ok', false, 'code', 'EMAIL_MISMATCH',
      'message', 'This register number is set up for a different email. Use that email, or ask an admin.');
  end if;

  if v_s.institutional_email is null and not public.email_matches_name(v_email, v_s.full_name) then
    return jsonb_build_object('ok', false, 'code', 'EMAIL_NAME_MISMATCH',
      'message', 'That email does not look like it belongs to the student with this register number. Use your own CHRIST email, or ask an admin to link it.');
  end if;

  return jsonb_build_object('ok', true, 'code', 'NEW', 'name_hint', public.mask_name(v_s.full_name));
end $$;

-- Called after the email code is verified. Links the signed-in user to the register number.
create or replace function public.claim_student_account(p_register_number text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_reg   text := trim(coalesce(p_register_number, ''));
  v_s     public.students%rowtype;
  v_linked public.students%rowtype;
begin
  if v_uid is null then
    return jsonb_build_object('success', false, 'error_code', 'UNAUTHENTICATED', 'message', 'Sign in first.');
  end if;

  select * into v_linked from public.students where auth_user_id = v_uid;
  if found then
    if v_linked.register_number = v_reg or v_reg = '' then
      return jsonb_build_object('success', true, 'student_id', v_linked.id);
    end if;
    return jsonb_build_object('success', false, 'error_code', 'ALREADY_LINKED',
      'message', 'This email is already linked to register number ' || v_linked.register_number || '.');
  end if;

  if not public.is_christ_email(v_email) then
    return jsonb_build_object('success', false, 'error_code', 'INVALID_EMAIL',
      'message', 'Use your CHRIST email address (ending in christuniversity.in).');
  end if;

  select * into v_s from public.students where register_number = v_reg for update;
  if not found or v_s.student_status <> 'active' then
    return jsonb_build_object('success', false, 'error_code', 'NOT_FOUND',
      'message', 'That register number is not on the Blossoms 2026-27 student list.');
  end if;

  if v_s.auth_user_id is not null and v_s.auth_user_id <> v_uid then
    return jsonb_build_object('success', false, 'error_code', 'CLAIMED',
      'message', 'This register number is already linked to a different email. Ask a Blossoms admin to reset it.');
  end if;

  if v_s.institutional_email is not null and lower(v_s.institutional_email) <> v_email then
    return jsonb_build_object('success', false, 'error_code', 'EMAIL_MISMATCH',
      'message', 'This register number is set up for a different email.');
  end if;

  if v_s.institutional_email is null and not public.email_matches_name(v_email, v_s.full_name) then
    return jsonb_build_object('success', false, 'error_code', 'EMAIL_NAME_MISMATCH',
      'message', 'That email does not look like it belongs to this student. Ask an admin to link it.');
  end if;

  if exists(select 1 from public.students where lower(institutional_email) = v_email and id <> v_s.id) then
    return jsonb_build_object('success', false, 'error_code', 'EMAIL_IN_USE',
      'message', 'This email is already linked to another register number.');
  end if;

  update public.students
     set auth_user_id = v_uid,
         institutional_email = v_email,
         is_verified = true,
         updated_at = now()
   where id = v_s.id;

  insert into public.audit_logs (actor_id, actor_role, action, resource, resource_id, detail)
  values (v_s.id, 'student', 'claim_account', 'students', v_s.id, jsonb_build_object('email', v_email));

  return jsonb_build_object('success', true, 'student_id', v_s.id);
end $$;

-- Turns an admin invite into an admin profile the first time that email signs in.
create or replace function public.ensure_admin_profile()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_p     public.admin_profiles%rowtype;
  v_inv   public.admin_invites%rowtype;
begin
  if v_uid is null then return null; end if;

  select * into v_p from public.admin_profiles where auth_user_id = v_uid;
  if found then
    if not v_p.is_active then return null; end if;
    return jsonb_build_object('id', v_p.id, 'role', v_p.role, 'full_name', v_p.full_name, 'email', v_p.email);
  end if;

  select * into v_inv from public.admin_invites where email = v_email;
  if not found then return null; end if;

  insert into public.admin_profiles (auth_user_id, full_name, email, role)
  values (v_uid, v_inv.full_name, v_email, v_inv.role)
  on conflict (email) do update set auth_user_id = excluded.auth_user_id, is_active = true
  returning * into v_p;

  update public.admin_invites set claimed_at = now() where email = v_email;

  insert into public.audit_logs (actor_id, actor_role, action, resource, resource_id, detail)
  values (v_p.id, v_p.role::text, 'admin_claimed', 'admin_profiles', v_p.id, jsonb_build_object('email', v_email));

  return jsonb_build_object('id', v_p.id, 'role', v_p.role, 'full_name', v_p.full_name, 'email', v_p.email);
end $$;

create or replace function public.get_session_profile()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'email', auth.jwt() ->> 'email',
    'admin', (
      select jsonb_build_object('id', ap.id, 'role', ap.role, 'full_name', ap.full_name, 'email', ap.email)
      from public.admin_profiles ap where ap.auth_user_id = auth.uid() and ap.is_active
    ),
    'student', (
      select jsonb_build_object(
        'id', s.id, 'register_number', s.register_number, 'full_name', s.full_name,
        'class_name', s.class_name, 'programme', s.programme, 'year_of_study', s.year_of_study,
        'institutional_email', s.institutional_email, 'phone', s.phone,
        'profile_complete', s.profile_complete, 'department', d.name, 'campus', c.name)
      from public.students s
      join public.departments d on d.id = s.department_id
      join public.campuses c on c.id = s.campus_id
      where s.auth_user_id = auth.uid()
    )
  );
$$;

-- ── 6. Student profile ───────────────────────────────────────
create or replace function public.update_my_profile(p_phone text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_id     uuid := public.current_student_id();
  v_digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
begin
  if v_id is null then
    return jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED', 'message', 'Student account not found.');
  end if;
  if length(v_digits) = 12 and left(v_digits, 2) = '91' then v_digits := right(v_digits, 10); end if;
  if v_digits !~ '^[6-9][0-9]{9}$' then
    return jsonb_build_object('success', false, 'error_code', 'INVALID_PHONE',
      'message', 'Enter a 10-digit Indian mobile number.');
  end if;

  update public.students set phone = v_digits, profile_complete = true, updated_at = now() where id = v_id;
  return jsonb_build_object('success', true, 'phone', v_digits);
end $$;

-- ── 7. Registration ──────────────────────────────────────────
-- Shared checks for individual and team registration. Returns null when the event is open.
create or replace function public.registration_block_reason(p_event public.events)
returns jsonb language plpgsql stable set search_path = public as $$
begin
  if p_event.id is null or p_event.status <> 'published' then
    return jsonb_build_object('success', false, 'error_code', 'EVENT_NOT_AVAILABLE', 'message', 'This event is not open for registration.');
  end if;
  if not p_event.registration_enabled then
    return jsonb_build_object('success', false, 'error_code', 'NO_REGISTRATION', 'message', 'This event does not take registrations.');
  end if;
  if p_event.registration_closed then
    return jsonb_build_object('success', false, 'error_code', 'REGISTRATION_CLOSED', 'message', 'Registration for this event has been closed by the organisers.');
  end if;
  if p_event.registration_opens_at is not null and now() < p_event.registration_opens_at then
    return jsonb_build_object('success', false, 'error_code', 'REGISTRATION_NOT_OPEN', 'message', 'Registration for this event has not opened yet.');
  end if;
  if p_event.registration_closes_at is not null and now() > p_event.registration_closes_at then
    return jsonb_build_object('success', false, 'error_code', 'REGISTRATION_CLOSED', 'message', 'Registration for this event has closed.');
  end if;
  return null;
end $$;

create or replace function public.register_individual_event(p_event_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_s        public.students%rowtype;
  v_event    public.events%rowtype;
  v_block    jsonb;
  v_existing public.event_registrations%rowtype;
  v_count    integer;
  v_status   registration_status_enum;
  v_reg_id   uuid;
begin
  select * into v_s from public.students where auth_user_id = auth.uid();
  if not found then
    return jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED', 'message', 'Sign in with your student account to register.');
  end if;
  if v_s.student_status <> 'active' or not v_s.is_verified then
    return jsonb_build_object('success', false, 'error_code', 'INACTIVE_STUDENT', 'message', 'Your student account is not active.');
  end if;
  if not v_s.profile_complete then
    return jsonb_build_object('success', false, 'error_code', 'PROFILE_INCOMPLETE', 'message', 'Add your phone number in your profile before registering.');
  end if;

  select * into v_event from public.events where id = p_event_id for update;
  v_block := public.registration_block_reason(v_event);
  if v_block is not null then return v_block; end if;

  if v_event.event_format not in ('individual', 'either') then
    return jsonb_build_object('success', false, 'error_code', 'INVALID_FORMAT', 'message', 'This event needs a team registration.');
  end if;

  select * into v_existing from public.event_registrations where event_id = p_event_id and student_id = v_s.id;
  if found and v_existing.registration_status in ('confirmed', 'waitlisted') then
    return jsonb_build_object('success', false, 'error_code', 'ALREADY_REGISTERED', 'message', 'You are already registered for this event.');
  end if;

  select count(*) into v_count from public.event_registrations
   where event_id = p_event_id and registration_status = 'confirmed';

  if v_event.capacity is not null and v_count >= v_event.capacity then
    if not v_event.waitlist_enabled then
      return jsonb_build_object('success', false, 'error_code', 'CAPACITY_FULL', 'message', 'This event is full.');
    end if;
    v_status := 'waitlisted';
  else
    v_status := 'confirmed';
  end if;

  insert into public.event_registrations (event_id, student_id, registration_status, registered_by_student_id)
  values (p_event_id, v_s.id, v_status, v_s.id)
  on conflict (event_id, student_id) do update
     set registration_status = excluded.registration_status, team_id = null,
         registered_at = now(), cancelled_at = null, registered_by_student_id = excluded.registered_by_student_id
  returning id into v_reg_id;

  insert into public.audit_logs (actor_id, actor_role, action, resource, resource_id, detail)
  values (v_s.id, 'student', 'register_individual', 'event_registrations', v_reg_id,
          jsonb_build_object('event_id', p_event_id, 'status', v_status));

  return jsonb_build_object('success', true, 'registration_id', v_reg_id, 'status', v_status,
    'event_title', v_event.title, 'whatsapp_group_url', v_event.whatsapp_group_url,
    'message', 'You are registered for ' || v_event.title || '.');
end $$;

create or replace function public.register_team_event(
  p_event_id uuid,
  p_team_name text,
  p_member_register_numbers text[]
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_leader   public.students%rowtype;
  v_event    public.events%rowtype;
  v_block    jsonb;
  v_name     text := trim(coalesce(p_team_name, ''));
  v_regs     text[];
  v_missing  text[];
  v_taken    text[];
  v_size     integer;
  v_team_id  uuid;
  v_member   record;
begin
  select * into v_leader from public.students where auth_user_id = auth.uid();
  if not found then
    return jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED', 'message', 'Sign in with your student account to register a team.');
  end if;
  if v_leader.student_status <> 'active' or not v_leader.is_verified then
    return jsonb_build_object('success', false, 'error_code', 'INACTIVE_STUDENT', 'message', 'Your student account is not active.');
  end if;
  if not v_leader.profile_complete then
    return jsonb_build_object('success', false, 'error_code', 'PROFILE_INCOMPLETE', 'message', 'Add your phone number in your profile before registering a team.');
  end if;

  select * into v_event from public.events where id = p_event_id for update;
  v_block := public.registration_block_reason(v_event);
  if v_block is not null then return v_block; end if;

  if v_event.event_format not in ('team', 'either') then
    return jsonb_build_object('success', false, 'error_code', 'INVALID_FORMAT', 'message', 'This is an individual event.');
  end if;

  if length(v_name) < 2 or length(v_name) > 60 then
    return jsonb_build_object('success', false, 'error_code', 'INVALID_TEAM_NAME', 'message', 'Team name must be 2 to 60 characters.');
  end if;
  if exists(select 1 from public.teams t where t.event_id = p_event_id and lower(t.team_name) = lower(v_name)
            and exists(select 1 from public.event_registrations r where r.team_id = t.id and r.registration_status <> 'cancelled')) then
    return jsonb_build_object('success', false, 'error_code', 'TEAM_NAME_TAKEN', 'message', 'Another team already uses that name for this event.');
  end if;
  -- A withdrawn team keeps its row; free the name so it can be reused.
  update public.event_registrations er set team_id = null
   where er.event_id = p_event_id and er.registration_status = 'cancelled'
     and er.team_id in (
       select t.id from public.teams t
        where t.event_id = p_event_id and lower(t.team_name) = lower(v_name)
          and not exists(select 1 from public.event_winners w where w.team_id = t.id));
  delete from public.teams t
   where t.event_id = p_event_id and lower(t.team_name) = lower(v_name)
     and not exists(select 1 from public.event_registrations r where r.team_id = t.id)
     and not exists(select 1 from public.event_winners w where w.team_id = t.id);

  -- Leader first, then unique members.
  select array_agg(reg order by ord) into v_regs from (
    select reg, min(ord) as ord from (
      select v_leader.register_number as reg, 0::bigint as ord
      union all
      select trim(m), o from unnest(coalesce(p_member_register_numbers, '{}'::text[])) with ordinality as u(m, o)
      where trim(m) <> ''
    ) x group by reg
  ) y;
  v_size := coalesce(array_length(v_regs, 1), 0);

  if v_size < coalesce(v_event.min_team_size, 2) then
    return jsonb_build_object('success', false, 'error_code', 'TEAM_TOO_SMALL',
      'message', v_event.title || ' needs at least ' || coalesce(v_event.min_team_size, 2) || ' members, including you.');
  end if;
  if v_event.max_team_size is not null and v_size > v_event.max_team_size then
    return jsonb_build_object('success', false, 'error_code', 'TEAM_TOO_LARGE',
      'message', v_event.title || ' allows at most ' || v_event.max_team_size || ' members, including you.');
  end if;

  select array_agg(r) into v_missing from unnest(v_regs) r
   where not exists(select 1 from public.students s where s.register_number = r and s.student_status = 'active');
  if v_missing is not null then
    return jsonb_build_object('success', false, 'error_code', 'MEMBER_NOT_FOUND',
      'message', 'Not on the student list: ' || array_to_string(v_missing, ', '));
  end if;

  select array_agg(s.register_number || ' (' || s.full_name || ')') into v_taken
    from public.students s
    join public.event_registrations er on er.student_id = s.id
   where s.register_number = any(v_regs) and er.event_id = p_event_id and er.registration_status <> 'cancelled';
  if v_taken is not null then
    return jsonb_build_object('success', false, 'error_code', 'MEMBER_ALREADY_REGISTERED',
      'message', 'Already registered for this event: ' || array_to_string(v_taken, ', '));
  end if;

  insert into public.teams (event_id, team_name, leader_student_id)
  values (p_event_id, v_name, v_leader.id) returning id into v_team_id;

  for v_member in select s.* from public.students s where s.register_number = any(v_regs) loop
    insert into public.team_members (team_id, student_id, is_leader)
    values (v_team_id, v_member.id, v_member.id = v_leader.id);

    insert into public.event_registrations (event_id, student_id, team_id, registration_status, registered_by_student_id)
    values (p_event_id, v_member.id, v_team_id, 'confirmed', v_leader.id)
    on conflict (event_id, student_id) do update
       set registration_status = 'confirmed', team_id = excluded.team_id, registered_at = now(),
           cancelled_at = null, registered_by_student_id = excluded.registered_by_student_id;

    if v_member.id <> v_leader.id then
      insert into public.notifications (title, body, link, audience, student_id)
      values ('Added to team ' || v_name,
              v_leader.full_name || ' registered you in team "' || v_name || '" for ' || v_event.title || '.',
              '/app/my-events', 'student', v_member.id);
    end if;
  end loop;

  insert into public.audit_logs (actor_id, actor_role, action, resource, resource_id, detail)
  values (v_leader.id, 'student', 'register_team', 'teams', v_team_id,
          jsonb_build_object('event_id', p_event_id, 'members', to_jsonb(v_regs)));

  return jsonb_build_object('success', true, 'team_id', v_team_id, 'status', 'confirmed',
    'event_title', v_event.title, 'whatsapp_group_url', v_event.whatsapp_group_url,
    'message', 'Team "' || v_name || '" is registered for ' || v_event.title || '.');
end $$;

-- Leaders cancel for the whole team; members of a team cannot drop out on their own.
create or replace function public.cancel_event_registration(p_registration_id uuid, p_reason text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_student_id uuid := public.current_student_id();
  v_reg   public.event_registrations%rowtype;
  v_event public.events%rowtype;
  v_team  public.teams%rowtype;
begin
  select * into v_reg from public.event_registrations where id = p_registration_id and student_id = v_student_id;
  if not found or v_reg.registration_status = 'cancelled' then
    return jsonb_build_object('success', false, 'error_code', 'NOT_FOUND', 'message', 'Registration not found.');
  end if;

  select * into v_event from public.events where id = v_reg.event_id;
  if not v_event.cancellation_allowed then
    return jsonb_build_object('success', false, 'error_code', 'CANCELLATION_DISALLOWED', 'message', 'Cancellations are not allowed for this event.');
  end if;
  if v_event.registration_closes_at is not null and now() > v_event.registration_closes_at then
    return jsonb_build_object('success', false, 'error_code', 'CANCELLATION_CLOSED', 'message', 'Registration has closed, so this entry can no longer be cancelled.');
  end if;

  if v_reg.team_id is not null then
    select * into v_team from public.teams where id = v_reg.team_id;
    if v_team.leader_student_id <> v_student_id then
      return jsonb_build_object('success', false, 'error_code', 'TEAM_MEMBER', 'message', 'Only your team leader can cancel this team entry.');
    end if;
    update public.event_registrations set registration_status = 'cancelled', cancelled_at = now()
     where team_id = v_reg.team_id and registration_status <> 'cancelled';
    insert into public.notifications (title, body, link, audience, student_id)
    select 'Team entry cancelled', 'Team "' || v_team.team_name || '" was withdrawn from ' || v_event.title || ' by the team leader.',
           '/app/my-events', 'student', tm.student_id
      from public.team_members tm where tm.team_id = v_team.id and tm.student_id <> v_student_id;
  else
    update public.event_registrations set registration_status = 'cancelled', cancelled_at = now() where id = p_registration_id;
  end if;

  insert into public.audit_logs (actor_id, actor_role, action, resource, resource_id, detail)
  values (v_student_id, 'student', 'cancel_registration', 'event_registrations', p_registration_id, jsonb_build_object('reason', p_reason));

  return jsonb_build_object('success', true, 'message', 'Registration cancelled.');
end $$;

-- Teammate lookup while building a team. Needs 3+ characters; returns at most 8 matches.
create or replace function public.search_students(p_query text)
returns table (register_number text, full_name text, class_name text)
language plpgsql stable security definer set search_path = public as $$
declare v_q text := trim(coalesce(p_query, ''));
begin
  if public.current_student_id() is null and not public.is_admin() then
    raise exception 'FORBIDDEN: sign in to search students' using errcode = '42501';
  end if;
  if length(v_q) < 3 then return; end if;
  return query
    select s.register_number, s.full_name, s.class_name
      from public.students s
     where s.student_status = 'active'
       and (s.register_number like v_q || '%' or s.full_name ilike '%' || v_q || '%')
     order by (s.register_number = v_q) desc, s.full_name
     limit 8;
end $$;

create or replace function public.get_my_registrations()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', er.id,
    'event_id', er.event_id,
    'registration_status', er.registration_status,
    'registered_at', er.registered_at,
    'cancelled_at', er.cancelled_at,
    'attendance_status', ea.status,
    'whatsapp_group_url', case when er.registration_status <> 'cancelled' then e.whatsapp_group_url end,
    'team', case when t.id is null then null else jsonb_build_object(
      'id', t.id, 'team_name', t.team_name, 'leader_student_id', t.leader_student_id,
      'is_leader', t.leader_student_id = er.student_id,
      'members', (
        select jsonb_agg(jsonb_build_object(
          'register_number', s.register_number, 'full_name', s.full_name,
          'class_name', s.class_name, 'is_leader', tm.is_leader) order by tm.is_leader desc, s.full_name)
        from public.team_members tm join public.students s on s.id = tm.student_id
        where tm.team_id = t.id)
    ) end
  ) order by er.registered_at desc), '[]'::jsonb)
  from public.event_registrations er
  join public.events e on e.id = er.event_id
  left join public.teams t on t.id = er.team_id
  left join public.event_attendance ea on ea.event_id = er.event_id and ea.student_id = er.student_id
  where er.student_id = public.current_student_id();
$$;

-- ── 8. Notifications ─────────────────────────────────────────
create or replace function public.get_my_notifications()
returns jsonb language sql stable security definer set search_path = public as $$
  with me as (select public.current_student_id() as id)
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', n.id, 'title', n.title, 'body', n.body, 'link', n.link,
    'audience', n.audience, 'event_id', n.event_id, 'created_at', n.created_at,
    'read_at', nr.read_at
  ) order by n.created_at desc), '[]'::jsonb)
  from public.notifications n
  cross join me
  left join public.notification_receipts nr on nr.notification_id = n.id and nr.student_id = me.id
  where me.id is not null
    and nr.dismissed_at is null
    and (n.audience = 'all'
      or (n.audience = 'student' and n.student_id = me.id)
      or (n.audience = 'event' and exists(
            select 1 from public.event_registrations er
            where er.event_id = n.event_id and er.student_id = me.id and er.registration_status <> 'cancelled')))
    and n.created_at > now() - interval '120 days';
$$;

create or replace function public.mark_notification(p_notification_id uuid, p_action text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_id uuid := public.current_student_id();
begin
  if v_id is null then
    return jsonb_build_object('success', false, 'message', 'Student account not found.');
  end if;
  if p_action not in ('read', 'dismiss') then
    return jsonb_build_object('success', false, 'message', 'Unknown action.');
  end if;
  insert into public.notification_receipts (notification_id, student_id, read_at, dismissed_at)
  values (p_notification_id, v_id, now(), case when p_action = 'dismiss' then now() end)
  on conflict (notification_id, student_id) do update
     set read_at = coalesce(public.notification_receipts.read_at, now()),
         dismissed_at = case when p_action = 'dismiss' then now() else public.notification_receipts.dismissed_at end;
  return jsonb_build_object('success', true);
end $$;

create or replace function public.mark_all_notifications_read()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_id uuid := public.current_student_id(); v_items jsonb;
begin
  if v_id is null then return jsonb_build_object('success', false); end if;
  v_items := public.get_my_notifications();
  insert into public.notification_receipts (notification_id, student_id, read_at)
  select (x ->> 'id')::uuid, v_id, now() from jsonb_array_elements(v_items) x
  on conflict (notification_id, student_id) do update
     set read_at = coalesce(public.notification_receipts.read_at, now());
  return jsonb_build_object('success', true);
end $$;

-- ── 9. Public winners (names are not readable by anon through RLS) ──
create or replace function public.get_public_winners()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'event_id', e.id, 'event_title', e.title, 'event_slug', e.slug, 'category', c.name,
    'position', w.position, 'description', w.description,
    'winner_name', coalesce(t.team_name, s.full_name),
    'class_name', s.class_name,
    'members', case when t.id is null then null else (
       select jsonb_agg(ms.full_name order by tm.is_leader desc, ms.full_name)
       from public.team_members tm join public.students ms on ms.id = tm.student_id where tm.team_id = t.id) end
  ) order by c.display_order, e.title, w.position), '[]'::jsonb)
  from public.event_winners w
  join public.events e on e.id = w.event_id
  join public.event_categories c on c.id = e.category_id
  left join public.students s on s.id = w.student_id
  left join public.teams t on t.id = w.team_id
  where w.is_approved;
$$;

-- ── 10. Admin ────────────────────────────────────────────────
create or replace function public.admin_dashboard_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v jsonb;
begin
  perform public.require_admin();

  with active_regs as (
    select * from public.event_registrations where registration_status <> 'cancelled'
  ),
  present as (
    select * from public.event_attendance where status = 'present'
  ),
  first_slot as (
    select distinct on (event_id) event_id, coalesce(starts_at::date, slot_date) as event_date,
           coalesce(starts_at, slot_date::timestamptz) as sort_at
    from public.event_schedule_slots order by event_id, coalesce(starts_at, slot_date::timestamptz)
  )
  select jsonb_build_object(
    'totals', jsonb_build_object(
      'students',            (select count(*) from public.students where student_status = 'active'),
      'accounts_linked',     (select count(*) from public.students where auth_user_id is not null),
      'profiles_complete',   (select count(*) from public.students where profile_complete),
      'registrations',       (select count(*) from active_regs),
      'students_registered', (select count(distinct student_id) from active_regs),
      'teams',               (select count(distinct team_id) from active_regs where team_id is not null),
      'attendance_marked',   (select count(*) from public.event_attendance),
      'students_present',    (select count(distinct student_id) from present),
      'events',              (select count(*) from public.events where status = 'published' and registration_enabled)
    ),
    'by_category', (
      select coalesce(jsonb_agg(jsonb_build_object('category', c.name, 'slug', c.slug,
        'registrations', (select count(*) from active_regs r join public.events e on e.id = r.event_id where e.category_id = c.id),
        'present', (select count(*) from present p join public.events e on e.id = p.event_id where e.category_id = c.id)
      ) order by c.display_order), '[]'::jsonb)
      from public.event_categories c
    ),
    'by_event', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'event_id', e.id, 'slug', e.slug, 'title', e.title, 'category', c.slug,
        'event_format', e.event_format, 'event_date', fs.event_date,
        'registration_closed', e.registration_closed, 'registration_enabled', e.registration_enabled,
        'registrations', (select count(*) from active_regs r where r.event_id = e.id),
        'teams', (select count(distinct r.team_id) from active_regs r where r.event_id = e.id and r.team_id is not null),
        'present', (select count(*) from public.event_attendance a where a.event_id = e.id and a.status = 'present'),
        'absent',  (select count(*) from public.event_attendance a where a.event_id = e.id and a.status = 'absent')
      ) order by fs.sort_at nulls last, e.title), '[]'::jsonb)
      from public.events e
      join public.event_categories c on c.id = e.category_id
      left join first_slot fs on fs.event_id = e.id
      where e.status in ('published', 'completed')
    ),
    'by_class', (
      select coalesce(jsonb_agg(row_to_json(x)::jsonb order by x.class_name), '[]'::jsonb) from (
        select s.class_name,
               count(*) as students,
               count(*) filter (where s.auth_user_id is not null) as linked,
               count(*) filter (where exists(select 1 from active_regs r where r.student_id = s.id)) as registered,
               count(*) filter (where exists(select 1 from present p where p.student_id = s.id)) as attended
        from public.students s where s.student_status = 'active'
        group by s.class_name
      ) x
    )
  ) into v;
  return v;
end $$;

-- Registrants of one event, with team and attendance, for the attendance sheet.
create or replace function public.admin_event_roster(p_event_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  perform public.require_admin();
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'registration_id', er.id, 'student_id', s.id, 'register_number', s.register_number,
      'full_name', s.full_name, 'class_name', s.class_name, 'phone', s.phone,
      'registration_status', er.registration_status, 'registered_at', er.registered_at,
      'team_id', t.id, 'team_name', t.team_name, 'is_leader', t.leader_student_id = s.id,
      'attendance_status', ea.status, 'marked_at', ea.marked_at
    ) order by t.team_name nulls last, s.class_name, s.full_name), '[]'::jsonb)
    from public.event_registrations er
    join public.students s on s.id = er.student_id
    left join public.teams t on t.id = er.team_id
    left join public.event_attendance ea on ea.event_id = er.event_id and ea.student_id = er.student_id
    where er.event_id = p_event_id and er.registration_status <> 'cancelled'
  );
end $$;

create or replace function public.admin_mark_attendance(p_event_id uuid, p_student_ids uuid[], p_status text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_admin uuid := public.current_admin_profile_id(); v_n integer;
begin
  if v_admin is null or not public.can_manage_event(p_event_id) then
    raise exception 'FORBIDDEN: you cannot mark attendance for this event' using errcode = '42501';
  end if;
  if p_status = 'clear' then
    delete from public.event_attendance where event_id = p_event_id and student_id = any(p_student_ids);
  elsif p_status in ('present', 'absent') then
    insert into public.event_attendance (event_id, student_id, status, marked_by, marked_at)
    select p_event_id, sid, p_status::attendance_status_enum, v_admin, now() from unnest(p_student_ids) sid
    on conflict (event_id, student_id) do update
       set status = excluded.status, marked_by = excluded.marked_by, marked_at = now();
  else
    raise exception 'Unknown attendance status %', p_status;
  end if;
  get diagnostics v_n = row_count;

  insert into public.audit_logs (actor_id, actor_role, action, resource, resource_id, detail)
  values (v_admin, public.current_admin_role()::text, 'mark_attendance', 'events', p_event_id,
          jsonb_build_object('status', p_status, 'count', v_n));
  return jsonb_build_object('success', true, 'updated', v_n);
end $$;

-- kind: 'registered_not_attended' | 'attended_none' | 'registered_none'
create or replace function public.admin_defaulters(p_kind text, p_class text default null)
returns table (student_id uuid, register_number text, full_name text, class_name text, phone text,
               registered_count bigint, attended_count bigint, missed_events text)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.require_admin();
  return query
  with stats as (
    select s.id, s.register_number, s.full_name, s.class_name, s.phone,
      (select count(*) from public.event_registrations r where r.student_id = s.id and r.registration_status <> 'cancelled') as reg_n,
      (select count(*) from public.event_attendance a where a.student_id = s.id and a.status = 'present') as att_n,
      (select string_agg(e.title, ', ' order by e.title)
         from public.event_registrations r
         join public.events e on e.id = r.event_id
        where r.student_id = s.id and r.registration_status <> 'cancelled'
          and exists(select 1 from public.event_attendance a2 where a2.event_id = r.event_id)
          and not exists(select 1 from public.event_attendance a3
                         where a3.event_id = r.event_id and a3.student_id = s.id and a3.status = 'present')
      ) as missed
    from public.students s
    where s.student_status = 'active' and (p_class is null or s.class_name = p_class)
  )
  select st.id, st.register_number, st.full_name, st.class_name, st.phone, st.reg_n, st.att_n, st.missed
  from stats st
  where case p_kind
          when 'registered_not_attended' then st.missed is not null
          when 'attended_none'           then st.att_n = 0
          when 'registered_none'         then st.reg_n = 0
          else false
        end
  order by st.class_name, st.full_name;
end $$;

-- One flat row per active registration; the admin UI groups these into the four CSV exports.
create or replace function public.admin_participation_rows()
returns table (event_title text, category text, event_date date, register_number text, full_name text,
               class_name text, phone text, team_name text, is_leader boolean, registration_status text,
               registered_at timestamptz, attendance_status text, marked_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.require_admin();
  return query
  select e.title, c.name,
         (select coalesce(min(sl.starts_at)::date, min(sl.slot_date)) from public.event_schedule_slots sl where sl.event_id = e.id),
         s.register_number, s.full_name, s.class_name, s.phone, t.team_name,
         coalesce(t.leader_student_id = s.id, false),
         er.registration_status::text, er.registered_at, ea.status::text, ea.marked_at
  from public.event_registrations er
  join public.events e on e.id = er.event_id
  join public.event_categories c on c.id = e.category_id
  join public.students s on s.id = er.student_id
  left join public.teams t on t.id = er.team_id
  left join public.event_attendance ea on ea.event_id = er.event_id and ea.student_id = er.student_id
  where er.registration_status <> 'cancelled'
  order by e.title, s.class_name, s.full_name;
end $$;

create or replace function public.admin_search_students(p_query text default null, p_class text default null, p_limit integer default 50)
returns table (student_id uuid, register_number text, full_name text, class_name text, phone text,
               institutional_email text, linked boolean, profile_complete boolean,
               registered_count bigint, attended_count bigint)
language plpgsql stable security definer set search_path = public as $$
declare v_q text := nullif(trim(coalesce(p_query, '')), '');
begin
  perform public.require_admin();
  return query
  select s.id, s.register_number, s.full_name, s.class_name, s.phone, s.institutional_email,
         s.auth_user_id is not null, s.profile_complete,
         (select count(*) from public.event_registrations r where r.student_id = s.id and r.registration_status <> 'cancelled'),
         (select count(*) from public.event_attendance a where a.student_id = s.id and a.status = 'present')
  from public.students s
  where (p_class is null or s.class_name = p_class)
    and (v_q is null or s.register_number like v_q || '%' or s.full_name ilike '%' || v_q || '%'
         or coalesce(s.institutional_email, '') ilike '%' || v_q || '%')
  order by s.class_name, s.full_name
  limit least(greatest(coalesce(p_limit, 50), 1), 500);
end $$;

create or replace function public.admin_student_detail(p_student_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  perform public.require_admin();
  return (
    select jsonb_build_object(
      'student', to_jsonb(s) - 'auth_user_id',
      'linked', s.auth_user_id is not null,
      'registrations', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'event_title', e.title, 'event_id', e.id, 'registration_status', er.registration_status,
          'registered_at', er.registered_at, 'team_name', t.team_name, 'attendance_status', ea.status
        ) order by er.registered_at desc), '[]'::jsonb)
        from public.event_registrations er
        join public.events e on e.id = er.event_id
        left join public.teams t on t.id = er.team_id
        left join public.event_attendance ea on ea.event_id = er.event_id and ea.student_id = er.student_id
        where er.student_id = s.id)
    )
    from public.students s where s.id = p_student_id
  );
end $$;

create or replace function public.admin_class_list()
returns table (class_name text, programme text, year_of_study smallint, students bigint,
               linked bigint, registered bigint, attended bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.require_admin();
  return query
  select s.class_name, min(s.programme), min(s.year_of_study), count(*),
         count(*) filter (where s.auth_user_id is not null),
         count(*) filter (where exists(select 1 from public.event_registrations r
                                        where r.student_id = s.id and r.registration_status <> 'cancelled')),
         count(*) filter (where exists(select 1 from public.event_attendance a
                                        where a.student_id = s.id and a.status = 'present'))
  from public.students s
  where s.student_status = 'active'
  group by s.class_name
  order by min(s.year_of_study), s.class_name;
end $$;

-- Undo a wrong account link, or pre-set the email a student must sign in with.
create or replace function public.admin_set_student_email(p_student_id uuid, p_email text, p_unlink boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
begin
  if not public.is_super_admin() then
    raise exception 'FORBIDDEN: super admin only' using errcode = '42501';
  end if;
  if v_email is not null and not public.is_christ_email(v_email) then
    return jsonb_build_object('success', false, 'message', 'Email must end in christuniversity.in.');
  end if;
  if v_email is not null and exists(select 1 from public.students where lower(institutional_email) = v_email and id <> p_student_id) then
    return jsonb_build_object('success', false, 'message', 'That email is already linked to another student.');
  end if;

  update public.students
     set institutional_email = v_email,
         auth_user_id = case when p_unlink then null else auth_user_id end,
         is_verified  = case when p_unlink then false else is_verified end,
         updated_at = now()
   where id = p_student_id;

  insert into public.audit_logs (actor_id, actor_role, action, resource, resource_id, detail)
  values (public.current_admin_profile_id(), 'super_admin', 'set_student_email', 'students', p_student_id,
          jsonb_build_object('email', v_email, 'unlink', p_unlink));
  return jsonb_build_object('success', true);
end $$;

-- Replace the winners of one event. p_winners: [{"position":1,"student_id":"…"} | {"position":1,"team_id":"…"}]
create or replace function public.admin_set_winners(p_event_id uuid, p_winners jsonb, p_notify boolean default true)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_admin uuid := public.current_admin_profile_id(); v_title text; v_n integer;
begin
  if v_admin is null or not public.can_manage_event(p_event_id) then
    raise exception 'FORBIDDEN: you cannot declare winners for this event' using errcode = '42501';
  end if;
  select title into v_title from public.events where id = p_event_id;

  delete from public.event_winners where event_id = p_event_id;
  insert into public.event_winners (event_id, position, student_id, team_id, description, is_approved, declared_by, declared_at)
  select p_event_id, (w ->> 'position')::smallint, nullif(w ->> 'student_id', '')::uuid, nullif(w ->> 'team_id', '')::uuid,
         nullif(w ->> 'description', ''), true, v_admin, now()
  from jsonb_array_elements(coalesce(p_winners, '[]'::jsonb)) w;
  get diagnostics v_n = row_count;

  if p_notify and v_n > 0 then
    insert into public.notifications (title, body, link, audience, event_id, created_by)
    values ('Results: ' || v_title, 'Winners for ' || v_title || ' have been announced.', '/winners', 'event', p_event_id, v_admin);
  end if;

  insert into public.audit_logs (actor_id, actor_role, action, resource, resource_id, detail)
  values (v_admin, public.current_admin_role()::text, 'set_winners', 'events', p_event_id, jsonb_build_object('count', v_n));
  return jsonb_build_object('success', true, 'count', v_n);
end $$;

-- Teams and individual registrants of an event, for picking winners.
create or replace function public.admin_event_entrants(p_event_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  perform public.require_admin();
  return (
    select coalesce(jsonb_agg(y.x order by y.x ->> 'label'), '[]'::jsonb) from (
      select distinct on (coalesce(er.team_id, er.student_id))
        case when t.id is not null
          then jsonb_build_object('kind', 'team', 'team_id', t.id, 'label', t.team_name,
                 'detail', (select string_agg(ms.full_name, ', ') from public.team_members tm join public.students ms on ms.id = tm.student_id where tm.team_id = t.id))
          else jsonb_build_object('kind', 'student', 'student_id', s.id, 'label', s.full_name,
                 'detail', s.register_number || ' · ' || coalesce(s.class_name, ''))
        end as x
      from public.event_registrations er
      join public.students s on s.id = er.student_id
      left join public.teams t on t.id = er.team_id
      where er.event_id = p_event_id and er.registration_status <> 'cancelled'
    ) y
  );
end $$;

-- Lock down: revoke the PUBLIC default execute grant, then grant only what clients need.
revoke execute on function public.student_claim_precheck(text, text) from public;
grant  execute on function public.student_claim_precheck(text, text) to anon, authenticated;
grant  execute on function public.get_public_winners() to anon, authenticated;

do $$
declare f text;
begin
  foreach f in array array[
    'public.claim_student_account(text)', 'public.ensure_admin_profile()', 'public.get_session_profile()',
    'public.update_my_profile(text)', 'public.register_individual_event(uuid)',
    'public.register_team_event(uuid, text, text[])', 'public.cancel_event_registration(uuid, text)',
    'public.search_students(text)', 'public.get_my_registrations()', 'public.get_my_notifications()',
    'public.mark_notification(uuid, text)', 'public.mark_all_notifications_read()',
    'public.admin_dashboard_stats()', 'public.admin_event_roster(uuid)',
    'public.admin_mark_attendance(uuid, uuid[], text)', 'public.admin_defaulters(text, text)',
    'public.admin_participation_rows()', 'public.admin_search_students(text, text, integer)',
    'public.admin_student_detail(uuid)', 'public.admin_class_list()',
    'public.admin_set_student_email(uuid, text, boolean)', 'public.admin_set_winners(uuid, jsonb, boolean)',
    'public.admin_event_entrants(uuid)'
  ] loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
