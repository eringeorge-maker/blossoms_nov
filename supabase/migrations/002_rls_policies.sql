-- =============================================================
-- Blossoms Fest — RLS Policies Migration 002
-- Must run after 001_initial_schema.sql
-- =============================================================

-- ── Enable RLS on all tables ──────────────────────────────────
alter table public.campuses                       enable row level security;
alter table public.departments                    enable row level security;
alter table public.deaneries                      enable row level security;
alter table public.students                       enable row level security;
alter table public.admin_profiles                 enable row level security;
alter table public.event_categories               enable row level security;
alter table public.venues                         enable row level security;
alter table public.events                         enable row level security;
alter table public.event_eligibility_rules        enable row level security;
alter table public.event_schedule_slots           enable row level security;
alter table public.teams                          enable row level security;
alter table public.team_members                   enable row level security;
alter table public.event_registrations            enable row level security;
alter table public.event_coordinator_assignments  enable row level security;
alter table public.announcements                  enable row level security;
alter table public.event_winners                  enable row level security;
alter table public.gallery_items                  enable row level security;
alter table public.roster_import_batches          enable row level security;
alter table public.audit_logs                     enable row level security;

-- ── Helper: get current student row ──────────────────────────
create or replace function public.current_student_id()
returns uuid language sql stable security definer as $$
  select id from public.students where auth_user_id = auth.uid() limit 1;
$$;

-- ── Helper: get current admin role ───────────────────────────
create or replace function public.current_admin_role()
returns user_role_enum language sql stable security definer as $$
  select role from public.admin_profiles where auth_user_id = auth.uid() and is_active = true limit 1;
$$;

-- ── Helper: is current user super_admin ──────────────────────
create or replace function public.is_super_admin()
returns boolean language sql stable security definer as $$
  select exists(
    select 1 from public.admin_profiles
    where auth_user_id = auth.uid() and role = 'super_admin' and is_active = true
  );
$$;

-- ── campuses / departments / deaneries: public read ──────────
create policy "Public can read campuses"
  on public.campuses for select using (true);

create policy "Public can read departments"
  on public.departments for select using (true);

create policy "Public can read deaneries"
  on public.deaneries for select using (true);

create policy "Super admin manages lookup tables"
  on public.campuses for all using (public.is_super_admin());

-- ── event_categories & venues: public read ───────────────────
create policy "Public can read event categories"
  on public.event_categories for select using (true);

create policy "Public can read venues"
  on public.venues for select using (true);

-- ── events: public read of published events ───────────────────
create policy "Public can read published events"
  on public.events for select
  using (status in ('published','completed','cancelled'));

create policy "Admin can manage events"
  on public.events for all
  using (public.current_admin_role() in ('super_admin','event_coordinator','content_editor'));

-- ── event_schedule_slots: public read ────────────────────────
create policy "Public can read schedule slots"
  on public.event_schedule_slots for select using (true);

create policy "Admin can manage schedule slots"
  on public.event_schedule_slots for all
  using (public.current_admin_role() is not null);

-- ── event_eligibility_rules: public read ─────────────────────
create policy "Public can read eligibility rules"
  on public.event_eligibility_rules for select using (true);

-- ── students: own profile ─────────────────────────────────────
create policy "Student can read own profile"
  on public.students for select
  using (auth_user_id = auth.uid());

create policy "Student can update own permitted fields"
  on public.students for update
  using (auth_user_id = auth.uid())
  with check (
    -- Cannot change authoritative identity fields via this policy
    auth_user_id = auth.uid()
  );

create policy "Super admin can read all students"
  on public.students for select
  using (public.is_super_admin());

create policy "Super admin can manage students"
  on public.students for all
  using (public.is_super_admin());

-- ── admin_profiles: self-read + super_admin manage ───────────
create policy "Admin can read own profile"
  on public.admin_profiles for select
  using (auth_user_id = auth.uid());

create policy "Super admin can manage admin profiles"
  on public.admin_profiles for all
  using (public.is_super_admin());

-- ── event_registrations: student own, coordinator assigned ────
create policy "Student reads own registrations"
  on public.event_registrations for select
  using (student_id = public.current_student_id());

-- Registrations for assigned events accessible to coordinator
create policy "Coordinator reads assigned event registrations"
  on public.event_registrations for select
  using (
    exists(
      select 1 from public.event_coordinator_assignments eca
      join public.admin_profiles ap on ap.id = eca.admin_profile_id
      where ap.auth_user_id = auth.uid()
        and eca.event_id = event_registrations.event_id
    )
  );

create policy "Super admin reads all registrations"
  on public.event_registrations for select
  using (public.is_super_admin());

-- Inserts go through RPC only; block raw client inserts
create policy "No raw client insert on registrations"
  on public.event_registrations for insert
  with check (false);

-- ── teams & team_members: student own teams ───────────────────
create policy "Student can read own teams"
  on public.teams for select
  using (leader_student_id = public.current_student_id());

create policy "Student can read own team memberships"
  on public.team_members for select
  using (student_id = public.current_student_id());

-- ── announcements: public read published ─────────────────────
create policy "Public reads published announcements"
  on public.announcements for select
  using (
    is_published = true
    and (publish_at is null or publish_at <= now())
    and (expires_at is null or expires_at > now())
  );

create policy "Admin manages announcements"
  on public.announcements for all
  using (public.current_admin_role() in ('super_admin','content_editor'));

-- ── event_winners: public read approved ──────────────────────
create policy "Public reads approved winners"
  on public.event_winners for select
  using (is_approved = true);

create policy "Admin manages winners"
  on public.event_winners for all
  using (public.current_admin_role() in ('super_admin','content_editor'));

-- ── gallery_items: public read approved ──────────────────────
create policy "Public reads approved gallery items"
  on public.gallery_items for select
  using (is_approved = true);

-- ── audit_logs: super admin read, no delete ───────────────────
create policy "Super admin reads audit logs"
  on public.audit_logs for select
  using (public.is_super_admin());

create policy "System inserts audit logs"
  on public.audit_logs for insert
  with check (true); -- inserts via service role/RPCs only

-- No update or delete on audit_logs is defined (append-only)

-- ── event_coordinator_assignments: coordinator self-read ─────
create policy "Coordinator reads own assignments"
  on public.event_coordinator_assignments for select
  using (
    exists(
      select 1 from public.admin_profiles ap
      where ap.auth_user_id = auth.uid() and ap.id = admin_profile_id
    )
  );

create policy "Super admin manages assignments"
  on public.event_coordinator_assignments for all
  using (public.is_super_admin());
