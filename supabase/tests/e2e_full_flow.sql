-- ════════════════════════════════════════════════════════════════════════════
-- Blossoms end-to-end flow test (database + permissions)
--
-- Runs the whole fest flow as the real roles would: visitor (anon), students,
-- a super admin and an event coordinator. Every call goes through the same
-- RPCs and row-level-security policies the website uses.
--
-- SAFE ON THE LIVE DATABASE: everything runs inside ONE DO block that always
-- ends by raising an exception, so Postgres rolls back every row it created
-- (test students, events, registrations, attendance, winners, teams, notices).
-- Nothing is left behind, pass or fail.
--
-- Run:  npm run test:e2e         (wraps the command below and prints a report)
--       npx supabase@2 db query --linked -f supabase/tests/e2e_full_flow.sql
--
-- Output: the final error message is the report. Lines start PASS / FAIL / WARN.
-- ════════════════════════════════════════════════════════════════════════════
do $e2e$
declare
  v_log   text := '';
  v_err   text;
  v_j     jsonb;
  v_n     bigint;
  v_b     boolean;
  v_t     text;

  -- fixtures
  v_campus uuid; v_dept uuid; v_cat uuid;
  c_anon  text := '{"role":"anon"}';
  u_super uuid := gen_random_uuid(); c_super text; p_super uuid;
  u_coord uuid := gen_random_uuid(); c_coord text; p_coord uuid;
  s1 uuid; s2 uuid; s3 uuid;
  c_s1 text; c_s2 text; c_s3 text;
  e_ind1 uuid; e_ind2 uuid; e_team uuid; e_mand uuid; e_closed uuid; e_draft uuid;
  v_ann_pub uuid; v_ann_draft uuid;
  v_reg uuid; v_team uuid; v_notif uuid; v_ft uuid;
  v_orig_min int;
  k text;
