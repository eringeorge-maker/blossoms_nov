-- ════════════════════════════════════════════════════════════════════════════
-- Registration stress test against the REAL events (sessions, teams, limits,
-- mandatory events, cancellations, admin views).
--
-- SAFE ON THE LIVE DATABASE: one DO block that always ends by raising an
-- exception, so every row it creates (40 test students 9991001-9991040, their
-- registrations, teams, attendance, setting tweaks) is rolled back.
--
--   npx supabase@2 db query --linked -f supabase/tests/registration_stress.sql
--
-- Output: the final error message is the report. Lines start PASS / FAIL / WARN.
-- ════════════════════════════════════════════════════════════════════════════
do $t$
declare
  v_log text := '';
  v_j jsonb; v_j2 jsonb; v_n bigint; v_m bigint; v_t text; v_ok boolean;
  v_campus uuid; v_dept uuid;
  u_admin uuid := gen_random_uuid(); c_admin text; p_admin uuid;
  c text[] := '{}'; sid uuid[]; r text[] := '{}';
  i int; k int; v_start timestamptz; v_ms numeric;
  -- real events
  e_air uuid; e_debate uuid; e_mono uuid; e_potart uuid; e_mehendi uuid; e_impulse uuid; e_jam uuid;
  e_painting uuid; e_creative uuid; e_photo uuid; e_pot uuid; e_rangoli uuid; e_quiz uuid; e_duet uuid;
  e_street uuid; e_bobi uuid; e_bobw uuid; e_inaug uuid; e_proscenium uuid;
  d_am uuid; d_pm uuid; r_am uuid; r_pm uuid; m_am uuid; pot_slot uuid;
  v_reg uuid; v_team uuid; v_team2 uuid;
  v_expected int;
