-- SOLACE - Verify Profile Fix Results
-- Run this in your Supabase SQL Editor to check if the fix worked

-- Show current status
SELECT '=== VERIFICATION RESULTS ===' as message;

-- 1. Count total users in database
SELECT 'Database users count:' as check_type, COUNT(*) as count 
FROM public.users;

-- 2. Count total auth users
SELECT 'Auth users count:' as check_type, COUNT(*) as count 
FROM auth.users;

-- 3. Show all users in the database table
SELECT '=== ALL DATABASE USERS ===' as message;
SELECT 
  email,
  name,
  role,
  created_at,
  updated_at
FROM public.users 
ORDER BY created_at DESC;

-- 4. Show all auth users
SELECT '=== ALL AUTH USERS ===' as message;
SELECT 
  email,
  created_at as auth_created,
  raw_user_meta_data->>'name' as metadata_name,
  email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC;

-- 5. Check for any remaining orphaned auth users
SELECT '=== ORPHANED AUTH USERS (should be 0) ===' as message;
SELECT 
  au.email,
  au.id,
  au.created_at as auth_created,
  'Missing database profile' as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;

-- 6. Check specifically for your user
SELECT '=== YOUR USER STATUS ===' as message;
SELECT 
  au.email as auth_email,
  au.created_at as auth_created,
  au.email_confirmed_at,
  pu.email as db_email,
  pu.name as db_name,
  pu.role as db_role,
  pu.created_at as db_created,
  CASE 
    WHEN pu.id IS NOT NULL THEN '✅ Profile exists in database'
    ELSE '❌ Profile missing from database'
  END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email LIKE '%yifei%' OR au.email LIKE '%berkeley%'
ORDER BY au.created_at DESC;

-- 7. Final summary
SELECT '=== SUMMARY ===' as message;
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.users) as total_db_users,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN public.users pu ON au.id = pu.id WHERE pu.id IS NULL) as orphaned_users,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users au LEFT JOIN public.users pu ON au.id = pu.id WHERE pu.id IS NULL) = 0 
    THEN '✅ All auth users have database profiles'
    ELSE '⚠️ Some auth users still missing database profiles'
  END as status; 