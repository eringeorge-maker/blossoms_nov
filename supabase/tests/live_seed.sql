-- ════════════════════════════════════════════════════════════════════════════
-- Live-site test data. KEPT until supabase/tests/live_cleanup.sql is run.
-- Everything is tagged so cleanup can find it:
--   students 9990001-9990009 (class "E2E Test Class"), events slug e2e-live-*,
--   fest teams "E2E Team …", admin super@e2e.blossoms.local (no password, cannot sign in).
--
--   npx supabase@2 db query --linked --project-ref ypxqtqmodcstqfnumcuq -f supabase/tests/live_seed.sql
-- ════════════════════════════════════════════════════════════════════════════
do $$
declare
  v_campus uuid; v_dept uuid; v_cat uuid;
  u_super uuid := gen_random_uuid(); p_super uuid; c_super text;
  c text[] := '{}'; sid uuid[]; k text; i int;
  e_solo uuid; e_team uuid; e_res_solo uuid; e_res_team uuid;
  v_j jsonb; t_red uuid; v_team1 uuid; v_team2 uuid;
begin
  if exists(select 1 from public.students where register_number like '999000_') then
    raise exception 'live test data already exists (run live_cleanup.sql first)';
  end if;

  select campus_id, department_id into v_campus, v_dept from public.students limit 1;
  select id into v_cat from public.event_categories order by display_order limit 1;

  -- seed-only super admin
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                          confirmation_token, recovery_token, email_change_token_new, email_change)
  values ('00000000-0000-0000-0000-000000000000', u_super, 'authenticated', 'authenticated', 'super@e2e.blossoms.local', '', now(),
          '{}', '{}', now(), now(), '', '', '', '');
  insert into public.admin_profiles (auth_user_id, full_name, email, role, is_active)
  values (u_super, 'E2E Super Admin', 'super@e2e.blossoms.local', 'super_admin', true) returning id into p_super;
  c_super := jsonb_build_object('sub', u_super, 'role', 'authenticated', 'email', 'super@e2e.blossoms.local')::text;

  -- 9 test students; accounts created through the real login RPC
  insert into public.students (register_number, full_name, campus_id, department_id, year_of_study, student_status, class_name, programme)
  select '999000' || n, 'E2E Student ' || n, v_campus, v_dept, 1, 'active', 'E2E Test Class', 'E2E'
    from generate_series(1, 9) n;
  for i in 1..9 loop
    k := '999000' || i;
    perform set_config('request.jwt.claims', '{"role":"anon"}', true); set local role anon;
    perform public.student_login_prepare(k);
    reset role;
    c := c || (select jsonb_build_object('sub', auth_user_id, 'role', 'authenticated', 'email', 's' || k || '@students.blossoms.local')::text
                 from public.students where register_number = k);
  end loop;
  select array_agg(id order by register_number) into sid from public.students where register_number like '999000_';

  -- phones for 1-6 only; 7-9 keep the "add your phone" gate so it can be seen in the browser
  for i in 1..6 loop
    perform set_config('request.jwt.claims', c[i], true); set local role authenticated;
    perform public.update_my_profile('98765000' || lpad(i::text, 2, '0'));
    reset role;
  end loop;

  -- fest teams
  insert into public.fest_teams (name, color, display_order) values ('E2E Team Red', '#E03131', 90) returning id into t_red;
  insert into public.fest_teams (name, color, display_order) values ('E2E Team Blue', '#1971C2', 91);
  insert into public.class_team_assignments (class_name, fest_team_id) values ('E2E Test Class', t_red);

  -- events
  insert into public.events (title, slug, category_id, event_format, min_team_size, max_team_size, capacity, waitlist_enabled,
                             cancellation_allowed, status, registration_enabled, registration_closed, is_mandatory)
  values ('E2E Solo Sing-off',      'e2e-live-solo',     v_cat, 'individual', null, null, 20,   true,  true, 'published', true, false, false),
         ('E2E Team Quiz',          'e2e-live-team',     v_cat, 'team',       2,    3,    null, false, true, 'published', true, false, false),
         ('E2E Results Solo Dance', 'e2e-live-res-solo', v_cat, 'individual', null, null, null, false, true, 'published', true, false, false),
         ('E2E Results Team Debate','e2e-live-res-team', v_cat, 'team',       2,    3,    null, false, true, 'published', true, false, false);
  select id into e_solo     from public.events where slug = 'e2e-live-solo';
  select id into e_team     from public.events where slug = 'e2e-live-team';
  select id into e_res_solo from public.events where slug = 'e2e-live-res-solo';
  select id into e_res_team from public.events where slug = 'e2e-live-res-team';
  insert into public.event_schedule_slots (event_id, starts_at, ends_at, status)
  values (e_solo,     now() + interval '7 days', now() + interval '7 days 1 hour', 'scheduled'),
         (e_team,     now() + interval '8 days', now() + interval '8 days 1 hour', 'scheduled'),
         (e_res_solo, now() + interval '2 days', now() + interval '2 days 1 hour', 'scheduled'),
         (e_res_team, now() + interval '2 days', now() + interval '2 days 2 hours', 'scheduled');

  -- registrations for the results events (students 1-3 solo, two teams)
  for i in 1..3 loop
    perform set_config('request.jwt.claims', c[i], true); set local role authenticated;
    v_j := public.register_individual_event(e_res_solo);
    reset role;
    if not coalesce((v_j ->> 'success')::boolean, false) then raise exception 'solo reg % failed: %', i, v_j; end if;
  end loop;
  perform set_config('request.jwt.claims', c[4], true); set local role authenticated;
  v_j := public.register_team_event(e_res_team, 'E2E Thunder', array['9990005']);
  reset role;
  v_team1 := (v_j ->> 'team_id')::uuid;
  if v_team1 is null then raise exception 'team 1 failed: %', v_j; end if;
  perform set_config('request.jwt.claims', c[6], true); set local role authenticated;
  v_j := public.register_team_event(e_res_team, 'E2E Lightning', array['9990001']);
  reset role;
  v_team2 := (v_j ->> 'team_id')::uuid;
  if v_team2 is null then raise exception 'team 2 failed: %', v_j; end if;

  -- attendance + winners (as super admin)
  perform set_config('request.jwt.claims', c_super, true); set local role authenticated;
  perform public.admin_mark_attendance(e_res_solo, sid[1:3], 'present');
  perform public.admin_mark_attendance(e_res_team, array[sid[4], sid[5], sid[6], sid[1]], 'present');
  perform public.admin_set_winners(e_res_solo, jsonb_build_array(
            jsonb_build_object('position', 1, 'student_id', sid[1]),
            jsonb_build_object('position', 2, 'student_id', sid[2]),
            jsonb_build_object('position', 3, 'student_id', sid[3])), true);
  perform public.admin_set_winners(e_res_team, jsonb_build_array(
            jsonb_build_object('position', 1, 'team_id', v_team1),
            jsonb_build_object('position', 2, 'team_id', v_team2)), true);
  reset role;

  raise notice 'LIVE_SEED ok: students=9, events=4, winners=5';
end $$;

select x ->> 'event_title' as event, x ->> 'position' as pos, x ->> 'winner_name' as winner
  from jsonb_array_elements(public.get_public_winners()) x where x ->> 'event_title' like 'E2E %';
