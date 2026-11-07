-- Removes everything live_seed.sql (and browser testing on top of it) created.
-- Only touches tagged rows: students 999000x, events e2e-live-*, "E2E …" teams/notices,
-- admins @e2e.blossoms.local.
--   npx supabase@2 db query --linked --project-ref ypxqtqmodcstqfnumcuq -f supabase/tests/live_cleanup.sql
do $$
declare
  v_events uuid[]; v_students uuid[]; v_auth uuid[]; v_admins uuid[]; v_admin_auth uuid[];
begin
  select coalesce(array_agg(id), '{}') into v_events from public.events where slug like 'e2e-live-%';
  select coalesce(array_agg(id), '{}'), coalesce(array_agg(auth_user_id) filter (where auth_user_id is not null), '{}')
    into v_students, v_auth from public.students where register_number like '999000_';
  select coalesce(array_agg(id), '{}'), coalesce(array_agg(auth_user_id), '{}')
    into v_admins, v_admin_auth from public.admin_profiles where email like '%@e2e.blossoms.local';

  delete from public.event_winners where event_id = any(v_events);
  delete from public.event_attendance where event_id = any(v_events) or student_id = any(v_students);
  delete from public.team_members where team_id in (select id from public.teams where event_id = any(v_events))
                                     or student_id = any(v_students);
  delete from public.event_registrations where event_id = any(v_events) or student_id = any(v_students);
  delete from public.teams where event_id = any(v_events);
  delete from public.event_coordinator_assignments where event_id = any(v_events) or admin_profile_id = any(v_admins);
  delete from public.event_schedule_slots where event_id = any(v_events);
  delete from public.notifications where event_id = any(v_events) or student_id = any(v_students)
                                      or created_by = any(v_admins) or title like '%E2E%';
  delete from public.announcements where title like 'E2E%' or created_by = any(v_admins);
  delete from public.audit_logs where resource_id = any(v_events) or resource_id = any(v_students) or actor_id = any(v_admins);
  delete from public.events where id = any(v_events);
  delete from public.class_team_assignments where class_name = 'E2E Test Class';
  delete from public.fest_teams where name like 'E2E %';
  delete from public.students where id = any(v_students);
  delete from public.admin_profiles where id = any(v_admins);
  delete from auth.users where id = any(v_auth) or id = any(v_admin_auth);
  raise notice 'LIVE_CLEANUP done: events=%, students=%', coalesce(array_length(v_events, 1), 0), coalesce(array_length(v_students, 1), 0);
end $$;
