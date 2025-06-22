-- SOLACE - Test Signup Process
-- This script helps test the signup process step by step

-- Test 1: Check if we can create a test auth user manually
SELECT '=== TESTING MANUAL USER CREATION ===' as message;

-- First, let's see what happens when we try to create a user directly
-- Note: This won't actually create a user (we can't do that from SQL), 
-- but it will help us understand the process

-- Test 2: Check current auth configuration
SELECT 'Current auth users count:' as test, COUNT(*) as count FROM auth.users;

-- Test 3: Try to understand why emails aren't being sent
-- Check if there are any recent auth users that were created but not confirmed
SELECT '=== RECENT UNCONFIRMED USERS ===' as message;
SELECT 
  email,
  created_at,
  email_confirmed_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as hours_since_creation,
  CASE 
    WHEN email_confirmed_at IS NULL AND EXTRACT(EPOCH FROM (NOW() - created_at))/3600 < 24
    THEN '⏳ Recently created, waiting for confirmation'
    WHEN email_confirmed_at IS NULL AND EXTRACT(EPOCH FROM (NOW() - created_at))/3600 >= 24
    THEN '❌ Old unconfirmed user - email may not have been sent'
    ELSE '✅ Confirmed'
  END as status
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- Test 4: Check if there are any users created in the last hour (indicating recent signup attempts)
SELECT '=== VERY RECENT SIGNUP ATTEMPTS ===' as message;
SELECT 
  email,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutes_since_creation
FROM auth.users
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Test 5: Show all auth users to see the pattern
SELECT '=== ALL AUTH USERS (to see patterns) ===' as message;
SELECT 
  email,
  created_at,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmed'
    ELSE '❌ Not confirmed'
  END as email_status,
  raw_user_meta_data->>'name' as metadata_name
FROM auth.users 
ORDER BY created_at DESC;

-- Test 6: Simulate what should happen when a user signs up
SELECT '=== SIMULATING SIGNUP PROCESS ===' as message;

-- This is what should happen:
-- 1. User submits signup form
-- 2. Supabase creates user in auth.users table
-- 3. Supabase sends confirmation email
-- 4. Our trigger creates profile in public.users table
-- 5. User clicks email link to confirm
-- 6. User can then sign in

SELECT 'Expected signup flow:' as step, '1. App calls supabase.auth.signUp()' as description
UNION ALL
SELECT 'Expected signup flow:', '2. Supabase creates user in auth.users'
UNION ALL
SELECT 'Expected signup flow:', '3. Supabase sends confirmation email'
UNION ALL
SELECT 'Expected signup flow:', '4. Our trigger creates profile in public.users'
UNION ALL
SELECT 'Expected signup flow:', '5. User clicks email confirmation link'
UNION ALL
SELECT 'Expected signup flow:', '6. User can sign in with confirmed account';

-- Test 7: Check what might be blocking the process
SELECT '=== POTENTIAL BLOCKING ISSUES ===' as message;

-- Check if auth is properly configured
SELECT 
  'Potential issue' as issue_type,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users WHERE created_at > NOW() - INTERVAL '24 hours') = 0
    THEN 'No recent signup attempts - app may not be calling Supabase correctly'
    WHEN (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NULL) > 0
    THEN 'Users created but not confirmed - email delivery issue'
    ELSE 'Users being created and confirmed normally'
  END as diagnosis;

-- Final recommendations based on what we see
SELECT '=== ACTION ITEMS ===' as message;
SELECT 'Next steps:' as category, 'Run this diagnostic and share results' as action
UNION ALL
SELECT 'Next steps:', 'Check Supabase Dashboard > Authentication > Settings'
UNION ALL
SELECT 'Next steps:', 'Verify email delivery settings in Supabase'
UNION ALL
SELECT 'Next steps:', 'Test signup with console logs in mobile app'
UNION ALL
SELECT 'Next steps:', 'Check spam folder for confirmation emails'; 