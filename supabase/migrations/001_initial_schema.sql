-- =============================================================
-- Blossoms Fest — Database Migration 001
-- All timestamps use timestamptz; display in Asia/Kolkata
-- No attendance, check-in or QR tables in this release
-- =============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────
create type event_status_enum as enum ('draft','published','completed','cancelled','archived');
create type event_format_enum as enum ('individual','team','either');
create type registration_status_enum as enum ('confirmed','waitlisted','cancelled');
create type slot_status_enum as enum ('scheduled','tbd','cancelled','rescheduled');
create type announcement_severity_enum as enum ('normal','important','urgent');
create type user_role_enum as enum ('student','event_coordinator','content_editor','analyst','super_admin');
create type eligibility_rule_type_enum as enum ('all_students','include_campus','include_department','exclude_department');

-- ── 1. campuses ──────────────────────────────────────────────
create table public.campuses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  code        text not null unique,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── 2. departments ───────────────────────────────────────────
create table public.departments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  code        text not null unique,
  campus_id   uuid not null references public.campuses(id),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── 3. deaneries ─────────────────────────────────────────────
create table public.deaneries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  campus_id   uuid references public.campuses(id),
  created_at  timestamptz not null default now()
);

-- ── 4. students ──────────────────────────────────────────────
create table public.students (
  id                   uuid primary key default gen_random_uuid(),
  auth_user_id         uuid unique references auth.users(id) on delete set null,
  register_number      text not null unique,
  full_name            text not null,
  institutional_email  text unique,
  phone                text,
  campus_id            uuid not null references public.campuses(id),
  department_id        uuid not null references public.departments(id),
  deanery_id           uuid references public.deaneries(id),
  year_of_study        smallint check (year_of_study between 1 and 6),
  student_status       text not null default 'active'
                         check (student_status in ('active','inactive','suspended')),
  is_verified          boolean not null default false,
  profile_complete     boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index students_campus_dept_status_idx
  on public.students(campus_id, department_id, student_status);
create index students_email_idx
  on public.students(institutional_email);

-- ── 5. admin_profiles ────────────────────────────────────────
create table public.admin_profiles (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name    text not null,
  email        text not null unique,
  role         user_role_enum not null default 'event_coordinator',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ── 6. event_categories ──────────────────────────────────────
create table public.event_categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  slug          text not null unique,
  description   text,
  icon_url      text,
  display_order smallint not null default 0,
  created_at    timestamptz not null default now()
);

-- ── 7. venues ────────────────────────────────────────────────
create table public.venues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  campus_id   uuid references public.campuses(id),
  building    text,
  room        text,
  capacity    integer check (capacity > 0),
  maps_url    text,
  created_at  timestamptz not null default now()
);

-- ── 8. events ────────────────────────────────────────────────
create table public.events (
  id                      uuid primary key default gen_random_uuid(),
  title                   text not null,
  slug                    text not null unique,
  category_id             uuid not null references public.event_categories(id),
  description             text,
  rules_markdown          text,
  poster_url              text,
  thumbnail_url           text,
  event_format            event_format_enum not null default 'individual',
  min_team_size           smallint check (min_team_size >= 2),
  max_team_size           smallint check (max_team_size >= 2),
  registration_opens_at   timestamptz,
  registration_closes_at  timestamptz,
  capacity                integer check (capacity > 0),
  waitlist_enabled        boolean not null default false,
  cancellation_allowed    boolean not null default false,
  conflict_policy         text not null default 'warn'
                            check (conflict_policy in ('warn','block','ignore')),
  status                  event_status_enum not null default 'draft',
  organiser_contact       text,
  created_by              uuid references public.admin_profiles(id),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  -- Constraints
  check (
    registration_closes_at is null
    or registration_opens_at is null
    or registration_closes_at > registration_opens_at
  ),
  check (
    event_format = 'individual'
    or (min_team_size is not null and max_team_size is not null and max_team_size >= min_team_size)
  )
);

create index events_status_category_idx
  on public.events(status, category_id);
create index events_registration_window_idx
  on public.events(registration_opens_at, registration_closes_at);

-- ── 9. event_eligibility_rules ───────────────────────────────
create table public.event_eligibility_rules (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events(id) on delete cascade,
  rule_type     eligibility_rule_type_enum not null,
  campus_id     uuid references public.campuses(id),
  department_id uuid references public.departments(id),
  reason        text,
  created_at    timestamptz not null default now()
);

