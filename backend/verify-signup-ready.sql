-- SOLACE - Verify Database is Ready for Signups
-- Run this to ensure everything is set up correctly for new user signups

SELECT '=== SIGNUP READINESS CHECK ===' as message;

-- 1. Check if users table exists
SELECT 
  'Users table status:' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')
    THEN '✅ Users table exists'
    ELSE '❌ Users table missing - run setup-database.sql'
  END as status;

-- 2. Check users table structure
SELECT 'Users table columns:' as message;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Check if trigger exists
SELECT 
  'Signup trigger status:' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE event_object_schema = 'auth' 
      AND event_object_table = 'users' 
      AND trigger_name = 'on_auth_user_created'
    )
    THEN '✅ Trigger exists - profiles will be created automatically'
    ELSE '⚠️ Trigger missing - profiles need manual creation'
  END as status;

-- 4. Check RLS policies
SELECT 'RLS policies:' as message;
SELECT 
  policyname,
  cmd as command_type,
  CASE 
    WHEN cmd = 'INSERT' THEN '✅ Insert policy exists'
    WHEN cmd = 'SELECT' THEN '✅ Select policy exists'
    WHEN cmd = 'UPDATE' THEN '✅ Update policy exists'
    ELSE cmd
  END as policy_status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';

-- 5. Test basic functionality
SELECT '=== TESTING BASIC FUNCTIONALITY ===' as message;

-- Check current user counts
SELECT 'Current data:' as message;
SELECT 
  'Auth users' as table_name,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Database users' as table_name,
  COUNT(*) as count
FROM public.users;

-- 6. Final readiness assessment
SELECT '=== READINESS ASSESSMENT ===' as message;
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')
    THEN '❌ NOT READY: Users table missing'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE event_object_schema = 'auth' AND trigger_name = 'on_auth_user_created')
    THEN '⚠️ PARTIALLY READY: Trigger missing but manual profile creation possible'
    ELSE '✅ READY: Database configured for signups'
  END as overall_status;

-- 7. Next steps
SELECT '=== NEXT STEPS ===' as message;
SELECT 'Ready to test signup!' as instruction
UNION ALL
SELECT 'Try signing up with a new email in your mobile app' as instruction
UNION ALL
SELECT 'Check console logs for detailed signup process' as instruction
UNION ALL
SELECT 'User should appear in both auth.users and public.users tables' as instruction; 