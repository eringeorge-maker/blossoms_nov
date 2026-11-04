-- =============================================================
-- Blossoms Fest — Migration 006: register-number-only student sign-in
--
-- Interim login while there is no email delivery: a student types their register
-- number and gets a real Supabase session, so every RLS rule and RPC from 004 keeps
-- working through auth.uid().
--
-- Each student gets one auth user with a placeholder address that never receives mail
-- (s<register_number>@students.blossoms.local) and a password the client derives from
-- the register number. This is NOT a secret: anyone who knows a register number can
-- sign in as that student. To add real passwords later, let students call
-- supabase.auth.updateUser({ password }) once signed in; after that the derived
-- password stops working for them.
-- =============================================================

create or replace function public.student_login_prepare(p_register_number text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_reg   text := trim(coalesce(p_register_number, ''));
  v_s     public.students%rowtype;
  v_email text;
  v_uid   uuid;
  v_existing_email text;
begin
  if v_reg !~ '^\d{7}$' then
    return jsonb_build_object('ok', false, 'code', 'INVALID', 'message', 'Enter your 7-digit register number.');
  end if;

  select * into v_s from public.students where register_number = v_reg for update;
  if not found or v_s.student_status <> 'active' then
    return jsonb_build_object('ok', false, 'code', 'NOT_FOUND',
      'message', 'That register number is not on the Blossoms 2026-27 student list.');
  end if;

  v_email := 's' || v_reg || '@students.blossoms.local';

  if v_s.auth_user_id is not null then
    select email into v_existing_email from auth.users where id = v_s.auth_user_id;
    if v_existing_email is not null and v_existing_email <> v_email then
      return jsonb_build_object('ok', false, 'code', 'EMAIL_ACCOUNT',
        'message', 'This register number signs in with email. Ask a Blossoms admin to reset it.');
    end if;
    if v_existing_email is not null then
      return jsonb_build_object('ok', true, 'email', v_email, 'name', v_s.full_name);
    end if;
  end if;

  -- First sign-in: create the auth user and its email identity.
  select id into v_uid from auth.users where email = v_email;
  if v_uid is null then
    v_uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated', v_email,
      extensions.crypt('blossoms:' || v_reg, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('register_number', v_reg, 'login', 'register_number'),
      now(), now(), '', '', '', ''
    );
    insert into auth.identities (user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (v_uid, v_uid::text,
            jsonb_build_object('sub', v_uid::text, 'email', v_email, 'email_verified', true),
            'email', now(), now(), now());
  end if;

  update public.students
     set auth_user_id = v_uid, is_verified = true, updated_at = now()
   where id = v_s.id;

  insert into public.audit_logs (actor_id, actor_role, action, resource, resource_id, detail)
  values (v_s.id, 'student', 'claim_account', 'students', v_s.id, jsonb_build_object('method', 'register_number'));

  return jsonb_build_object('ok', true, 'email', v_email, 'name', v_s.full_name);
end $$;

revoke execute on function public.student_login_prepare(text) from public;
grant execute on function public.student_login_prepare(text) to anon, authenticated;