-- ── 10. event_schedule_slots ─────────────────────────────────
create table public.event_schedule_slots (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  venue_id    uuid references public.venues(id),
  slot_title  text,
  starts_at   timestamptz,
  ends_at     timestamptz,
  timezone    text not null default 'Asia/Kolkata',
  status      slot_status_enum not null default 'scheduled',
  created_at  timestamptz not null default now(),
  check (
    (status = 'tbd' and starts_at is null and ends_at is null)
    or (starts_at is not null and ends_at is not null and ends_at > starts_at)
  )
);

create index event_slots_starts_idx on public.event_schedule_slots(starts_at, ends_at);
create index event_slots_venue_idx  on public.event_schedule_slots(venue_id);

-- ── 11. teams ────────────────────────────────────────────────
create table public.teams (
  id                uuid primary key default gen_random_uuid(),
  event_id          uuid not null references public.events(id) on delete restrict,
  team_name         text not null,
  leader_student_id uuid not null references public.students(id),
  created_at        timestamptz not null default now()
);

-- ── 12. team_members ─────────────────────────────────────────
create table public.team_members (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  student_id  uuid not null references public.students(id),
  is_leader   boolean not null default false,
  joined_at   timestamptz not null default now(),
  unique (team_id, student_id)
);

-- ── 13. event_registrations ──────────────────────────────────
-- One row per (event, student). Re-registration reactivates the row.
create table public.event_registrations (
  id                    uuid primary key default gen_random_uuid(),
  event_id              uuid not null references public.events(id),
  student_id            uuid not null references public.students(id),
  team_id               uuid references public.teams(id),
  registration_status   registration_status_enum not null default 'confirmed',
  registered_by_student_id uuid references public.students(id),
  registered_at         timestamptz not null default now(),
  cancelled_at          timestamptz,
  unique (event_id, student_id)
);

create index event_registrations_event_status_idx
  on public.event_registrations(event_id, registration_status);
create index event_registrations_student_status_idx
  on public.event_registrations(student_id, registration_status);

-- ── 14. event_coordinator_assignments ────────────────────────
create table public.event_coordinator_assignments (
  id               uuid primary key default gen_random_uuid(),
  event_id         uuid not null references public.events(id) on delete cascade,
  admin_profile_id uuid not null references public.admin_profiles(id) on delete cascade,
  assigned_at      timestamptz not null default now(),
  unique (event_id, admin_profile_id)
);

create index coord_assignments_admin_idx
  on public.event_coordinator_assignments(admin_profile_id, event_id);

-- ── 15. announcements ────────────────────────────────────────
create table public.announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text not null,
  severity     announcement_severity_enum not null default 'normal',
  is_pinned    boolean not null default false,
  is_published boolean not null default false,
  publish_at   timestamptz,
  expires_at   timestamptz,
  created_by   uuid references public.admin_profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index announcements_published_idx
  on public.announcements(is_published, publish_at, expires_at, is_pinned);

-- ── 16. event_winners (P1) ───────────────────────────────────
create table public.event_winners (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id),
  position    smallint not null check (position > 0),
  student_id  uuid references public.students(id),
  team_id     uuid references public.teams(id),
  description text,
  is_approved boolean not null default false,
  created_at  timestamptz not null default now(),
  check (student_id is not null or team_id is not null)
);

-- ── 17. gallery_items (P1) ───────────────────────────────────
create table public.gallery_items (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  alt_text     text not null,
  storage_path text not null,
  uploaded_by  uuid references public.admin_profiles(id),
  is_approved  boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ── 18. roster_import_batches ────────────────────────────────
create table public.roster_import_batches (
  id              uuid primary key default gen_random_uuid(),
  imported_by     uuid references public.admin_profiles(id),
  filename        text,
  total_rows      integer,
  imported_rows   integer,
  error_rows      integer,
  status          text not null default 'pending'
                    check (status in ('pending','validating','committed','failed')),
  error_summary   text,
  committed_at    timestamptz,
  created_at      timestamptz not null default now()
);

-- ── 19. audit_logs ───────────────────────────────────────────
create table public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid,   -- admin_profile or student id
  actor_role   text,
  action       text not null,
  resource     text,
  resource_id  uuid,
  detail       jsonb,
  ip_address   inet,
  created_at   timestamptz not null default now()
);

-- Append-only: no UPDATE/DELETE permitted by RLS
create index audit_logs_actor_idx     on public.audit_logs(actor_id, created_at desc);
create index audit_logs_resource_idx  on public.audit_logs(resource, resource_id);

-- ── Seed: categories ─────────────────────────────────────────
insert into public.event_categories (name, slug, display_order) values
  ('Arts',           'arts',          1),
  ('Literature',     'literature',    2),
  ('Stage',          'stage',         3),
  ('Theatre',        'theatre',       4),
  ('Special Events', 'special-events',5);
