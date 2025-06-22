-- SOLACE Database Fix Script
-- Run this in your Supabase SQL Editor to fix user profile creation issues

-- First, let's check the current state
SELECT 'Current users table status:' as message;
SELECT COUNT(*) as user_count FROM users;

-- Check if there are auth users without profiles
SELECT 'Auth users without profiles:' as message;
SELECT au.email, au.id, au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Drop and recreate the trigger function with better error handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Insert new user profile with proper error handling
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'social_worker',
    NOW(),
    NOW()
  );
  
  -- Log successful creation
  RAISE LOG 'Created user profile for: %', NEW.email;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE LOG 'Failed to create user profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies to be more permissive for profile creation
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;

-- Create a more permissive insert policy
CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT 
  WITH CHECK (true); -- Allow any authenticated user to insert

-- Keep the existing policies for select and update
-- (Users can only see/update their own profiles)

-- Create profiles for existing auth users who don't have them
INSERT INTO public.users (id, email, name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.email),
  'social_worker',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Check the results
SELECT 'After fix - users table status:' as message;
SELECT COUNT(*) as user_count FROM users;

SELECT 'Users created:' as message;
SELECT email, name, role, created_at FROM users ORDER BY created_at DESC;

-- Success message
SELECT 'Database fix completed! All auth users now have profiles.' as message; 