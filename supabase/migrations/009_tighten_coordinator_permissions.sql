-- ════════════════════════════════════════════════════════════════════════════
-- 009 · Tighten coordinator permissions (found by supabase/tests/e2e_full_flow.sql)
--
-- 1. Events: event coordinators could edit ANY event. Now they can only edit
--    events assigned to them. Creating/deleting stays with super admins and
--    content editors.
-- 2. Notifications: any admin (incl. coordinators, analysts) could send a
--    notification to every student. Now only super admins and content editors
--    can write notifications (matches the admin console: Announcements page).
-- 3. Attendance: present/absent could be recorded for a student not registered
--    for the event, which counted toward their minimum. Now, for normal events,
--    only students with an active registration are marked; others are skipped.
--    Mandatory events still accept every student.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Events ────────────────────────────────────────────────────────────────
drop policy if exists "Admin can manage events" on public.events;

create policy "Editors manage events"
  on public.events for all
  using (public.current_admin_role() in ('super_admin', 'content_editor'))
  with check (public.current_admin_role() in ('super_admin', 'content_editor'));

create policy "Coordinators edit assigned events"
  on public.events for update
  using (public.current_admin_role() = 'event_coordinator' and public.can_manage_event(id))
  with check (public.current_admin_role() = 'event_coordinator' and public.can_manage_event(id));

-- ── 2. Notifications ─────────────────────────────────────────────────────────
drop policy if exists "Admins manage notifications" on public.notifications;

create policy "Admins read notifications"
  on public.notifications for select
  using (public.is_admin());

create policy "Editors write notifications"
  on public.notifications for all
  using (public.current_admin_role() in ('super_admin', 'content_editor'))
  with check (public.current_admin_role() in ('super_admin', 'content_editor'));

-- ── 3. Attendance only for registered students (except mandatory events) ─────
create or replace function public.admin_mark_attendance(p_event_id uuid, p_student_ids uuid[], p_status text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_admin uuid := public.current_admin_profile_id();
  v_mandatory boolean;
  v_ids uuid[];
  v_n integer;
  v_skipped integer;
begin
  if v_admin is null or not public.can_manage_event(p_event_id) then
    raise exception 'FORBIDDEN: you cannot mark attendance for this event' using errcode = '42501';
  end if;
  select is_mandatory into v_mandatory from public.events where id = p_event_id;

  if p_status = 'clear' then
    delete from public.event_attendance where event_id = p_event_id and student_id = any(p_student_ids);
    get diagnostics v_n = row_count;
    v_skipped := 0;
  elsif p_status in ('present', 'absent') then
    if coalesce(v_mandatory, false) then
      select array_agg(s.id) into v_ids from public.students s
       where s.id = any(p_student_ids) and s.student_status = 'active';
    else
      select array_agg(distinct r.student_id) into v_ids from public.event_registrations r
       where r.event_id = p_event_id and r.student_id = any(p_student_ids) and r.registration_status <> 'cancelled';
    end if;
    v_skipped := coalesce(array_length(p_student_ids, 1), 0) - coalesce(array_length(v_ids, 1), 0);

    insert into public.event_attendance (event_id, student_id, status, marked_by, marked_at)
    select p_event_id, sid, p_status::attendance_status_enum, v_admin, now() from unnest(coalesce(v_ids, '{}')) sid
    on conflict (event_id, student_id) do update
       set status = excluded.status, marked_by = excluded.marked_by, marked_at = now();
    get diagnostics v_n = row_count;
  else
    raise exception 'Unknown attendance status %', p_status;
  end if;

  insert into public.audit_logs (actor_id, actor_role, action, resource, resource_id, detail)
  values (v_admin, public.current_admin_role()::text, 'mark_attendance', 'events', p_event_id,
          jsonb_build_object('status', p_status, 'count', v_n, 'skipped', v_skipped));
  return jsonb_build_object('success', true, 'updated', v_n, 'skipped', v_skipped);
end $$;

revoke all on function public.admin_mark_attendance(uuid, uuid[], text) from public, anon;
grant execute on function public.admin_mark_attendance(uuid, uuid[], text) to authenticated;
