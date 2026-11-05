-- Participation rules and fest teams.
--   * events.is_mandatory: events every student must attend. No registration; at a mandatory
--     event that has been held, a student counts as present unless marked absent.
--   * fest_settings: one row of editable rules (minimum chosen events, public leaderboard switch).
--   * fest_teams + class_team_assignments: the four teams; each class belongs to one team.
--   * student_progress(): per-student completion, used by defaulters and class stats.
--     A student completes when they attended >= min_chosen_events non-mandatory events
--     and every mandatory event.
-- Points (participation and wins) are added in a later migration once the points board is agreed.

-- ── Mandatory events ─────────────────────────────────────────
alter table public.events add column if not exists is_mandatory boolean not null default false;

-- ── Settings ─────────────────────────────────────────────────
create table if not exists public.fest_settings (
  id                  boolean primary key default true check (id),
  min_chosen_events   integer not null default 2 check (min_chosen_events between 0 and 50),
  leaderboard_public  boolean not null default false,
  updated_at          timestamptz not null default now(),
  updated_by          uuid references public.admin_profiles(id) on delete set null
);
insert into public.fest_settings (id) values (true) on conflict do nothing;

alter table public.fest_settings enable row level security;
drop policy if exists fest_settings_read on public.fest_settings;
create policy fest_settings_read on public.fest_settings for select using (true);
drop policy if exists fest_settings_write on public.fest_settings;
create policy fest_settings_write on public.fest_settings for update
  using (public.is_super_admin()) with check (public.is_super_admin());

-- ── Fest teams ───────────────────────────────────────────────
create table if not exists public.fest_teams (
  id             uuid primary key default gen_random_uuid(),
  name           text not null unique check (length(trim(name)) between 1 and 60),
  color          text not null default '#793F98' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  display_order  integer not null default 0,
  created_at     timestamptz not null default now()
);

create table if not exists public.class_team_assignments (
  class_name     text primary key,
  fest_team_id   uuid not null references public.fest_teams(id) on delete cascade,
  assigned_at    timestamptz not null default now()
);
create index if not exists class_team_assignments_team_idx on public.class_team_assignments (fest_team_id);

alter table public.fest_teams enable row level security;
drop policy if exists fest_teams_read on public.fest_teams;
create policy fest_teams_read on public.fest_teams for select using (true);
drop policy if exists fest_teams_write on public.fest_teams;
create policy fest_teams_write on public.fest_teams for all
  using (public.is_super_admin()) with check (public.is_super_admin());

alter table public.class_team_assignments enable row level security;
drop policy if exists class_team_read on public.class_team_assignments;
create policy class_team_read on public.class_team_assignments for select using (public.is_admin());
drop policy if exists class_team_write on public.class_team_assignments;
create policy class_team_write on public.class_team_assignments for all
  using (public.is_super_admin()) with check (public.is_super_admin());

-- ── Progress ─────────────────────────────────────────────────
-- An event has been held once it is marked completed, attendance has been taken,
-- or its first day (India time) has arrived.
create or replace function public.event_held(p_event_id uuid)
returns boolean language sql stable set search_path = public as $$
  select exists(select 1 from public.events e where e.id = p_event_id and e.status = 'completed')
      or exists(select 1 from public.event_attendance a where a.event_id = p_event_id)
      or exists(select 1 from public.event_schedule_slots sl
                 where sl.event_id = p_event_id
                   and coalesce((sl.starts_at at time zone 'Asia/Kolkata')::date, sl.slot_date)
                       <= (now() at time zone 'Asia/Kolkata')::date)
$$;

create or replace function public.student_progress()
returns table (student_id uuid, class_name text, registered_chosen bigint, chosen_attended bigint,
               mandatory_attended bigint, mandatory_held bigint, mandatory_total bigint,
               min_chosen integer, completed boolean)
language sql stable security definer set search_path = public as $$
  with cfg as (select coalesce((select min_chosen_events from public.fest_settings limit 1), 2) as min_chosen),
  mand as (
    select e.id, public.event_held(e.id) as held
    from public.events e where e.is_mandatory and e.status in ('published', 'completed')
  ),
  chosen_present as (
    select a.student_id, count(*) as n
    from public.event_attendance a join public.events e on e.id = a.event_id
    where a.status = 'present' and not e.is_mandatory
    group by a.student_id
  ),
  chosen_reg as (
    select r.student_id, count(*) as n
    from public.event_registrations r join public.events e on e.id = r.event_id
    where r.registration_status <> 'cancelled' and not e.is_mandatory
    group by r.student_id
  ),
  mand_absent as (
    select a.student_id, count(*) as n
    from public.event_attendance a join mand m on m.id = a.event_id and m.held
    where a.status = 'absent'
    group by a.student_id
  ),
  mand_counts as (
    select count(*) filter (where held) as held, count(*) as total from mand
  )
  select s.id, s.class_name,
         coalesce(cr.n, 0), coalesce(cp.n, 0),
         mc.held - coalesce(ma.n, 0), mc.held, mc.total,
         cfg.min_chosen,
         coalesce(cp.n, 0) >= cfg.min_chosen and mc.held - coalesce(ma.n, 0) = mc.total
  from public.students s
  cross join cfg cross join mand_counts mc
  left join chosen_present cp on cp.student_id = s.id
  left join chosen_reg cr on cr.student_id = s.id
  left join mand_absent ma on ma.student_id = s.id
  where s.student_status = 'active'
$$;

revoke execute on function public.student_progress() from public, anon, authenticated;

