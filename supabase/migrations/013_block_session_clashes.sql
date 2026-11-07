-- ════════════════════════════════════════════════════════════════════════════
-- 013 · Block time clashes; Mono Acting closes when it starts
--
-- 1. A student cannot hold two registrations whose sessions overlap in time
--    (for example two bands at 3:45 PM on 9 Dec). Checked when registering
--    alone, when a leader registers a team (every member is checked) and when
--    switching session. Events without a scheduled time never clash.
-- 2. Mono Acting registration now closes at 3:45 PM on 17 Nov, when it starts
--    (it kept the 12:45 PM deadline from when it shared a slot with Pot Pourri).
-- Function bodies are 011's, with the clash checks added.
-- ════════════════════════════════════════════════════════════════════════════

-- Returns the first event (title and time) the student is already in that overlaps
-- p_slot_id, ignoring p_event_id itself; null when there is no clash.
create or replace function public.session_clash(p_student_id uuid, p_slot_id uuid, p_event_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select e.title || ' at ' || to_char(theirs.starts_at at time zone 'Asia/Kolkata', 'FMHH12:MI AM, DD Mon')
    from public.event_schedule_slots mine
    join public.event_registrations er
      on er.student_id = p_student_id and er.event_id <> p_event_id and er.registration_status <> 'cancelled'
    join public.event_schedule_slots theirs
      on theirs.id = er.slot_id or (er.slot_id is null and theirs.event_id = er.event_id)
    join public.events e on e.id = er.event_id
   where mine.id = p_slot_id
     and mine.starts_at is not null and theirs.starts_at is not null
     and mine.starts_at < coalesce(theirs.ends_at, theirs.starts_at + interval '1 hour')
     and theirs.starts_at < coalesce(mine.ends_at, mine.starts_at + interval '1 hour')
   order by theirs.starts_at
   limit 1
$$;
revoke all on function public.session_clash(uuid, uuid, uuid) from public, anon, authenticated;

create or replace function public.register_individual_event(p_event_id uuid, p_slot_id uuid default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_s        public.students%rowtype;
  v_event    public.events%rowtype;
  v_block    jsonb;
  v_session  jsonb;
  v_slot     uuid;
  v_multi    boolean;
  v_existing public.event_registrations%rowtype;
  v_count    integer;
  v_status   registration_status_enum;
  v_reg_id   uuid;
  v_clash    text;
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

  v_session := public.resolve_event_session(p_event_id, p_slot_id);
  if v_session ? 'error_code' then return v_session; end if;
  v_slot := (v_session->>'slot_id')::uuid;
  v_multi := (select count(*) > 1 from public.event_schedule_slots where event_id = p_event_id);

  v_clash := public.session_clash(v_s.id, v_slot, p_event_id);
  if v_clash is not null then
    return jsonb_build_object('success', false, 'error_code', 'SESSION_CLASH',
      'message', 'This clashes with ' || v_clash || ', which you are already registered for.');
  end if;

  select * into v_existing from public.event_registrations where event_id = p_event_id and student_id = v_s.id;
  if found and v_existing.registration_status in ('confirmed', 'waitlisted') then
    return jsonb_build_object('success', false, 'error_code', 'ALREADY_REGISTERED', 'message', 'You are already registered for this event.');
  end if;

  -- Seat limit applies per session when the event runs more than once.
  select count(*) into v_count from public.event_registrations
   where event_id = p_event_id and registration_status = 'confirmed'
     and (not v_multi or slot_id = v_slot);

  if v_event.capacity is not null and v_count >= v_event.capacity then
    if not v_event.waitlist_enabled then
      return jsonb_build_object('success', false, 'error_code', 'CAPACITY_FULL',
        'message', case when v_multi then 'This session is full. Try the other session.' else 'This event is full.' end);
    end if;
    v_status := 'waitlisted';
  else
    v_status := 'confirmed';
  end if;

  insert into public.event_registrations (event_id, student_id, registration_status, registered_by_student_id, slot_id)
  values (p_event_id, v_s.id, v_status, v_s.id, v_slot)
  on conflict (event_id, student_id) do update
     set registration_status = excluded.registration_status, team_id = null, slot_id = excluded.slot_id,
         registered_at = now(), cancelled_at = null, registered_by_student_id = excluded.registered_by_student_id
  returning id into v_reg_id;

  insert into public.audit_logs (actor_id, actor_role, action, resource, resource_id, detail)
  values (v_s.id, 'student', 'register_individual', 'event_registrations', v_reg_id,
          jsonb_build_object('event_id', p_event_id, 'status', v_status, 'slot_id', v_slot));

  return jsonb_build_object('success', true, 'registration_id', v_reg_id, 'status', v_status,
    'event_title', v_event.title, 'whatsapp_group_url', v_event.whatsapp_group_url,
    'message', 'You are registered for ' || v_event.title || '.');
end $$;

create or replace function public.register_team_event(
  p_event_id uuid,
  p_team_name text,
  p_member_register_numbers text[],
  p_slot_id uuid default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_leader   public.students%rowtype;
  v_event    public.events%rowtype;
  v_block    jsonb;
  v_session  jsonb;
  v_slot     uuid;
  v_name     text := trim(coalesce(p_team_name, ''));
  v_regs     text[];
  v_missing  text[];
  v_taken    text[];
  v_size     integer;
  v_team_id  uuid;
  v_member   record;
  v_clash    text;
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

  v_session := public.resolve_event_session(p_event_id, p_slot_id);
  if v_session ? 'error_code' then return v_session; end if;
  v_slot := (v_session->>'slot_id')::uuid;

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

  select string_agg(s.register_number || ' ' || s.full_name || ' has ' || c.clash, '; ' order by s.register_number) into v_clash
    from public.students s
    cross join lateral (select public.session_clash(s.id, v_slot, p_event_id) as clash) c
   where s.register_number = any(v_regs) and c.clash is not null;
  if v_clash is not null then
    return jsonb_build_object('success', false, 'error_code', 'MEMBER_CLASH',
      'message', 'Clashes with another event at the same time: ' || v_clash || '.');
  end if;

  insert into public.teams (event_id, team_name, leader_student_id, slot_id)
  values (p_event_id, v_name, v_leader.id, v_slot) returning id into v_team_id;

  for v_member in select s.* from public.students s where s.register_number = any(v_regs) loop
    insert into public.team_members (team_id, student_id, is_leader)
    values (v_team_id, v_member.id, v_member.id = v_leader.id);

    insert into public.event_registrations (event_id, student_id, team_id, registration_status, registered_by_student_id, slot_id)
    values (p_event_id, v_member.id, v_team_id, 'confirmed', v_leader.id, v_slot)
    on conflict (event_id, student_id) do update
       set registration_status = 'confirmed', team_id = excluded.team_id, slot_id = excluded.slot_id, registered_at = now(),
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
          jsonb_build_object('event_id', p_event_id, 'members', to_jsonb(v_regs), 'slot_id', v_slot));

  return jsonb_build_object('success', true, 'team_id', v_team_id, 'status', 'confirmed',
    'event_title', v_event.title, 'whatsapp_group_url', v_event.whatsapp_group_url,
    'message', 'Team "' || v_name || '" is registered for ' || v_event.title || '.');
end $$;

create or replace function public.change_my_session(p_registration_id uuid, p_slot_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_student_id uuid := public.current_student_id();
  v_reg   public.event_registrations%rowtype;
  v_event public.events%rowtype;
  v_team  public.teams%rowtype;
  v_count integer;
  v_label text;
  v_clash text;
begin
  select * into v_reg from public.event_registrations where id = p_registration_id and student_id = v_student_id;
  if not found or v_reg.registration_status = 'cancelled' then
    return jsonb_build_object('success', false, 'error_code', 'NOT_FOUND', 'message', 'Registration not found.');
  end if;
  select * into v_event from public.events where id = v_reg.event_id for update;
  if v_event.registration_closed or (v_event.registration_closes_at is not null and now() > v_event.registration_closes_at) then
    return jsonb_build_object('success', false, 'error_code', 'REGISTRATION_CLOSED', 'message', 'Registration has closed, so the session can no longer be changed.');
  end if;
  if not exists(select 1 from public.event_schedule_slots where id = p_slot_id and event_id = v_reg.event_id) then
    return jsonb_build_object('success', false, 'error_code', 'INVALID_SESSION', 'message', 'That session is not part of this event.');
  end if;
  if v_reg.slot_id is not distinct from p_slot_id then
    return jsonb_build_object('success', true, 'message', 'You are already in that session.');
  end if;
  select to_char(starts_at at time zone 'Asia/Kolkata', 'FMHH12:MI AM') into v_label from public.event_schedule_slots where id = p_slot_id;

  if v_reg.team_id is not null then
    select * into v_team from public.teams where id = v_reg.team_id;
    if v_team.leader_student_id <> v_student_id then
      return jsonb_build_object('success', false, 'error_code', 'TEAM_MEMBER', 'message', 'Only your team leader can change the team''s session.');
    end if;
    select string_agg(s.register_number || ' ' || s.full_name || ' has ' || c.clash, '; ' order by s.register_number) into v_clash
      from public.team_members tm join public.students s on s.id = tm.student_id
      cross join lateral (select public.session_clash(s.id, p_slot_id, v_reg.event_id) as clash) c
     where tm.team_id = v_team.id and c.clash is not null;
    if v_clash is not null then
      return jsonb_build_object('success', false, 'error_code', 'MEMBER_CLASH',
        'message', 'That session clashes for: ' || v_clash || '.');
    end if;
    update public.teams set slot_id = p_slot_id where id = v_team.id;
    update public.event_registrations set slot_id = p_slot_id where team_id = v_team.id and registration_status <> 'cancelled';
    insert into public.notifications (title, body, link, audience, student_id)
    select 'Session changed', 'Team "' || v_team.team_name || '" moved to the ' || coalesce(v_label, 'other') || ' session of ' || v_event.title || '.',
           '/app/my-events', 'student', tm.student_id
      from public.team_members tm where tm.team_id = v_team.id and tm.student_id <> v_student_id;
  else
    v_clash := public.session_clash(v_student_id, p_slot_id, v_reg.event_id);
    if v_clash is not null then
      return jsonb_build_object('success', false, 'error_code', 'SESSION_CLASH',
        'message', 'That session clashes with ' || v_clash || ', which you are already registered for.');
    end if;
    if v_reg.registration_status = 'confirmed' and v_event.capacity is not null then
      select count(*) into v_count from public.event_registrations
       where event_id = v_reg.event_id and registration_status = 'confirmed' and slot_id = p_slot_id;
      if v_count >= v_event.capacity then
        return jsonb_build_object('success', false, 'error_code', 'CAPACITY_FULL', 'message', 'That session is full.');
      end if;
    end if;
    update public.event_registrations set slot_id = p_slot_id where id = v_reg.id;
  end if;

  insert into public.audit_logs (actor_id, actor_role, action, resource, resource_id, detail)
  values (v_student_id, 'student', 'change_session', 'event_registrations', v_reg.id,
          jsonb_build_object('event_id', v_reg.event_id, 'from', v_reg.slot_id, 'to', p_slot_id));

  return jsonb_build_object('success', true, 'message', 'Moved to the ' || coalesce(v_label, 'new') || ' session.');
end $$;

revoke execute on function public.register_individual_event(uuid, uuid) from public, anon;
revoke execute on function public.register_team_event(uuid, text, text[], uuid) from public, anon;
revoke execute on function public.change_my_session(uuid, uuid) from public, anon;
grant  execute on function public.register_individual_event(uuid, uuid) to authenticated;
grant  execute on function public.register_team_event(uuid, text, text[], uuid) to authenticated;
grant  execute on function public.change_my_session(uuid, uuid) to authenticated;

update public.events
   set registration_closes_at = timestamptz '2026-11-17 15:45:00+05:30'
 where slug = 'mono-act';
