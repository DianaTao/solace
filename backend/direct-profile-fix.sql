-- SOLACE - Direct Profile Fix for yifei66@berkeley.edu
-- This script will directly create the missing database profile

-- First, let's see your auth user details
SELECT '=== FINDING YOUR AUTH USER ===' as message;
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data,
  raw_user_meta_data->>'name' as extracted_name
FROM auth.users 
WHERE email = 'yifei66@berkeley.edu';

-- Now let's temporarily disable RLS to ensure the insert works
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Direct insert for your specific user
-- We'll get the ID from auth.users and create the profile
INSERT INTO public.users (id, email, name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'name',
    'Yifei',  -- Default name if metadata is empty
    SPLIT_PART(au.email, '@', 1)
  ) as name,
  'social_worker' as role,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
WHERE au.email = 'yifei66@berkeley.edu'
  AND NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
  );

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Verify the insert worked
SELECT '=== VERIFICATION ===' as message;
SELECT 
  'Profile created successfully!' as status,
  email,
  name,
  role,
  created_at,
  updated_at
FROM public.users 
WHERE email = 'yifei66@berkeley.edu';

-- Double-check by joining auth and database
SELECT '=== COMPLETE STATUS CHECK ===' as message;
SELECT 
  au.email as auth_email,
  au.id as auth_id,
  pu.email as db_email,
  pu.name as db_name,
  pu.role as db_role,
  CASE 
    WHEN pu.id IS NOT NULL THEN '✅ SUCCESS: Profile now exists!'
    ELSE '❌ FAILED: Profile still missing'
  END as final_status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'yifei66@berkeley.edu';

-- Show the total counts after fix
SELECT '=== FINAL COUNTS ===' as message;
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.users) as total_db_users,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN public.users pu ON au.id = pu.id WHERE pu.id IS NULL) as remaining_orphaned;

SELECT 'Direct profile fix completed!' as message; 