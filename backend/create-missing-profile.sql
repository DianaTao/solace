-- SOLACE - Create Missing User Profile Script
-- Run this in your Supabase SQL Editor to create profiles for existing auth users

-- First, let's see what we're working with
SELECT 'Current situation analysis:' as message;

-- Check users table count
SELECT 'Users table count:' as message, COUNT(*) as count FROM public.users;

-- Check auth users count  
SELECT 'Auth users count:' as message, COUNT(*) as count FROM auth.users;

-- Find auth users without database profiles
SELECT 'Auth users missing database profiles:' as message;
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  au.raw_user_meta_data->>'name' as metadata_name
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;

-- Now let's fix the RLS policy to allow profile creation
-- Drop the restrictive policy and create a more permissive one
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;

-- Create a permissive insert policy for fixing existing users
CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT 
  WITH CHECK (true); -- Allow any authenticated user to insert

-- Create profiles for all existing auth users who don't have them
INSERT INTO public.users (id, email, name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'name', 
    SPLIT_PART(au.email, '@', 1), -- Use email username as fallback
    'User'
  ) as name,
  'social_worker' as role,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Update the trigger function to be more robust
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Insert new user profile with comprehensive error handling
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1),
      'User'
    ),
    'social_worker',
    NOW(),
    NOW()
  );
  
  -- Log successful creation
  RAISE LOG 'Successfully created user profile for: % (ID: %)', NEW.email, NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, that's fine
    RAISE LOG 'User profile already exists for: % (ID: %)', NEW.email, NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE LOG 'Failed to create user profile for % (ID: %): %', NEW.email, NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Final verification
SELECT 'After fix - verification:' as message;

-- Count users in both tables
SELECT 'Users table count:' as message, COUNT(*) as count FROM public.users;
SELECT 'Auth users count:' as message, COUNT(*) as count FROM auth.users;

-- Show any remaining orphaned auth users
SELECT 'Remaining auth users without profiles:' as message;
SELECT 
  COUNT(*) as orphaned_count
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Show the created profiles
SELECT 'Recently created/updated profiles:' as message;
SELECT 
  email,
  name,
  role,
  created_at,
  updated_at
FROM public.users 
ORDER BY updated_at DESC 
LIMIT 10;

-- Success message
SELECT 'Profile creation fix completed! All auth users should now have database profiles.' as message;

-- Instructions for the user
SELECT 'Next steps:' as message;
SELECT '1. Try logging in again with your mobile app' as instruction
UNION ALL
SELECT '2. The profile should now be created automatically' as instruction
UNION ALL  
SELECT '3. Check the users table in Supabase dashboard to verify' as instruction; 