-- First, clean up existing test users
DO $$
BEGIN
  -- Delete existing users and their data
  DELETE FROM auth.users 
  WHERE email IN (
    'free@example.com',
    'premium@example.com',
    'enterprise@example.com'
  );
END $$;

-- Create test users with proper password hashing
DO $$
DECLARE
  free_user_id uuid := gen_random_uuid();
  premium_user_id uuid := gen_random_uuid();
  enterprise_user_id uuid := gen_random_uuid();
BEGIN
  -- Create free tier user
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    confirmation_token,
    email_change_token_new,
    email_change,
    email_change_token_current,
    aud,
    role,
    banned_until
  ) VALUES (
    free_user_id,
    '00000000-0000-0000-0000-000000000000',
    'free@example.com',
    crypt('password123', gen_salt('bf', 10)),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated',
    null
  );

  -- Create premium tier user
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    confirmation_token,
    email_change_token_new,
    email_change,
    email_change_token_current,
    aud,
    role,
    banned_until
  ) VALUES (
    premium_user_id,
    '00000000-0000-0000-0000-000000000000',
    'premium@example.com',
    crypt('password123', gen_salt('bf', 10)),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated',
    null
  );

  -- Create enterprise tier user
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    confirmation_token,
    email_change_token_new,
    email_change,
    email_change_token_current,
    aud,
    role,
    banned_until
  ) VALUES (
    enterprise_user_id,
    '00000000-0000-0000-0000-000000000000',
    'enterprise@example.com',
    crypt('password123', gen_salt('bf', 10)),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated',
    null
  );

  -- Create or update profiles with appropriate tiers
  INSERT INTO public.profiles (id, email, tier, created_at, updated_at)
  VALUES
    (free_user_id, 'free@example.com', 'free', now(), now()),
    (premium_user_id, 'premium@example.com', 'premium', now(), now()),
    (enterprise_user_id, 'enterprise@example.com', 'enterprise', now(), now())
  ON CONFLICT (id) DO UPDATE SET
    tier = EXCLUDED.tier,
    updated_at = now();

END $$; 