begin
  execute $f$
    create function pg_temp.ck(p_ok boolean, p_label text, p_detail text default null)
    returns text language sql as $$
      select case when coalesce(p_ok, false) then 'PASS ' else 'FAIL ' end || p_label
             || case when coalesce(p_ok, false) or p_detail is null then '' else '  ->  ' || p_detail end || E'\n'
    $$ $f$;
  execute $f$
    create function pg_temp.warn(p_label text) returns text language sql as $$ select 'WARN ' || p_label || E'\n' $$ $f$;

  begin
  -- ── 0. Fixtures ─────────────────────────────────────────────────────────────
  if exists(select 1 from public.students where register_number between '9991001' and '9991040') then
    raise exception 'register numbers 9991001-9991040 are taken; change the test numbers';
  end if;
  select campus_id, department_id into v_campus, v_dept from public.students where register_number not like '999%' limit 1;

  select id into e_air      from public.events where slug = 'air-crash-shipwreck';
  select id into e_debate   from public.events where slug = 'debate';
  select id into e_mono     from public.events where slug = 'mono-act';
  select id into e_potart   from public.events where slug = 'pot-art';
  select id into e_mehendi  from public.events where slug = 'mehendi-design';
  select id into e_impulse  from public.events where slug = 'impulse';
  select id into e_jam      from public.events where slug = 'jam';
  select id into e_painting from public.events where slug = 'painting';
  select id into e_creative from public.events where slug = 'creative-writing';
  select id into e_photo    from public.events where slug = 'photography';
  select id into e_pot      from public.events where slug = 'pot-pourri';
  select id into e_rangoli  from public.events where slug = 'rangoli-design';
  select id into e_quiz     from public.events where slug = 'quiz';
  select id into e_duet     from public.events where slug = 'dance-duet';
  select id into e_street   from public.events where slug = 'street-play';
  select id into e_bobi     from public.events where slug = 'bob-i';
  select id into e_bobw     from public.events where slug = 'bob-w';
  select id into e_inaug    from public.events where slug = 'doc-inauguration';
  select id into e_proscenium from public.events where slug = 'proscenium';
  select id into d_am from public.event_schedule_slots where event_id = e_debate order by starts_at limit 1;
  select id into d_pm from public.event_schedule_slots where event_id = e_debate order by starts_at desc limit 1;
  select id into r_am from public.event_schedule_slots where event_id = e_rangoli order by starts_at limit 1;
  select id into r_pm from public.event_schedule_slots where event_id = e_rangoli order by starts_at desc limit 1;
  select id into m_am from public.event_schedule_slots where event_id = e_mehendi order by starts_at limit 1;
  select id into pot_slot from public.event_schedule_slots where event_id = e_pot limit 1;

  -- admin (super) for roster / attendance checks
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                          confirmation_token, recovery_token, email_change_token_new, email_change)
  values ('00000000-0000-0000-0000-000000000000', u_admin, 'authenticated', 'authenticated', 'stress@e2e.blossoms.local', '', now(),
          '{}', '{}', now(), now(), '', '', '', '');
  insert into public.admin_profiles (auth_user_id, full_name, email, role, is_active)
  values (u_admin, 'Stress Admin', 'stress@e2e.blossoms.local', 'super_admin', true) returning id into p_admin;
  c_admin := jsonb_build_object('sub', u_admin, 'role', 'authenticated', 'email', 'stress@e2e.blossoms.local')::text;

  -- 40 students; 1-38 complete their profile, 39 never adds a phone, 40 is inactive
  insert into public.students (register_number, full_name, campus_id, department_id, year_of_study, student_status, class_name, programme)
  select '99910' || lpad(n::text, 2, '0'), 'Stress Student ' || n, v_campus, v_dept, 1,
         case when n = 40 then 'inactive' else 'active' end,'Stress Class ' || ((n - 1) / 10 + 1), 'STRESS'
    from generate_series(1, 40) n;
  for i in 1..39 loop
    r := r || ('99910' || lpad(i::text, 2, '0'));
    perform set_config('request.jwt.claims', '{"role":"anon"}', true); set local role anon;
    v_j := public.student_login_prepare(r[i]);
    reset role;
    c := c || (select jsonb_build_object('sub', auth_user_id, 'role', 'authenticated', 'email', 's' || r[i] || '@students.blossoms.local')::text
                 from public.students where register_number = r[i]);
    if i <= 38 then
      perform set_config('request.jwt.claims', c[i], true); set local role authenticated;
      v_j := public.update_my_profile('97000' || lpad(i::text, 5, '0'));
      reset role;
    end if;
  end loop;
  r := r || '9991040'::text;
  select array_agg(id order by register_number) into sid from public.students where register_number between '9991001' and '9991040';
  select count(*) into v_n from public.students where register_number between '9991001' and '9991039' and auth_user_id is not null;
  v_log := v_log || pg_temp.ck(v_n = 39, '0  39 active test students can sign in (account created by login)', 'accounts=' || v_n);

  -- ── 1. Many students x many individual events ───────────────────────────────
  -- Students 1-30 each register for 8 individual events (sessions picked alternately).
  v_start := clock_timestamp();
  v_n := 0; v_m := 0; v_t := '';
  for i in 1..30 loop
    perform set_config('request.jwt.claims', c[i], true); set local role authenticated;
    for v_j2 in select x from jsonb_array_elements(jsonb_build_array(
        public.register_individual_event(e_air),
        public.register_individual_event(e_debate, case when i % 2 = 0 then d_am else d_pm end),
        public.register_individual_event(e_mono),
        public.register_individual_event(e_potart),
        public.register_individual_event(e_mehendi, m_am),
        public.register_individual_event(e_jam, (select id from public.event_schedule_slots where event_id = e_jam order by starts_at offset (i % 2) limit 1)),
        public.register_individual_event(e_creative),
        public.register_individual_event(e_photo))) x loop
      if (v_j2->>'success')::boolean then v_n := v_n + 1; else v_m := v_m + 1; v_t := v_t || coalesce(v_j2->>'error_code', '?') || ' '; end if;
    end loop;
    reset role;
  end loop;
  v_ms := extract(epoch from clock_timestamp() - v_start) * 1000;
  v_log := v_log || pg_temp.ck(v_n = 240 and v_m = 0, '1a 30 students x 8 individual events = 240 registrations', format('ok=%s failed=%s %s', v_n, v_m, v_t));
  v_log := v_log || pg_temp.ck(v_ms / 240 < 100, format('1b speed: %s ms per registration', round(v_ms / 240, 1)));

  select count(*) into v_n from public.event_registrations where event_id = e_debate and student_id = any(sid) and slot_id = d_am;
  select count(*) into v_m from public.event_registrations where event_id = e_debate and student_id = any(sid) and slot_id = d_pm;
  v_log := v_log || pg_temp.ck(v_n = 15 and v_m = 15, '1c Debate: sessions stored as chosen (15 morning / 15 evening)', format('am=%s pm=%s', v_n, v_m));
  select count(*) into v_n from public.event_registrations where event_id = e_air and student_id = any(sid) and slot_id is not null;
  v_log := v_log || pg_temp.ck(v_n = 30, '1d one-session event (Air Crash) gets its session filled in automatically', 'with slot=' || v_n);

  perform set_config('request.jwt.claims', c[5], true); set local role authenticated;
  v_j := public.get_my_registrations();
  reset role;
  v_log := v_log || pg_temp.ck(jsonb_array_length(v_j) = 8, '1e My Events lists all 8 registrations for one student', 'count=' || jsonb_array_length(v_j));

  -- ── 2. Rejections for individual events ─────────────────────────────────────
  perform set_config('request.jwt.claims', c[31], true); set local role authenticated;
  v_j := public.register_individual_event(e_debate);
  reset role;
  v_log := v_log || pg_temp.ck(v_j->>'error_code' = 'SESSION_REQUIRED', '2a two-session event without a session is refused', v_j::text);

  perform set_config('request.jwt.claims', c[31], true); set local role authenticated;
  v_j := public.register_individual_event(e_debate, r_am);
  reset role;
  v_log := v_log || pg_temp.ck(v_j->>'error_code' = 'INVALID_SESSION', '2b session from another event is refused', v_j::text);

  perform set_config('request.jwt.claims', c[1], true); set local role authenticated;
  v_j := public.register_individual_event(e_air);
  reset role;
  v_log := v_log || pg_temp.ck(v_j->>'error_code' = 'ALREADY_REGISTERED', '2c registering twice is refused', v_j::text);

  perform set_config('request.jwt.claims', c[39], true); set local role authenticated;
  v_j := public.register_individual_event(e_air);
  reset role;
  v_log := v_log || pg_temp.ck(v_j->>'error_code' = 'PROFILE_INCOMPLETE', '2d student without a phone number is asked to add it', v_j::text);

  perform set_config('request.jwt.claims', '{"role":"anon"}', true); set local role anon;
  v_j := public.student_login_prepare(r[40]);
  reset role;
  v_log := v_log || pg_temp.ck((v_j->>'ok')::boolean is false, '2e inactive student cannot sign in', v_j::text);

  perform set_config('request.jwt.claims', c[31], true); set local role authenticated;
  v_j := public.register_individual_event(e_pot);
  v_j2 := public.register_individual_event(e_inaug);
  reset role;
  v_log := v_log || pg_temp.ck(v_j->>'error_code' = 'INVALID_FORMAT', '2f individual sign-up for a team event is refused', v_j::text);
  v_log := v_log || pg_temp.ck(v_j2->>'error_code' = 'NO_REGISTRATION', '2g Inauguration takes no registrations', v_j2::text);

  perform set_config('request.jwt.claims', '{"role":"anon"}', true); set local role anon;
  v_ok := false;
  begin v_j := public.register_individual_event(e_air); v_ok := (v_j->>'error_code') = 'UNAUTHORIZED';
  exception when others then v_ok := true; end;
  reset role;
  v_log := v_log || pg_temp.ck(v_ok, '2h a visitor who is not signed in cannot register');

  -- ── 3. Team events ──────────────────────────────────────────────────────────
  -- Pot Pourri (3 exactly): 10 teams from students 1-30
  v_n := 0; v_t := '';
  for k in 0..9 loop
    perform set_config('request.jwt.claims', c[k * 3 + 1], true); set local role authenticated;
    v_j := public.register_team_event(e_pot, 'Stress Pot ' || k, array[r[k * 3 + 2], r[k * 3 + 3]]);
    reset role;
    if (v_j->>'success')::boolean then v_n := v_n + 1; else v_t := v_t || v_j::text; end if;
  end loop;
  select count(*) into v_m from public.event_registrations where event_id = e_pot and student_id = any(sid) and registration_status = 'confirmed' and slot_id = pot_slot;
  v_log := v_log || pg_temp.ck(v_n = 10 and v_m = 30, '3a Pot Pourri: 10 teams of 3 (30 students) registered with the session', format('teams=%s members=%s %s', v_n, v_m, v_t));

  perform set_config('request.jwt.claims', c[31], true); set local role authenticated;
  v_j := public.register_team_event(e_pot, 'Too Small', array[r[32]]);
  v_j2 := public.register_team_event(e_pot, 'Too Big', array[r[32], r[33], r[34]]);
  reset role;
  v_log := v_log || pg_temp.ck(v_j->>'error_code' = 'TEAM_TOO_SMALL', '3b team below the minimum size is refused', v_j::text);
  v_log := v_log || pg_temp.ck(v_j2->>'error_code' = 'TEAM_TOO_LARGE', '3c team above the maximum size is refused', v_j2::text);

  perform set_config('request.jwt.claims', c[31], true); set local role authenticated;
  v_j := public.register_team_event(e_pot, 'Poach', array[r[1], r[32]]);
  v_j2 := public.register_team_event(e_pot, 'STRESS POT 0', array[r[32], r[33]]);
  reset role;
  v_log := v_log || pg_temp.ck(v_j->>'error_code' = 'MEMBER_ALREADY_REGISTERED', '3d a student already in another team cannot be added', v_j::text);
  v_log := v_log || pg_temp.ck(v_j2->>'error_code' = 'TEAM_NAME_TAKEN', '3e team names are unique per event (any letter case)', v_j2::text);

  perform set_config('request.jwt.claims', c[31], true); set local role authenticated;
  v_j := public.register_team_event(e_pot, 'Ghosts', array['0000000', r[32]]);
  v_j2 := public.register_team_event(e_pot, 'Inactive mate', array[r[40], r[32]]);
  reset role;
  v_log := v_log || pg_temp.ck(v_j->>'error_code' = 'MEMBER_NOT_FOUND', '3f unknown register number is refused', v_j::text);
  v_log := v_log || pg_temp.ck(v_j2->>'error_code' = 'MEMBER_NOT_FOUND', '3g inactive student cannot be added to a team', v_j2::text);

  perform set_config('request.jwt.claims', c[31], true); set local role authenticated;
  v_j := public.register_team_event(e_pot, 'Dupes', array[r[32], r[32], r[31]]);
  reset role;
  v_log := v_log || pg_temp.ck(v_j->>'error_code' = 'TEAM_TOO_SMALL', '3h repeated members are counted once', v_j::text);

  perform set_config('request.jwt.claims', c[31], true); set local role authenticated;
  v_j := public.register_team_event(e_rangoli, 'Rangoli A', array[r[32], r[33], r[34]]);
  v_j2 := public.register_team_event(e_rangoli, 'Rangoli A', array[r[32], r[33], r[34]], r_am);
  reset role;
  v_log := v_log || pg_temp.ck(v_j->>'error_code' = 'SESSION_REQUIRED', '3i two-session team event needs a session', v_j::text);
  v_log := v_log || pg_temp.ck((v_j2->>'success')::boolean, '3j Rangoli team of 4 registered for the morning session', v_j2::text);
  v_team := (v_j2->>'team_id')::uuid;
  select count(*) into v_n from public.event_registrations where team_id = v_team and slot_id = r_am;
  v_log := v_log || pg_temp.ck(v_n = 4, '3k every team member is in the team''s session', 'members in session=' || v_n);

  -- Street Play: 20 members (15-25)
  perform set_config('request.jwt.claims', c[1], true); set local role authenticated;
  v_j := public.register_team_event(e_street, 'Stress Street', r[2:20]);
  reset role;
  v_log := v_log || pg_temp.ck((v_j->>'success')::boolean, '3l Street Play team of 20 registered', v_j::text);
  select count(*) into v_n from public.notifications where student_id = any(sid[2:20]) and title like 'Added to team Stress Street%';
  v_log := v_log || pg_temp.ck(v_n = 19, '3m all 19 teammates are told they were added', 'notified=' || v_n);

  perform set_config('request.jwt.claims', c[21], true); set local role authenticated;
  v_j := public.register_individual_event(e_street);
  v_j2 := public.register_team_event(e_duet, 'Duo', array[r[22]]);
  reset role;
  v_log := v_log || pg_temp.ck(v_j->>'error_code' = 'INVALID_FORMAT', '3n individual sign-up for Street Play is refused', v_j::text);
  v_log := v_log || pg_temp.ck((v_j2->>'success')::boolean, '3o Indian Duet Dance pair registered', v_j2::text);

  -- Team member cannot cancel or move; leader can
  select id into v_reg from public.event_registrations where event_id = e_rangoli and student_id = sid[32];
  perform set_config('request.jwt.claims', c[32], true); set local role authenticated;
  v_j := public.cancel_event_registration(v_reg);
  v_j2 := public.change_my_session(v_reg, r_pm);
  reset role;
  v_log := v_log || pg_temp.ck(v_j->>'error_code' = 'TEAM_MEMBER', '3p team member cannot withdraw the team', v_j::text);
  v_log := v_log || pg_temp.ck(v_j2->>'error_code' = 'TEAM_MEMBER', '3q team member cannot move the team''s session', v_j2::text);

  select id into v_reg from public.event_registrations where event_id = e_rangoli and student_id = sid[31];
  perform set_config('request.jwt.claims', c[31], true); set local role authenticated;
  v_j := public.change_my_session(v_reg, r_pm);
  reset role;
  select count(*) into v_n from public.event_registrations where team_id = v_team and slot_id = r_pm;
  select count(*) into v_m from public.notifications where student_id = any(sid[32:34]) and title = 'Session changed';
  v_log := v_log || pg_temp.ck((v_j->>'success')::boolean and v_n = 4 and v_m = 3, '3r leader moves the whole team to the evening and teammates are told',
                               format('%s moved=%s notified=%s', v_j, v_n, v_m));

  -- Leader withdraws, then the members can join other teams
  perform set_config('request.jwt.claims', c[31], true); set local role authenticated;
  v_j := public.cancel_event_registration(v_reg);
  reset role;
  select count(*) into v_n from public.event_registrations where team_id = v_team and registration_status = 'cancelled';
  v_log := v_log || pg_temp.ck((v_j->>'success')::boolean and v_n = 4, '3s leader withdraws the team: all 4 entries cancelled', format('%s cancelled=%s', v_j, v_n));
  perform set_config('request.jwt.claims', c[32], true); set local role authenticated;
  v_j := public.register_team_event(e_rangoli, 'Rangoli A', array[r[33], r[34], r[35]], r_pm);
  reset role;
  v_log := v_log || pg_temp.ck((v_j->>'success')::boolean, '3t after withdrawal, members and the team name can be reused', v_j::text);

  -- ── 4. Cancel, re-register, switch session (individual) ─────────────────────
  select id into v_reg from public.event_registrations where event_id = e_debate and student_id = sid[2];
  perform set_config('request.jwt.claims', c[2], true); set local role authenticated;
  v_j := public.change_my_session(v_reg, d_pm);
  reset role;
  select slot_id = d_pm into v_ok from public.event_registrations where id = v_reg;
  v_log := v_log || pg_temp.ck((v_j->>'success')::boolean and v_ok, '4a student switches Debate from morning to evening', v_j::text);

  perform set_config('request.jwt.claims', c[2], true); set local role authenticated;
  v_j := public.cancel_event_registration(v_reg);
  v_j2 := public.register_individual_event(e_debate, d_am);
  reset role;
  select count(*) into v_n from public.event_registrations where event_id = e_debate and student_id = sid[2];
  v_log := v_log || pg_temp.ck((v_j->>'success')::boolean and (v_j2->>'success')::boolean and v_n = 1,
                               '4b cancel then register again reuses the same entry', format('%s / %s rows=%s', v_j, v_j2, v_n));

  perform set_config('request.jwt.claims', c[3], true); set local role authenticated;
  v_j := public.cancel_event_registration(v_reg);
  reset role;
  v_log := v_log || pg_temp.ck(v_j->>'error_code' = 'NOT_FOUND', '4c a student cannot cancel someone else''s registration', v_j::text);

  -- ── 5. Seat limits per session, waitlist, closing ───────────────────────────
  -- Free one evening seat (student 1 cancels), then cap each session at the morning's current size.
  select id into v_reg from public.event_registrations where event_id = e_debate and student_id = sid[1];
  perform set_config('request.jwt.claims', c[1], true); set local role authenticated;
  perform public.cancel_event_registration(v_reg);
  reset role;
  select count(*) into v_n from public.event_registrations where event_id = e_debate and slot_id = d_am and registration_status = 'confirmed';
  update public.events set capacity = v_n where id = e_debate;
  perform set_config('request.jwt.claims', c[31], true); set local role authenticated;
  v_j := public.register_individual_event(e_debate, d_am);
  v_j2 := public.register_individual_event(e_debate, d_pm);
  reset role;
  v_log := v_log || pg_temp.ck(v_j->>'error_code' = 'CAPACITY_FULL' and (v_j2->>'success')::boolean,
                               format('5a seat limit %s per session: full morning refuses, evening (one seat free) accepts', v_n), format('%s / %s', v_j, v_j2));

  select id into v_reg from public.event_registrations where event_id = e_debate and student_id = sid[31];
  perform set_config('request.jwt.claims', c[31], true); set local role authenticated;
  v_j := public.change_my_session(v_reg, d_am);
  reset role;
  v_log := v_log || pg_temp.ck(v_j->>'error_code' = 'CAPACITY_FULL', '5b cannot switch into a full session', v_j::text);

  update public.events set waitlist_enabled = true where id = e_debate;
  perform set_config('request.jwt.claims', c[32], true); set local role authenticated;
  v_j := public.register_individual_event(e_debate, d_am);
  reset role;
  v_log := v_log || pg_temp.ck(v_j->>'status' = 'waitlisted', '5c with a waitlist, the next student is waitlisted', v_j::text);

  select id into v_reg from public.event_registrations where event_id = e_debate and student_id = sid[4];
  perform set_config('request.jwt.claims', c[4], true); set local role authenticated;
  v_j := public.cancel_event_registration(v_reg);
  reset role;
  select registration_status::text into v_t from public.event_registrations where event_id = e_debate and student_id = sid[32];
  if v_t = 'confirmed' then
    v_log := v_log || pg_temp.ck(true, '5d a freed seat goes to the waitlisted student');
  else
    v_log := v_log || pg_temp.warn('5d a freed seat is NOT given to the waitlisted student automatically (still ' || v_t || '); no event uses a waitlist today');
  end if;

  update public.events set registration_closes_at = now() - interval '1 minute' where id = e_jam;
  select id into v_reg from public.event_registrations where event_id = e_jam and student_id = sid[1];
  perform set_config('request.jwt.claims', c[31], true); set local role authenticated;
  v_j := public.register_individual_event(e_jam, (select id from public.event_schedule_slots where event_id = e_jam limit 1));
  reset role;
  perform set_config('request.jwt.claims', c[1], true); set local role authenticated;
  v_j2 := public.cancel_event_registration(v_reg);
  v_t := public.change_my_session(v_reg, (select id from public.event_schedule_slots where event_id = e_jam order by starts_at desc limit 1))->>'error_code';
  reset role;
  v_log := v_log || pg_temp.ck(v_j->>'error_code' = 'REGISTRATION_CLOSED' and v_j2->>'error_code' = 'CANCELLATION_CLOSED' and v_t = 'REGISTRATION_CLOSED',
                               '5e after the deadline: no new sign-ups, cancels or session changes', format('%s / %s / %s', v_j, v_j2, v_t));

  update public.events set registration_closed = true where id = e_painting;
  perform set_config('request.jwt.claims', c[31], true); set local role authenticated;
  v_j := public.register_individual_event(e_painting, (select id from public.event_schedule_slots where event_id = e_painting limit 1));
  reset role;
  v_log := v_log || pg_temp.ck(v_j->>'error_code' = 'REGISTRATION_CLOSED', '5f admin "close registration" switch blocks sign-ups', v_j::text);

  -- ── 6. Mandatory events (switched on and off the way the admin event editor does) ──
  perform set_config('request.jwt.claims', c_admin, true); set local role authenticated;
  update public.events set is_mandatory = true, registration_enabled = true where id = e_inaug;
  reset role;
  select is_mandatory into v_ok from public.events where id = e_inaug;
  perform set_config('request.jwt.claims', c[33], true); set local role authenticated;
  v_j := public.register_individual_event(e_inaug);
  reset role;
  v_log := v_log || pg_temp.ck(v_ok and v_j->>'error_code' = 'MANDATORY_EVENT', '6a admin marks an event mandatory; it then takes no registration', v_j::text);

  -- an event that already has sign-ups can be made mandatory and back again
  perform set_config('request.jwt.claims', c_admin, true); set local role authenticated;
  update public.events set is_mandatory = true where id = e_mono;
  select jsonb_array_length(public.admin_event_roster(e_mono)) into v_n;
  reset role;
  select count(*) into v_m from public.students where student_status = 'active';
  perform set_config('request.jwt.claims', c[34], true); set local role authenticated;
  v_j := public.register_individual_event(e_mono);
  reset role;
  v_log := v_log || pg_temp.ck(v_n = v_m and v_j->>'error_code' = 'MANDATORY_EVENT',
                               '6e while mandatory: attendance list shows every active student and sign-ups stop', format('roster=%s active=%s %s', v_n, v_m, v_j));
  perform set_config('request.jwt.claims', c_admin, true); set local role authenticated;
  update public.events set is_mandatory = false where id = e_mono;
  reset role;
  select count(*) into v_n from public.event_registrations where event_id = e_mono and student_id = any(sid) and registration_status = 'confirmed';
  perform set_config('request.jwt.claims', c[34], true); set local role authenticated;
  v_j := public.register_individual_event(e_mono);
  reset role;
  v_log := v_log || pg_temp.ck(v_n = 30 and (v_j->>'success')::boolean,
                               '6f switched back: the 30 earlier sign-ups are kept and new sign-ups work again', format('kept=%s %s', v_n, v_j));

  perform set_config('request.jwt.claims', c[1], true); set local role authenticated;
  v_ok := false;
  begin
    update public.events set is_mandatory = true where id = e_air;
    get diagnostics v_n = row_count;
    v_ok := v_n = 0;
  exception when others then v_ok := true; end;
  reset role;
  v_log := v_log || pg_temp.ck(v_ok, '6g a student cannot change an event''s mandatory setting');

  perform set_config('request.jwt.claims', c_admin, true); set local role authenticated;
  v_j := public.admin_mark_attendance(e_inaug, sid[1:10], 'absent');
  v_j2 := public.admin_mark_attendance(e_air, array[sid[1], sid[35]], 'present');
  reset role;
  v_log := v_log || pg_temp.ck((v_j->>'updated')::int = 10, '6b attendance on a mandatory event accepts unregistered students', v_j::text);
  v_log := v_log || pg_temp.ck((v_j2->>'updated')::int = 1 and (v_j2->>'skipped')::int = 1,
                               '6c attendance on a normal event skips students who did not register', v_j2::text);

  -- mark Inauguration as held (yesterday), then check completion maths for the stress students
  update public.event_schedule_slots set starts_at = now() - interval '1 day', ends_at = now() - interval '23 hours' where event_id = e_inaug;
  perform set_config('request.jwt.claims', c_admin, true); set local role authenticated;
  perform public.admin_mark_attendance(e_creative, sid[11:12], 'present');
  perform public.admin_mark_attendance(e_photo, sid[11:12], 'present');
  perform public.admin_mark_attendance(e_creative, sid[1:1], 'present');
  perform public.admin_mark_attendance(e_photo, sid[1:1], 'present');
  reset role;
  select count(*) filter (where completed), count(*) filter (where sp.student_id = sid[11] and completed), count(*) filter (where sp.student_id = sid[1] and completed)
    into v_n, v_m, k from public.student_progress() sp where sp.student_id = any(sid);
  v_log := v_log || pg_temp.ck(v_m = 1 and k = 0,
                               '6d 2 events attended + present at mandatory = complete; absent at mandatory = not complete',
                               format('completed=%s s11=%s s1(absent at mandatory)=%s', v_n, v_m, k));

  -- ── 7. Admin views with the load ────────────────────────────────────────────
  perform set_config('request.jwt.claims', c_admin, true); set local role authenticated;
  select count(*), count(*) filter (where (x->>'slot_id')::uuid = d_am), count(*) filter (where (x->>'slot_id')::uuid = d_pm)
    into v_n, v_m, k from jsonb_array_elements(public.admin_event_roster(e_debate)) x;
  v_j := public.admin_dashboard_stats();
  select count(*) into v_expected from public.admin_defaulters('registered_none', null);
  reset role;
  v_log := v_log || pg_temp.ck(v_n >= 31 and v_m > 0 and k > 0, '7a Debate roster shows everyone with their session', format('rows=%s am=%s pm=%s', v_n, v_m, k));
  v_log := v_log || pg_temp.ck(v_j is not null, '7b admin dashboard loads');
  v_log := v_log || pg_temp.ck(v_expected > 0, '7c defaulters list loads', 'rows=' || v_expected);

  perform set_config('request.jwt.claims', c[1], true); set local role authenticated;
  v_ok := false;
  begin perform * from public.admin_event_roster(e_debate); exception when others then v_ok := true; end;
  select count(*) into v_n from public.event_registrations where student_id <> sid[1];
  reset role;
  v_log := v_log || pg_temp.ck(v_ok, '7d students cannot open the admin roster');
  v_log := v_log || pg_temp.ck(v_n = 0, '7e students cannot read other students'' registrations', 'visible=' || v_n);

  -- ── 8. Time clashes ─────────────────────────────────────────────────────────
  perform set_config('request.jwt.claims', c[21], true); set local role authenticated;
  v_j := public.register_team_event(e_bobi, 'Clash Band I', r[22:26]);
  v_j2 := public.register_team_event(e_bobw, 'Clash Band W', r[22:26]);
  reset role;
  v_log := v_log || pg_temp.ck((v_j->>'success')::boolean and v_j2->>'error_code' = 'MEMBER_CLASH',
                               '8a a band whose members already play another band at 3:45 PM on 9 Dec is refused', format('%s / %s', v_j, v_j2));

  perform set_config('request.jwt.claims', c[36], true); set local role authenticated;
  v_j := public.register_individual_event((select id from public.events where slug = 'western-singing-solo'));
  v_j2 := public.register_individual_event((select id from public.events where slug = 'indian-folk-film-singing-solo'));
  reset role;
  v_log := v_log || pg_temp.ck((v_j->>'success')::boolean and v_j2->>'error_code' = 'SESSION_CLASH',
                               '8b two solo singing events at the same time (14 Dec) are refused', format('%s / %s', v_j, v_j2));

  select count(*) into v_n from public.event_registrations a join public.event_registrations b on b.student_id = a.student_id
   where a.event_id = e_mono and b.event_id = e_pot and a.registration_status <> 'cancelled' and b.registration_status <> 'cancelled'
     and a.student_id = any(sid);
  v_log := v_log || pg_temp.ck(v_n = 30, '8c back-to-back events the same day (Pot Pourri 12:45, Mono Acting 3:45) do not clash', 'in both=' || v_n);

  -- Switching into a clashing session: move Impulse onto Painting's 3:45 PM slot for this test
  update public.event_schedule_slots set (starts_at, ends_at) =
    (select starts_at, ends_at from public.event_schedule_slots where event_id = e_painting order by starts_at desc limit 1)
   where event_id = e_impulse;
  update public.events set registration_closed = false where id = e_painting;
  perform set_config('request.jwt.claims', c[37], true); set local role authenticated;
  v_j := public.register_individual_event(e_impulse);
  v_j := public.register_individual_event(e_painting, (select id from public.event_schedule_slots where event_id = e_painting order by starts_at limit 1));
  v_reg := (v_j->>'registration_id')::uuid;
  v_j2 := public.change_my_session(v_reg, (select id from public.event_schedule_slots where event_id = e_painting order by starts_at desc limit 1));
  reset role;
  v_log := v_log || pg_temp.ck((v_j->>'success')::boolean and v_j2->>'error_code' = 'SESSION_CLASH',
                               '8d switching into a session that clashes with another event is refused', format('%s / %s', v_j, v_j2));

  -- Team leader moving the team into a member's clash: Mixed Media Pot moved onto Rangoli's 12:45 slot
  update public.event_schedule_slots set (starts_at, ends_at) = (select starts_at, ends_at from public.event_schedule_slots where id = r_am)
   where event_id = e_potart;
  perform set_config('request.jwt.claims', c[33], true); set local role authenticated;
  v_j := public.register_individual_event(e_potart);
  reset role;
  select id into v_reg from public.event_registrations where event_id = e_rangoli and student_id = sid[32] and registration_status = 'confirmed';
  perform set_config('request.jwt.claims', c[32], true); set local role authenticated;
  v_j2 := public.change_my_session(v_reg, r_am);
  reset role;
  v_log := v_log || pg_temp.ck((v_j->>'success')::boolean and v_j2->>'error_code' = 'MEMBER_CLASH',
                               '8e leader cannot move the team into a session that clashes for a member', format('%s / %s', v_j, v_j2));

  -- ── 9. Data integrity ───────────────────────────────────────────────────────
  select count(*) into v_n from (
    select event_id, student_id from public.event_registrations where student_id = any(sid) group by 1, 2 having count(*) > 1) d;
  v_log := v_log || pg_temp.ck(v_n = 0, '9a no student has two entries for one event');
  select count(*) into v_n from public.event_registrations er
    where er.student_id = any(sid) and er.registration_status <> 'cancelled' and er.slot_id is null
      and exists(select 1 from public.event_schedule_slots s where s.event_id = er.event_id);
  v_log := v_log || pg_temp.ck(v_n = 0, '9b every active entry on a scheduled event has a session', 'missing=' || v_n);
  select count(*) into v_n from public.event_registrations er join public.teams t on t.id = er.team_id
    where er.student_id = any(sid) and er.registration_status <> 'cancelled' and er.slot_id is distinct from t.slot_id;
  v_log := v_log || pg_temp.ck(v_n = 0, '9c team members always share their team''s session', 'mismatched=' || v_n);
  select count(*) into v_n from public.event_registrations where student_id = any(sid) and registration_status <> 'cancelled';
  v_log := v_log || pg_temp.ck(true, format('9d total active test entries created: %s', v_n));

  exception when others then
    reset role;
    v_log := v_log || 'FAIL test crashed: ' || sqlerrm || E'\n';
  end;

  -- The report only lists FAIL / WARN lines (the CLI truncates long errors); PASS lines are counted.
  raise exception E'STRESS_REPORT pass=% fail=% warn=%\n%',
    (length(v_log) - length(replace(v_log, 'PASS ', ''))) / 5,
    (length(v_log) - length(replace(v_log, 'FAIL ', ''))) / 5,
    (length(v_log) - length(replace(v_log, 'WARN ', ''))) / 5,
    regexp_replace(v_log, '(^|\n)PASS [^\n]*', '', 'g');
end $t$;
