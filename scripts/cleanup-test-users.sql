-- Clean up test users and their data
DO $$
BEGIN
  -- Delete test users (this will cascade to profiles and other related data)
  DELETE FROM auth.users 
  WHERE email IN (
    'free@example.com',
    'premium@example.com',
    'enterprise@example.com'
  );

  -- Clean up any orphaned profiles (shouldn't be necessary due to CASCADE, but just in case)
  DELETE FROM public.profiles 
  WHERE email IN (
    'free@example.com',
    'premium@example.com',
    'enterprise@example.com'
  );
END $$; 