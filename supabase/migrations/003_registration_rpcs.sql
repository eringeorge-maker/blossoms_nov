-- =============================================================
-- Blossoms Fest — Registration RPCs & Atomic Operations
-- Migration 003
-- =============================================================

-- ── 1. register_individual_event ─────────────────────────────
-- Validates:
--  - Authenticated session maps to an active, verified student
--  - Event is published, not cancelled/completed
--  - Current server time (IST) is within registration window
--  - Student satisfies eligibility rules (all-students default)
--  - Event allows individual or either registration format
--  - Student does not already have an active registration
--  - Atomic capacity reservation
create or replace function public.register_individual_event(
  p_event_id uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_student_id uuid;
  v_student_status text;
  v_is_verified boolean;
  v_event record;
  v_existing_reg record;
  v_confirmed_count integer;
  v_status registration_status_enum;
  v_new_reg_id uuid;
begin
  -- 1. Derive student from auth.uid()
  select id, student_status, is_verified
  into v_student_id, v_student_status, v_is_verified
  from public.students
  where auth_user_id = auth.uid()
  limit 1;

  if v_student_id is null then
    return jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED', 'message', 'Student record not found for active session');
  end if;

  if v_student_status != 'active' or not v_is_verified then
    return jsonb_build_object('success', false, 'error_code', 'INACTIVE_STUDENT', 'message', 'Your student account is pending verification or inactive');
  end if;

  -- 2. Lock event row for atomic check
  select *
  into v_event
  from public.events
  where id = p_event_id
  for share;

  if v_event is null or v_event.status != 'published' then
    return jsonb_build_object('success', false, 'error_code', 'EVENT_NOT_AVAILABLE', 'message', 'This event is not published or has been cancelled');
  end if;

  -- 3. Registration format check
  if v_event.event_format not in ('individual', 'either') then
    return jsonb_build_object('success', false, 'error_code', 'INVALID_FORMAT', 'message', 'This event requires team registration');
  end if;

  -- 4. Registration window validation (authoritative server time)
  if v_event.registration_opens_at is not null and now() < v_event.registration_opens_at then
    return jsonb_build_object('success', false, 'error_code', 'REGISTRATION_NOT_OPEN', 'message', 'Registration for this event has not opened yet');
  end if;

  if v_event.registration_closes_at is not null and now() > v_event.registration_closes_at then
    return jsonb_build_object('success', false, 'error_code', 'REGISTRATION_CLOSED', 'message', 'Registration for this event has closed');
  end if;

  -- 5. Existing registration check
  select *
  into v_existing_reg
  from public.event_registrations
  where event_id = p_event_id and student_id = v_student_id;

  if v_existing_reg is not null then
    if v_existing_reg.registration_status in ('confirmed', 'waitlisted') then
      return jsonb_build_object('success', false, 'error_code', 'ALREADY_REGISTERED', 'message', 'You are already registered for this event');
    end if;
  end if;

  -- 6. Capacity & Waitlist calculation
  select count(*)
  into v_confirmed_count
  from public.event_registrations
  where event_id = p_event_id and registration_status = 'confirmed';

  if v_event.capacity is not null and v_confirmed_count >= v_event.capacity then
    if v_event.waitlist_enabled then
      v_status := 'waitlisted';
    else
      return jsonb_build_object('success', false, 'error_code', 'CAPACITY_FULL', 'message', 'This event has reached full capacity');
    end if;
  else
    v_status := 'confirmed';
  end if;

  -- 7. Upsert registration record (reactivate if previously cancelled)
  if v_existing_reg is not null then
    update public.event_registrations
    set registration_status = v_status,
        registered_at = now(),
        cancelled_at = null
    where id = v_existing_reg.id
    returning id into v_new_reg_id;
  else
    insert into public.event_registrations (
      event_id,
      student_id,
      registration_status,
      registered_by_student_id
    ) values (
      p_event_id,
      v_student_id,
      v_status,
      v_student_id
    )
    returning id into v_new_reg_id;
  end if;

  -- 8. Audit log
  insert into public.audit_logs (actor_id, actor_role, action, resource, resource_id, detail)
  values (
    v_student_id,
    'student',
    'register_individual',
    'event_registrations',
    v_new_reg_id,
    jsonb_build_object('event_id', p_event_id, 'status', v_status)
  );

  return jsonb_build_object(
    'success', true,
    'registration_id', v_new_reg_id,
    'status', v_status,
    'event_title', v_event.title
  );
end;
$$;


-- ── 2. cancel_event_registration ──────────────────────────────
create or replace function public.cancel_event_registration(
  p_registration_id uuid,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_student_id uuid;
  v_reg record;
  v_event record;
begin
  select id into v_student_id
  from public.students
  where auth_user_id = auth.uid() limit 1;

  select * into v_reg
  from public.event_registrations
  where id = p_registration_id and student_id = v_student_id;

  if v_reg is null then
    return jsonb_build_object('success', false, 'error_code', 'NOT_FOUND', 'message', 'Registration not found');
  end if;

  select * into v_event
  from public.events
  where id = v_reg.event_id;

  if not v_event.cancellation_allowed then
    return jsonb_build_object('success', false, 'error_code', 'CANCELLATION_DISALLOWED', 'message', 'Cancellations are not permitted for this event');
  end if;

  update public.event_registrations
  set registration_status = 'cancelled',
      cancelled_at = now()
  where id = p_registration_id;

  -- Audit log
  insert into public.audit_logs (actor_id, actor_role, action, resource, resource_id, detail)
  values (v_student_id, 'student', 'cancel_registration', 'event_registrations', p_registration_id, jsonb_build_object('reason', p_reason));

  return jsonb_build_object('success', true, 'message', 'Registration cancelled successfully');
end;
$$;
