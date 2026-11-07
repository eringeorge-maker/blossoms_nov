-- ════════════════════════════════════════════════════════════════════════════
-- 010 · Audit admin edits made directly from the admin console
--
-- Registrations, attendance and winners were already logged by their RPCs.
-- Edits that the console writes straight to tables (events, schedule, notices,
-- notifications, weekly recaps, fest teams, class→team mapping, participation
-- rules, admins, coordinator assignments) were not. This trigger logs them.
--
-- Only changes made by a signed-in admin are logged (students and system jobs
-- are skipped). For updates, `detail.changed` lists the fields that changed.
-- ════════════════════════════════════════════════════════════════════════════

create or replace function public.audit_admin_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_admin uuid := public.current_admin_profile_id();
  v_row jsonb := to_jsonb(coalesce(new, old));
  v_changed text[];
  v_id uuid;
begin
  if v_admin is null then
    return coalesce(new, old);
  end if;

  if tg_op = 'UPDATE' then
    select array_agg(n.key order by n.key) into v_changed
      from jsonb_each(to_jsonb(new)) n
      join jsonb_each(to_jsonb(old)) o using (key)
     where n.value is distinct from o.value and n.key not in ('updated_at', 'updated_by');
    if v_changed is null then
      return new;  -- nothing really changed
    end if;
  end if;

  begin
    v_id := (v_row ->> 'id')::uuid;
  exception when others then
    v_id := null;  -- tables keyed by something other than a uuid id
  end;

  insert into public.audit_logs (actor_id, actor_role, action, resource, resource_id, detail)
  values (
    v_admin,
    public.current_admin_role()::text,
    tg_table_name || '_' || lower(tg_op),
    tg_table_name,
    v_id,
    jsonb_strip_nulls(jsonb_build_object(
      'changed', to_jsonb(v_changed),
      'title', coalesce(v_row ->> 'title', v_row ->> 'name', v_row ->> 'class_name', v_row ->> 'email'),
      'event_id', v_row ->> 'event_id'
    ))
  );
  return coalesce(new, old);
end $$;

revoke all on function public.audit_admin_change() from public, anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array[
    'events', 'event_schedule_slots', 'announcements', 'notifications', 'weekly_recaps',
    'fest_teams', 'class_team_assignments', 'fest_settings', 'admin_profiles', 'admin_invites',
    'event_coordinator_assignments'
  ] loop
    execute format('drop trigger if exists audit_admin_change on public.%I', t);
    execute format(
      'create trigger audit_admin_change after insert or update or delete on public.%I
         for each row execute function public.audit_admin_change()', t);
  end loop;
end $$;
