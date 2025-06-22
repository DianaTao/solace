-- SOLACE - Diagnose Signup Issues
-- Run this in your Supabase SQL Editor to identify why new signups aren't working

-- 1. Check current auth settings and configuration
SELECT '=== CHECKING AUTH CONFIGURATION ===' as message;

-- Check if we can access auth schema (this will tell us about permissions)
SELECT 'Auth schema access test:' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth')
    THEN '✅ Can access auth schema'
    ELSE '❌ Cannot access auth schema'
  END as status;

-- Check users table structure
SELECT '=== CHECKING USERS TABLE ===' as message;
SELECT 
  'Users table exists:' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')
    THEN '✅ Users table exists'
    ELSE '❌ Users table missing'
  END as status;

-- Check users table columns
SELECT 'Users table structure:' as message;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Check RLS status
SELECT '=== CHECKING ROW LEVEL SECURITY ===' as message;
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS enabled'
    ELSE '❌ RLS disabled'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- Check RLS policies
SELECT 'RLS Policies on users table:' as message;
SELECT 
  policyname,
  cmd as command_type,
  permissive,
  roles,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';

-- Check triggers
SELECT '=== CHECKING TRIGGERS ===' as message;
SELECT 
  'Trigger exists:' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE event_object_schema = 'auth' 
      AND event_object_table = 'users' 
      AND trigger_name = 'on_auth_user_created'
    )
    THEN '✅ Trigger exists on auth.users'
    ELSE '❌ Trigger missing on auth.users'
  END as status;

-- List all triggers on auth.users table
SELECT 'All triggers on auth.users:' as message;
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';

-- Check if trigger function exists
SELECT 'Trigger function exists:' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name = 'handle_new_user'
    )
    THEN '✅ handle_new_user function exists'
    ELSE '❌ handle_new_user function missing'
  END as status;

-- Show function definition if it exists
SELECT 'Function definition:' as message;
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'handle_new_user';

-- Check current user counts
SELECT '=== CURRENT DATA STATUS ===' as message;
SELECT 'Current counts:' as message;
SELECT 
  'Auth users' as table_name,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Database users' as table_name,
  COUNT(*) as count
FROM public.users;

-- Show recent auth users (to see if any new ones are being created)
SELECT 'Recent auth users (last 10):' as message;
SELECT 
  email,
  created_at,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmed'
    ELSE '❌ Not confirmed'
  END as email_status
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Check for any auth users without database profiles
SELECT 'Auth users without database profiles:' as message;
SELECT 
  au.email,
  au.created_at,
  'Missing database profile' as issue
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;

-- Test basic database connectivity
SELECT '=== TESTING DATABASE CONNECTIVITY ===' as message;
SELECT 
  'Database connection test:' as test_type,
  '✅ Connected successfully' as status,
  NOW() as current_time;

-- Final summary and recommendations
SELECT '=== DIAGNOSIS SUMMARY ===' as message;
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')
    THEN '❌ CRITICAL: Users table does not exist - run setup-database.sql'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE event_object_schema = 'auth' AND trigger_name = 'on_auth_user_created')
    THEN '⚠️ WARNING: Trigger missing - user profiles won''t be created automatically'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'handle_new_user')
    THEN '⚠️ WARNING: Trigger function missing - run setup-database.sql'
    WHEN (SELECT COUNT(*) FROM auth.users) > (SELECT COUNT(*) FROM public.users)
    THEN '⚠️ WARNING: Some auth users missing database profiles - run database-fix.sql'
    ELSE '✅ Database setup appears correct'
  END as diagnosis;

-- Recommendations
SELECT '=== RECOMMENDATIONS ===' as message;
SELECT '1. Check Supabase Auth settings in dashboard' as recommendation
UNION ALL
SELECT '2. Verify email confirmation is properly configured' as recommendation
UNION ALL
SELECT '3. Check if signup is enabled in Auth settings' as recommendation
UNION ALL
SELECT '4. Test signup with a different email provider' as recommendation
UNION ALL
SELECT '5. Check spam folder for confirmation emails' as recommendation; 