begin
  -- tiny assertion helper (only ever called while role is reset to postgres)
  execute $f$
    create function pg_temp.ck(p_ok boolean, p_label text, p_detail text default null)
    returns text language sql as $$
      select case when coalesce(p_ok, false) then 'PASS ' else 'FAIL ' end || p_label
             || case when coalesce(p_ok, false) or p_detail is null then '' else '  ->  ' || p_detail end || E'\n'
    $$ $f$;

  begin  -- body; any crash is reported instead of hiding the report
  -- ── 0. Fixtures ─────────────────────────────────────────────────────────────
  select campus_id, department_id into v_campus, v_dept from public.students limit 1;
  select id into v_cat from public.event_categories order by display_order limit 1;
  select min_chosen_events into v_orig_min from public.fest_settings;

  if exists(select 1 from public.students where register_number in ('9990001','9990002','9990003')) then
    raise exception 'register numbers 9990001-3 are taken by real students; change the test numbers';
  end if;

  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                          confirmation_token, recovery_token, email_change_token_new, email_change)
  values ('00000000-0000-0000-0000-000000000000', u_super, 'authenticated', 'authenticated', 'super@e2e.blossoms.local', '', now(),
          '{}', '{}', now(), now(), '', '', '', ''),
         ('00000000-0000-0000-0000-000000000000', u_coord, 'authenticated', 'authenticated', 'coord@e2e.blossoms.local', '', now(),
          '{}', '{}', now(), now(), '', '', '', '');
  insert into public.admin_profiles (auth_user_id, full_name, email, role, is_active)
  values (u_super, 'E2E Super Admin', 'super@e2e.blossoms.local', 'super_admin', true) returning id into p_super;
  insert into public.admin_profiles (auth_user_id, full_name, email, role, is_active)
  values (u_coord, 'E2E Coordinator', 'coord@e2e.blossoms.local', 'event_coordinator', true) returning id into p_coord;
  c_super := jsonb_build_object('sub', u_super, 'role', 'authenticated', 'email', 'super@e2e.blossoms.local')::text;
  c_coord := jsonb_build_object('sub', u_coord, 'role', 'authenticated', 'email', 'coord@e2e.blossoms.local')::text;

  insert into public.students (register_number, full_name, campus_id, department_id, year_of_study, student_status, class_name, programme)
  values ('9990001', 'Etoe Testone',   v_campus, v_dept, 1, 'active', 'E2E Test Class', 'E2E'),
         ('9990002', 'Etoe Testtwo',   v_campus, v_dept, 1, 'active', 'E2E Test Class', 'E2E'),
         ('9990003', 'Etoe Testthree', v_campus, v_dept, 1, 'active', 'E2E Test Class', 'E2E');
  select id into s1 from public.students where register_number = '9990001';
  select id into s2 from public.students where register_number = '9990002';
  select id into s3 from public.students where register_number = '9990003';

  insert into public.events (title, slug, category_id, event_format, min_team_size, max_team_size, capacity, waitlist_enabled,
                             cancellation_allowed, status, registration_enabled, registration_closed, is_mandatory)
  values ('E2E Solo Small',  'e2e-solo-small',  v_cat, 'individual', null, null, 1,    true,  true, 'published', true, false, false),
         ('E2E Solo Open',   'e2e-solo-open',   v_cat, 'individual', null, null, null, false, true, 'published', true, false, false),
         ('E2E Team',        'e2e-team',        v_cat, 'team',       2,    3,    null, false, true, 'published', true, false, false),
         ('E2E Mandatory',   'e2e-mandatory',   v_cat, 'individual', null, null, null, false, true, 'published', true, false, true),
         ('E2E Closed',      'e2e-closed',      v_cat, 'individual', null, null, null, false, true, 'published', true, true,  false),
         ('E2E Draft',       'e2e-draft',       v_cat, 'individual', null, null, null, false, true, 'draft',     true, false, false);
  select id into e_ind1   from public.events where slug = 'e2e-solo-small';
  select id into e_ind2   from public.events where slug = 'e2e-solo-open';
  select id into e_team   from public.events where slug = 'e2e-team';
  select id into e_mand   from public.events where slug = 'e2e-mandatory';
  select id into e_closed from public.events where slug = 'e2e-closed';
  select id into e_draft  from public.events where slug = 'e2e-draft';
  -- mandatory event already happened (yesterday); the rest are next week
  insert into public.event_schedule_slots (event_id, starts_at, ends_at, status)
  values (e_mand, now() - interval '1 day', now() - interval '1 day' + interval '1 hour', 'scheduled'),
         (e_ind1, now() + interval '7 days', now() + interval '7 days 1 hour', 'scheduled'),
         (e_ind2, now() + interval '7 days 2 hours', now() + interval '7 days 3 hours', 'scheduled'),  -- apart from solo small: clashes are refused (013)
         (e_team, now() + interval '8 days', now() + interval '8 days 1 hour', 'scheduled');
  v_log := v_log || pg_temp.ck(true, '0  fixtures created (3 students, 2 admins, 6 events)');

  -- ── 1. Announcements (admin console -> Notice Board) ────────────────────────
  perform set_config('request.jwt.claims', c_super, true); set local role authenticated;
  insert into public.announcements (title, body, severity, is_pinned, is_published, publish_at, created_by)
  values ('E2E notice', 'Hello from the E2E test', 'important', true, true, now(), p_super) returning id into v_ann_pub;
  insert into public.announcements (title, body, severity, is_pinned, is_published, created_by)
  values ('E2E draft notice', 'Not published', 'normal', false, false, p_super) returning id into v_ann_draft;
  update public.announcements set body = 'Edited by E2E' where id = v_ann_pub;
  reset role;
  v_log := v_log || pg_temp.ck(v_ann_pub is not null, '1a super admin can write and edit announcements');

  perform set_config('request.jwt.claims', c_anon, true); set local role anon;
  select count(*) filter (where id = v_ann_pub), count(*) filter (where id = v_ann_draft) into v_n, k
    from public.announcements where id in (v_ann_pub, v_ann_draft);
  reset role;
  v_log := v_log || pg_temp.ck(v_n = 1 and k::int = 0, '1b visitors see the published notice, not drafts', format('published=%s draft=%s', v_n, k));

  v_err := null;
  begin
    perform set_config('request.jwt.claims', c_coord, true); set local role authenticated;
    insert into public.announcements (title, body, is_published) values ('coord notice', 'x', true);
    reset role;
  exception when others then v_err := sqlerrm; end;
  v_log := v_log || pg_temp.ck(v_err is not null, '1c event coordinator cannot post announcements');

  v_err := null;
  begin
    perform set_config('request.jwt.claims', c_anon, true); set local role anon;
    insert into public.announcements (title, body, is_published) values ('anon notice', 'x', true);
    reset role;
  exception when others then v_err := sqlerrm; end;
  v_log := v_log || pg_temp.ck(v_err is not null, '1d visitors cannot post announcements');

  -- ── 2. Public site reads ────────────────────────────────────────────────────
  perform set_config('request.jwt.claims', c_anon, true); set local role anon;
  select count(*) filter (where id = e_ind1), count(*) filter (where id = e_draft) into v_n, k
    from public.events where id in (e_ind1, e_draft);
  reset role;
  v_log := v_log || pg_temp.ck(v_n = 1 and k::int = 0, '2a visitors see published events, not drafts');

  v_err := null;
  begin
    perform set_config('request.jwt.claims', c_anon, true); set local role anon;
    perform public.admin_dashboard_stats();
    reset role;
  exception when others then v_err := sqlerrm; end;
  v_log := v_log || pg_temp.ck(v_err is not null, '2b visitors cannot call admin stats');

  -- ── 3. Student login by register number ─────────────────────────────────────
  perform set_config('request.jwt.claims', c_anon, true); set local role anon;
  v_j := public.student_login_prepare('abc');
  reset role;
  v_log := v_log || pg_temp.ck(v_j ->> 'code' = 'INVALID', '3a login rejects a malformed register number', v_j::text);

  perform set_config('request.jwt.claims', c_anon, true); set local role anon;
  v_j := public.student_login_prepare('9990099');
  reset role;
  v_log := v_log || pg_temp.ck(v_j ->> 'code' = 'NOT_FOUND', '3b login rejects a number not on the list', v_j::text);

  foreach k in array array['9990001', '9990002', '9990003'] loop
    perform set_config('request.jwt.claims', c_anon, true); set local role anon;
    v_j := public.student_login_prepare(k);
    reset role;
    v_log := v_log || pg_temp.ck((v_j ->> 'ok')::boolean and v_j ->> 'email' = 's' || k || '@students.blossoms.local',
                                 '3c first login creates the account for ' || k, v_j::text);
  end loop;
  perform set_config('request.jwt.claims', c_anon, true); set local role anon;
  v_j := public.student_login_prepare('9990001');
  reset role;
  v_log := v_log || pg_temp.ck((v_j ->> 'ok')::boolean, '3d second login reuses the same account', v_j::text);

  select jsonb_build_object('sub', auth_user_id, 'role', 'authenticated', 'email', 's9990001@students.blossoms.local')::text into c_s1 from public.students where id = s1;
  select jsonb_build_object('sub', auth_user_id, 'role', 'authenticated', 'email', 's9990002@students.blossoms.local')::text into c_s2 from public.students where id = s2;
  select jsonb_build_object('sub', auth_user_id, 'role', 'authenticated', 'email', 's9990003@students.blossoms.local')::text into c_s3 from public.students where id = s3;

  perform set_config('request.jwt.claims', c_s1, true); set local role authenticated;
  v_j := public.get_session_profile();
  reset role;
  v_log := v_log || pg_temp.ck(v_j #>> '{student,register_number}' = '9990001' and coalesce(v_j -> 'admin', 'null'::jsonb) = 'null'::jsonb,
                               '3e signed-in student gets their own profile', v_j::text);

  perform set_config('request.jwt.claims', c_s1, true); set local role authenticated;
  select count(*) into v_n from public.students;
  reset role;
  v_log := v_log || pg_temp.ck(v_n = 1, '3f a student can only read their own student row', 'rows visible=' || v_n);

  -- ── 4. Profile (phone number gate) ──────────────────────────────────────────
  perform set_config('request.jwt.claims', c_s1, true); set local role authenticated;
  v_j := public.register_individual_event(e_ind2);
  reset role;
  v_log := v_log || pg_temp.ck(v_j ->> 'error_code' = 'PROFILE_INCOMPLETE', '4a cannot register before adding a phone number', v_j::text);

  perform set_config('request.jwt.claims', c_s1, true); set local role authenticated;
  v_j := public.update_my_profile('12345');
  reset role;
  v_log := v_log || pg_temp.ck(v_j ->> 'error_code' = 'INVALID_PHONE', '4b bad phone number rejected', v_j::text);

  perform set_config('request.jwt.claims', c_s1, true); set local role authenticated;
  v_j := public.update_my_profile('+91 98765 43210');
  reset role;
  v_log := v_log || pg_temp.ck(v_j ->> 'phone' = '9876543210', '4c phone saved with +91 stripped', v_j::text);
  perform set_config('request.jwt.claims', c_s2, true); set local role authenticated;
  perform public.update_my_profile('9876500002');
  reset role;
  perform set_config('request.jwt.claims', c_s3, true); set local role authenticated;
  perform public.update_my_profile('9876500003');
  reset role;
  select count(*) into v_n from public.students where id in (s1, s2, s3) and profile_complete;
  v_log := v_log || pg_temp.ck(v_n = 3, '4d all three test students have complete profiles');

  -- ── 5. Registration ─────────────────────────────────────────────────────────
  perform set_config('request.jwt.claims', c_s1, true); set local role authenticated;
  v_j := public.register_individual_event(e_ind1);
  reset role;
  v_log := v_log || pg_temp.ck(v_j ->> 'status' = 'confirmed', '5a individual registration confirmed', v_j::text);

  perform set_config('request.jwt.claims', c_s1, true); set local role authenticated;
  v_j := public.register_individual_event(e_ind1);
  reset role;
  v_log := v_log || pg_temp.ck(v_j ->> 'error_code' = 'ALREADY_REGISTERED', '5b double registration blocked', v_j::text);

  perform set_config('request.jwt.claims', c_s2, true); set local role authenticated;
  v_j := public.register_individual_event(e_ind1);
  reset role;
  v_log := v_log || pg_temp.ck(v_j ->> 'status' = 'waitlisted', '5c full event puts the next student on the waitlist', v_j::text);

  perform set_config('request.jwt.claims', c_s1, true); set local role authenticated;
  v_j := public.register_individual_event(e_mand);
  reset role;
  v_log := v_log || pg_temp.ck(v_j ->> 'error_code' = 'MANDATORY_EVENT', '5d mandatory events take no registration', v_j::text);

  perform set_config('request.jwt.claims', c_s1, true); set local role authenticated;
  v_j := public.register_individual_event(e_closed);
  reset role;
  v_log := v_log || pg_temp.ck(v_j ->> 'error_code' = 'REGISTRATION_CLOSED', '5e closed event rejects registration', v_j::text);

  perform set_config('request.jwt.claims', c_s1, true); set local role authenticated;
  v_j := public.register_individual_event(e_draft);
  reset role;
  v_log := v_log || pg_temp.ck(v_j ->> 'error_code' = 'EVENT_NOT_AVAILABLE', '5f draft event rejects registration', v_j::text);

  perform set_config('request.jwt.claims', c_s1, true); set local role authenticated;
  v_j := public.register_individual_event(e_team);
  reset role;
  v_log := v_log || pg_temp.ck(v_j ->> 'error_code' = 'INVALID_FORMAT', '5g team event refuses a solo entry', v_j::text);

  perform set_config('request.jwt.claims', c_s3, true); set local role authenticated;
  v_j := public.register_team_event(e_team, 'Solo Squad', array[]::text[]);
  reset role;
  v_log := v_log || pg_temp.ck(v_j ->> 'error_code' = 'TEAM_TOO_SMALL', '5h team below minimum size rejected', v_j::text);

  perform set_config('request.jwt.claims', c_s3, true); set local role authenticated;
  v_j := public.register_team_event(e_team, 'Ghost Squad', array['9990099']);
  reset role;
  v_log := v_log || pg_temp.ck(v_j ->> 'error_code' = 'MEMBER_NOT_FOUND', '5i unknown team member rejected', v_j::text);

  perform set_config('request.jwt.claims', c_s1, true); set local role authenticated;
  v_j := public.register_team_event(e_team, 'E2E Avengers', array['9990002']);
  reset role;
  v_team := (v_j ->> 'team_id')::uuid;
  v_log := v_log || pg_temp.ck(v_team is not null, '5j team registered with leader + member', v_j::text);

  perform set_config('request.jwt.claims', c_s3, true); set local role authenticated;
  v_j := public.register_team_event(e_team, 'e2e avengers', array['9990001']);
  reset role;
  v_log := v_log || pg_temp.ck(v_j ->> 'error_code' = 'TEAM_NAME_TAKEN', '5k duplicate team name (any case) rejected', v_j::text);

  perform set_config('request.jwt.claims', c_s3, true); set local role authenticated;
  v_j := public.register_team_event(e_team, 'Poachers', array['9990002']);
  reset role;
  v_log := v_log || pg_temp.ck(v_j ->> 'error_code' = 'MEMBER_ALREADY_REGISTERED', '5l member already in a team rejected', v_j::text);

  perform set_config('request.jwt.claims', c_s2, true); set local role authenticated;
  v_j := public.get_my_notifications();
  reset role;
  select (x ->> 'id')::uuid into v_notif from jsonb_array_elements(v_j) x where x ->> 'title' = 'Added to team E2E Avengers';
  v_log := v_log || pg_temp.ck(v_notif is not null, '5m team member gets an "added to team" notification');

  perform set_config('request.jwt.claims', c_s2, true); set local role authenticated;
  perform public.mark_notification(v_notif, 'read');
  v_j := public.get_my_notifications();
  reset role;
  select (x ->> 'read_at') is not null into v_b from jsonb_array_elements(v_j) x where (x ->> 'id')::uuid = v_notif;
  v_log := v_log || pg_temp.ck(v_b, '5n notification can be marked read');

  perform set_config('request.jwt.claims', c_s2, true); set local role authenticated;
  select (x ->> 'id')::uuid into v_reg from jsonb_array_elements(public.get_my_registrations()) x where (x ->> 'event_id')::uuid = e_team;
  v_j := public.cancel_event_registration(v_reg, 'test');
  reset role;
  v_log := v_log || pg_temp.ck(v_j ->> 'error_code' = 'TEAM_MEMBER', '5o only the team leader can withdraw the team', v_j::text);

  perform set_config('request.jwt.claims', c_s1, true); set local role authenticated;
  v_j := public.register_individual_event(e_ind2);
  v_reg := (v_j ->> 'registration_id')::uuid;
  v_j := public.cancel_event_registration(v_reg, 'changed mind');
  reset role;
  v_log := v_log || pg_temp.ck((v_j ->> 'success')::boolean, '5p student can cancel their own registration', v_j::text);

  perform set_config('request.jwt.claims', c_s1, true); set local role authenticated;
  v_j := public.register_individual_event(e_ind2);
  reset role;
  v_log := v_log || pg_temp.ck(v_j ->> 'status' = 'confirmed', '5q student can re-register after cancelling', v_j::text);

  perform set_config('request.jwt.claims', c_s1, true); set local role authenticated;
  v_n := jsonb_array_length(public.get_my_registrations());
  reset role;
  v_log := v_log || pg_temp.ck(v_n = 3, '5r My events lists solo small, solo open and the team', 'count=' || v_n);

  v_err := null;
  begin
    perform set_config('request.jwt.claims', c_s3, true); set local role authenticated;
    insert into public.event_registrations (event_id, student_id, registration_status) values (e_ind2, s3, 'confirmed');
    reset role;
  exception when others then v_err := sqlerrm; end;
  v_log := v_log || pg_temp.ck(v_err is not null, '5s students cannot write registrations directly (must use the RPC)');

  -- ── 6. Attendance ───────────────────────────────────────────────────────────
  v_err := null;
  begin
    perform set_config('request.jwt.claims', c_coord, true); set local role authenticated;
    perform public.admin_mark_attendance(e_ind1, array[s1], 'present');
    reset role;
  exception when others then v_err := sqlerrm; end;
  v_log := v_log || pg_temp.ck(v_err like 'FORBIDDEN%', '6a coordinator cannot mark an event they are not assigned to', v_err);

  v_err := null;
  begin
    perform set_config('request.jwt.claims', c_s1, true); set local role authenticated;
    perform public.admin_mark_attendance(e_ind1, array[s1], 'present');
    reset role;
  exception when others then v_err := sqlerrm; end;
  v_log := v_log || pg_temp.ck(v_err is not null, '6b students cannot mark attendance');

  perform set_config('request.jwt.claims', c_super, true); set local role authenticated;
  insert into public.event_coordinator_assignments (event_id, admin_profile_id) values (e_ind1, p_coord);
  reset role;
  perform set_config('request.jwt.claims', c_coord, true); set local role authenticated;
  v_j := public.admin_mark_attendance(e_ind1, array[s1], 'present');
  reset role;
  v_log := v_log || pg_temp.ck((v_j ->> 'updated')::int = 1, '6c assigned coordinator marks attendance', v_j::text);

  perform set_config('request.jwt.claims', c_super, true); set local role authenticated;
  perform public.admin_mark_attendance(e_ind2, array[s1], 'present');
  perform public.admin_mark_attendance(e_team, array[s1, s2], 'present');
  perform public.admin_mark_attendance(e_team, array[s2], 'absent');
  perform public.admin_mark_attendance(e_team, array[s2], 'present');   -- correcting a mistake
  v_j := public.admin_event_roster(e_mand);
  reset role;
  select count(*) into v_n from jsonb_array_elements(v_j) x
   where (x ->> 'student_id')::uuid in (s1, s2, s3) and x ->> 'registration_status' = 'mandatory';
  v_log := v_log || pg_temp.ck(v_n = 3, '6d mandatory event roster lists every student (no registration)', 'test students listed=' || v_n);
  select count(*) into v_n from public.event_attendance where event_id = e_team and student_id = s2 and status = 'present';
  v_log := v_log || pg_temp.ck(v_n = 1, '6e re-marking overwrites (absent -> present)');

  perform set_config('request.jwt.claims', c_super, true); set local role authenticated;
  perform public.admin_mark_attendance(e_mand, array[s3], 'absent');
  reset role;

  perform set_config('request.jwt.claims', c_s1, true); set local role authenticated;
  select x ->> 'attendance_status' into v_t from jsonb_array_elements(public.get_my_registrations()) x where (x ->> 'event_id')::uuid = e_ind1;
  reset role;
  v_log := v_log || pg_temp.ck(v_t = 'present', '6f student sees their attendance in My events', v_t);

  -- ── 7. Participation rules, defaulters, class stats ─────────────────────────
  -- s1: 3 chosen attended, not absent at mandatory -> complete
  -- s2: 1 chosen attended -> below the minimum (2)
  -- s3: 0 chosen, absent at mandatory -> not complete
  -- Completion also needs every real mandatory event to have been held, so 7b expects that.
  select string_agg(format('%s chosen=%s mand=%s/%s/%s done=%s', s.register_number, chosen_attended, mandatory_attended,
                           mandatory_held, mandatory_total, completed), '; ' order by s.register_number)
    into v_t from public.student_progress() sp join public.students s on s.id = sp.student_id where sp.student_id in (s1, s2, s3);
  select chosen_attended into v_n from public.student_progress() where student_id = s1;
  v_log := v_log || pg_temp.ck(v_n = 3, '7a chosen events attended counted (mandatory excluded)', v_t);
  select (mandatory_held = mandatory_total) = completed into v_b from public.student_progress() where student_id = s1;
  v_log := v_log || pg_temp.ck(v_b, '7b student who met the rule is complete (once all mandatory events are held)', v_t);
  select not completed into v_b from public.student_progress() where student_id = s3;
  v_log := v_log || pg_temp.ck(v_b, '7c student absent at a mandatory event is not complete', v_t);
  select mandatory_attended = mandatory_held - 1 into v_b from public.student_progress() where student_id = s3;
  v_log := v_log || pg_temp.ck(v_b, '7d mandatory: everyone counted present except those marked absent', v_t);

  perform set_config('request.jwt.claims', c_super, true); set local role authenticated;
  select string_agg(register_number, ',' order by register_number) into v_t
    from public.admin_defaulters('below_minimum', 'E2E Test Class');
  reset role;
  v_log := v_log || pg_temp.ck(v_t = '9990002,9990003', '7e defaulters (below minimum) = s2 and s3 only', v_t);

  foreach k in array array['registered_not_attended', 'attended_none', 'registered_none'] loop
    v_err := null;
    begin
      perform set_config('request.jwt.claims', c_super, true); set local role authenticated;
      perform count(*) from public.admin_defaulters(k, 'E2E Test Class');
      reset role;
    exception when others then v_err := sqlerrm; end;
    v_log := v_log || pg_temp.ck(v_err is null, '7f defaulter list "' || k || '" loads', v_err);
  end loop;

  perform set_config('request.jwt.claims', c_super, true); set local role authenticated;
  select students, completed::text into v_n, k from public.admin_class_list() where class_name = 'E2E Test Class';
  v_j := public.admin_dashboard_stats();
  reset role;
  v_log := v_log || pg_temp.ck(v_n = 3, '7g class list shows the test class with 3 students', format('students=%s completed=%s', v_n, k));
  v_log := v_log || pg_temp.ck(v_j #> '{totals,students_completed}' is not null and (v_j #>> '{rules,mandatory_total}')::int >= 1,
                               '7h overview stats include completion and rules', (v_j -> 'rules')::text);

  perform set_config('request.jwt.claims', c_coord, true); set local role authenticated;
  update public.fest_settings set min_chosen_events = 9 where id;
  reset role;
  select min_chosen_events into v_n from public.fest_settings;
  v_log := v_log || pg_temp.ck(v_n = v_orig_min, '7i coordinator cannot change the minimum', 'now=' || v_n);

  perform set_config('request.jwt.claims', c_super, true); set local role authenticated;
  update public.fest_settings set min_chosen_events = 1 where id;
  reset role;
  select chosen_attended >= min_chosen into v_b from public.student_progress() where student_id = s2;
  v_log := v_log || pg_temp.ck(v_b, '7j super admin lowers the minimum to 1 -> s2 now meets the chosen-event rule');

  -- ── 8. Winners / results ────────────────────────────────────────────────────
  v_err := null;
  begin
    perform set_config('request.jwt.claims', c_coord, true); set local role authenticated;
    perform public.admin_set_winners(e_team, jsonb_build_array(jsonb_build_object('position', 1, 'team_id', v_team)), true);
    reset role;
  exception when others then v_err := sqlerrm; end;
  v_log := v_log || pg_temp.ck(v_err like 'FORBIDDEN%', '8a coordinator cannot declare winners for an unassigned event', v_err);

  perform set_config('request.jwt.claims', c_super, true); set local role authenticated;
  v_j := public.admin_set_winners(e_team, jsonb_build_array(jsonb_build_object('position', 1, 'team_id', v_team)), true);
  perform public.admin_set_winners(e_ind1, jsonb_build_array(jsonb_build_object('position', 1, 'student_id', s1),
                                                              jsonb_build_object('position', 2, 'student_id', s2)), false);
  reset role;
  v_log := v_log || pg_temp.ck((v_j ->> 'count')::int = 1, '8b super admin declares winners', v_j::text);

  perform set_config('request.jwt.claims', c_anon, true); set local role anon;
  select count(*) into v_n from jsonb_array_elements(public.get_public_winners()) x where x ->> 'event_title' like 'E2E %';
  select string_agg(x ->> 'winner_name', ',') into v_t from jsonb_array_elements(public.get_public_winners()) x where x ->> 'event_title' = 'E2E Team';
  reset role;
  v_log := v_log || pg_temp.ck(v_n = 3 and v_t = 'E2E Avengers', '8c Results page shows winners (team name for team events)', format('rows=%s team=%s', v_n, v_t));

  perform set_config('request.jwt.claims', c_s2, true); set local role authenticated;
  select count(*) into v_n from jsonb_array_elements(public.get_my_notifications()) x where x ->> 'title' = 'Results: E2E Team';
  reset role;
  v_log := v_log || pg_temp.ck(v_n = 1, '8d registered student is notified of results');
  perform set_config('request.jwt.claims', c_s3, true); set local role authenticated;
  select count(*) into v_n from jsonb_array_elements(public.get_my_notifications()) x where x ->> 'title' = 'Results: E2E Team';
  reset role;
  v_log := v_log || pg_temp.ck(v_n = 0, '8e unregistered student is not notified about that event');

  -- ── 9. Teams, class mapping and scoreboard ──────────────────────────────────
  v_err := null;
  begin
    perform set_config('request.jwt.claims', c_coord, true); set local role authenticated;
    insert into public.fest_teams (name, color, display_order) values ('E2E Rogue', '#000000', 99);
    reset role;
  exception when others then v_err := sqlerrm; end;
  v_log := v_log || pg_temp.ck(v_err is not null, '9a coordinator cannot create fest teams');

  perform set_config('request.jwt.claims', c_super, true); set local role authenticated;
  insert into public.fest_teams (name, color, display_order) values ('E2E Team Red', '#E03131', 90) returning id into v_ft;
  insert into public.fest_teams (name, color, display_order) values ('E2E Team Blue', '#1971C2', 91);
  insert into public.class_team_assignments (class_name, fest_team_id) values ('E2E Test Class', v_ft);
  update public.fest_settings set leaderboard_public = false where id;
  select team_name into v_t from public.admin_class_list() where class_name = 'E2E Test Class';
  select classes into v_n from public.get_team_leaderboard() where team_id = v_ft;
  reset role;
  v_log := v_log || pg_temp.ck(v_t = 'E2E Team Red', '9b class assigned to a team shows in the class list', v_t);
  v_log := v_log || pg_temp.ck(v_n = 1, '9c admin scoreboard counts classes per team', 'classes=' || v_n);

  perform set_config('request.jwt.claims', c_anon, true); set local role anon;
  select count(*) into v_n from public.get_team_leaderboard();
  reset role;
  v_log := v_log || pg_temp.ck(v_n = 0, '9d standings hidden from visitors while switched off', 'rows=' || v_n);

  perform set_config('request.jwt.claims', c_anon, true); set local role anon;
  select count(*) into v_n from public.class_team_assignments;
  reset role;
  v_log := v_log || pg_temp.ck(v_n = 0, '9e class-to-team mapping is admin-only', 'rows=' || v_n);

  perform set_config('request.jwt.claims', c_super, true); set local role authenticated;
  update public.fest_settings set leaderboard_public = true where id;
  reset role;
  perform set_config('request.jwt.claims', c_anon, true); set local role anon;
  select count(*) into v_n from public.get_team_leaderboard() where name like 'E2E Team %';
  reset role;
  v_log := v_log || pg_temp.ck(v_n = 2, '9f standings visible to visitors once switched on', 'rows=' || v_n);
  v_log := v_log || 'WARN 9g team points are always 0: the points board is not built yet (waiting on the points rules)' || E'\n';

  -- ── 10. Admin broadcast notifications ───────────────────────────────────────
  perform set_config('request.jwt.claims', c_super, true); set local role authenticated;
  insert into public.notifications (title, body, audience, created_by) values ('E2E broadcast', 'to everyone', 'all', p_super);
  reset role;
  perform set_config('request.jwt.claims', c_s3, true); set local role authenticated;
  select count(*) into v_n from jsonb_array_elements(public.get_my_notifications()) x where x ->> 'title' = 'E2E broadcast';
  reset role;
  v_log := v_log || pg_temp.ck(v_n = 1, '10a broadcast notification reaches every student');

  v_err := null;
  begin
    perform set_config('request.jwt.claims', c_s3, true); set local role authenticated;
    insert into public.notifications (title, body, audience) values ('spam', 'x', 'all');
    reset role;
  exception when others then v_err := sqlerrm; end;
  v_log := v_log || pg_temp.ck(v_err is not null, '10b students cannot send notifications');

  -- ── 11. Coordinator limits (fixed in migration 009) ─────────────────────────
  perform set_config('request.jwt.claims', c_coord, true); set local role authenticated;
  update public.events set title = 'E2E Team (edited by coordinator)' where id = e_team;
  get diagnostics v_n = row_count;
  reset role;
  v_log := v_log || pg_temp.ck(v_n = 0, '11a coordinator cannot edit events they are not assigned to', 'rows changed=' || v_n);

  perform set_config('request.jwt.claims', c_coord, true); set local role authenticated;
  update public.events set organiser_contact = 'E2E coord' where id = e_ind1;
  get diagnostics v_n = row_count;
  reset role;
  v_log := v_log || pg_temp.ck(v_n = 1, '11b coordinator can still edit their assigned event', 'rows changed=' || v_n);

  v_err := null;
  begin
    perform set_config('request.jwt.claims', c_coord, true); set local role authenticated;
    insert into public.events (title, slug, category_id, status) values ('E2E rogue', 'e2e-rogue', v_cat, 'published');
    reset role;
  exception when others then v_err := sqlerrm; end;
  v_log := v_log || pg_temp.ck(v_err is not null, '11c coordinator cannot create events');

  v_err := null;
  begin
    perform set_config('request.jwt.claims', c_coord, true); set local role authenticated;
    insert into public.notifications (title, body, audience) values ('coord broadcast', 'x', 'all');
    reset role;
  exception when others then v_err := sqlerrm; end;
  v_log := v_log || pg_temp.ck(v_err is not null, '11d coordinator cannot send notifications to every student');

  perform set_config('request.jwt.claims', c_super, true); set local role authenticated;
  v_j := public.admin_mark_attendance(e_ind2, array[s1, s3], 'present');   -- s3 never registered for Solo Open
  reset role;
  select count(*) into v_n from public.event_attendance where event_id = e_ind2 and student_id = s3;
  v_log := v_log || pg_temp.ck(v_n = 0 and (v_j ->> 'skipped')::int = 1,
                               '11e attendance skipped for a student not registered for the event', v_j::text);

  -- ── 12. Audit trail ─────────────────────────────────────────────────────────
  select count(*) into v_n from public.audit_logs
   where action in ('register_individual', 'register_team', 'cancel_registration', 'mark_attendance', 'set_winners')
     and (resource_id in (e_ind1, e_ind2, e_team, e_mand, v_team) or actor_id in (s1, s2, s3, p_super, p_coord));
  v_log := v_log || pg_temp.ck(v_n >= 8, '12a audit log records registrations, attendance and winners', 'rows=' || v_n);

  exception when others then
    v_log := v_log || 'FAIL test crashed: ' || sqlerrm || E'\n';
  end;

  -- Always roll back: the report travels in the error message. The API cuts long
  -- messages, so send a summary, the passed step ids, then only FAIL/WARN lines.
  select format(E'E2E_REPORT pass=%s fail=%s warn=%s\nPASSED %s\n%s',
                count(*) filter (where l like 'PASS %'), count(*) filter (where l like 'FAIL %'), count(*) filter (where l like 'WARN %'),
                string_agg(split_part(substr(l, 6), ' ', 1), ',') filter (where l like 'PASS %'),
                coalesce(string_agg(l, E'\n') filter (where l not like 'PASS %'), ''))
    into v_t from unnest(string_to_array(rtrim(v_log, E'\n'), E'\n')) l;
  raise exception using message = v_t;
end $e2e$;