-- ── Registration: mandatory events take none ─────────────────
create or replace function public.registration_block_reason(p_event public.events)
returns jsonb language plpgsql stable set search_path = public as $$
begin
  if p_event.id is null or p_event.status <> 'published' then
    return jsonb_build_object('success', false, 'error_code', 'EVENT_NOT_AVAILABLE', 'message', 'This event is not open for registration.');
  end if;
  if p_event.is_mandatory then
    return jsonb_build_object('success', false, 'error_code', 'MANDATORY_EVENT', 'message', 'This event is mandatory for every student, so there is nothing to register for.');
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

-- ── Attendance roster: mandatory events list every active student ──
create or replace function public.admin_event_roster(p_event_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  perform public.require_admin();
  if (select is_mandatory from public.events where id = p_event_id) then
    return (
      select coalesce(jsonb_agg(jsonb_build_object(
        'registration_id', s.id, 'student_id', s.id, 'register_number', s.register_number,
        'full_name', s.full_name, 'class_name', s.class_name, 'phone', s.phone,
        'registration_status', 'mandatory', 'registered_at', null,
        'team_id', null, 'team_name', null, 'is_leader', null,
        'attendance_status', ea.status, 'marked_at', ea.marked_at
      ) order by s.class_name, s.full_name), '[]'::jsonb)
      from public.students s
      left join public.event_attendance ea on ea.event_id = p_event_id and ea.student_id = s.id
      where s.student_status = 'active'
    );
  end if;
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

-- ── Defaulters: mandatory events are left out of every count ──
-- kind: 'below_minimum' | 'registered_not_attended' | 'attended_none' | 'registered_none'
create or replace function public.admin_defaulters(p_kind text, p_class text default null)
returns table (student_id uuid, register_number text, full_name text, class_name text, phone text,
               registered_count bigint, attended_count bigint, missed_events text)
language plpgsql stable security definer set search_path = public as $$
declare v_min integer := coalesce((select min_chosen_events from public.fest_settings limit 1), 2);
begin
  perform public.require_admin();
  return query
  with stats as (
    select s.id, s.register_number, s.full_name, s.class_name, s.phone,
      (select count(*) from public.event_registrations r join public.events e on e.id = r.event_id
        where r.student_id = s.id and r.registration_status <> 'cancelled' and not e.is_mandatory) as reg_n,
      (select count(*) from public.event_attendance a join public.events e on e.id = a.event_id
        where a.student_id = s.id and a.status = 'present' and not e.is_mandatory) as att_n,
      (select string_agg(e.title, ', ' order by e.title)
         from public.event_registrations r
         join public.events e on e.id = r.event_id
        where r.student_id = s.id and r.registration_status <> 'cancelled' and not e.is_mandatory
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
          when 'below_minimum'           then st.att_n < v_min
          when 'registered_not_attended' then st.missed is not null
          when 'attended_none'           then st.att_n = 0
          when 'registered_none'         then st.reg_n = 0
          else false
        end
  order by st.class_name, st.full_name;
end $$;

-- ── Class stats: add team and completion ─────────────────────
drop function if exists public.admin_class_list();
create function public.admin_class_list()
returns table (class_name text, programme text, year_of_study smallint, team_name text, students bigint,
               linked bigint, registered bigint, attended bigint, completed bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.require_admin();
  return query
  select s.class_name, min(s.programme), min(s.year_of_study), min(ft.name), count(*),
         count(*) filter (where s.auth_user_id is not null),
         count(*) filter (where p.registered_chosen > 0),
         count(*) filter (where p.chosen_attended > 0),
         count(*) filter (where p.completed)
  from public.students s
  join public.student_progress() p on p.student_id = s.id
  left join public.class_team_assignments cta on cta.class_name = s.class_name
  left join public.fest_teams ft on ft.id = cta.fest_team_id
  where s.student_status = 'active'
  group by s.class_name
  order by min(s.year_of_study), s.class_name;
end $$;

-- Dashboard: same totals as before, plus participation rules and per-class completion.
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
  progress as (select * from public.student_progress()),
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
      'events',              (select count(*) from public.events where status = 'published' and registration_enabled),
      'students_completed',  (select count(*) from progress where completed)
    ),
    'rules', jsonb_build_object(
      'min_chosen',      coalesce((select min_chosen_events from public.fest_settings limit 1), 2),
      'mandatory_total', (select count(*) from public.events where is_mandatory and status in ('published', 'completed')),
      'mandatory_held',  (select count(*) from public.events e where e.is_mandatory and e.status in ('published', 'completed') and public.event_held(e.id))
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
        'event_format', e.event_format, 'event_date', fs.event_date, 'is_mandatory', e.is_mandatory,
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
               count(*) filter (where p.registered_chosen > 0) as registered,
               count(*) filter (where p.chosen_attended > 0) as attended,
               count(*) filter (where p.completed) as completed
        from public.students s join progress p on p.student_id = s.id
        where s.student_status = 'active'
        group by s.class_name
      ) x
    )
  ) into v;
  return v;
end $$;

-- ── Public team board ────────────────────────────────────────
-- Returns nothing to the public while the board is switched off; admins always see it.
-- Points are 0 until the points board is added.
create or replace function public.get_team_leaderboard()
returns table (team_id uuid, name text, color text, classes bigint, points numeric)
language plpgsql stable security definer set search_path = public as $$
begin
  if not coalesce((select leaderboard_public from public.fest_settings limit 1), false) and not public.is_admin() then
    return;
  end if;
  return query
  select ft.id, ft.name, ft.color,
         (select count(*) from public.class_team_assignments c where c.fest_team_id = ft.id),
         0::numeric
  from public.fest_teams ft
  order by ft.display_order, ft.name;
end $$;

grant execute on function public.get_team_leaderboard() to anon, authenticated;

do $$
declare f text;
begin
  foreach f in array array['public.admin_class_list()', 'public.admin_dashboard_stats()',
                           'public.admin_event_roster(uuid)', 'public.admin_defaulters(text, text)'] loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
