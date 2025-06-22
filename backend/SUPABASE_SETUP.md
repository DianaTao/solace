# Supabase Setup Guide for SOLACE Mobile App 🔐

This guide will walk you through setting up Supabase authentication for the SOLACE mobile app.

## 📋 Prerequisites

- A Supabase account (free tier available)
- Your SOLACE mobile app project set up

## 🚀 Step 1: Create/Access Your Supabase Project

### Option A: Create a New Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or sign in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `solace-mobile` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"

### Option B: Use Existing Project
If you already have a Supabase project for the web app, you can use the same one.

## 🔑 Step 2: Get Your Supabase Credentials

1. **Navigate to your project dashboard**
2. **Go to Settings** (gear icon in sidebar)
3. **Click on "API"** in the settings menu
4. **Copy the following values:**
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIs...`)

## ⚙️ Step 3: Configure the Mobile App

### Update the Environment Configuration

1. **Open the file:** `config/env.js`
2. **Replace the placeholder values** with your actual Supabase credentials:

```javascript
const config = {
  development: {
    SUPABASE_URL: 'https://your-actual-project-id.supabase.co',
    SUPABASE_ANON_KEY: 'your-actual-anon-key-here',
  },
  production: {
    SUPABASE_URL: 'https://your-actual-project-id.supabase.co',
    SUPABASE_ANON_KEY: 'your-actual-anon-key-here',
  }
};
```

### Example Configuration

```javascript
const config = {
  development: {
    SUPABASE_URL: 'https://abcdefghijklmnop.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2ODAwMCwiZXhwIjoyMDE0MzQ0MDAwfQ.example-key',
  },
  production: {
    SUPABASE_URL: 'https://abcdefghijklmnop.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2ODAwMCwiZXhwIjoyMDE0MzQ0MDAwfQ.example-key',
  }
};
```

## 🗄️ Step 4: Set Up Database Schema

### Create Users Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  agency TEXT,
  role TEXT DEFAULT 'social_worker',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read/update their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create policy for inserting new users
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Create Additional Tables (Optional)

If you want the full SOLACE schema:

```sql
-- Create other tables as needed
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE case_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  client_id UUID REFERENCES clients(id),
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for these tables too
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own clients" ON clients
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own case notes" ON case_notes
  FOR ALL USING (auth.uid() = user_id);
```

## 📱 Step 5: Test the Setup

1. **Start your mobile app:**
   ```bash
   npx expo start
   ```

2. **Test authentication:**
   - Try the demo credentials: `demo@solace.app` / `demo123`
   - Create a test account in Supabase Auth
   - Try logging in with real credentials

3. **Check console logs:**
   - Look for `🔐 Attempting Supabase login with:` messages
   - Check for `✅ Supabase login successful` or error messages

## 🔒 Security Best Practices

### Environment Variables
- **Never commit** real credentials to version control
- **Use different credentials** for development and production
- **Rotate keys regularly** in production

### Row Level Security
- **Always enable RLS** on your tables
- **Create specific policies** for each table
- **Test your policies** thoroughly

### Authentication
- **Enable email confirmation** in Supabase Auth settings
- **Set up password requirements** in Auth settings
- **Configure allowed redirect URLs** for password reset

## 🐛 Troubleshooting

### Common Issues

#### "Invalid API key" Error
- **Check** that you copied the anon/public key correctly
- **Verify** the project URL is correct
- **Ensure** no extra spaces in the configuration

#### "Failed to fetch" Error
- **Check** your internet connection
- **Verify** the Supabase project is active
- **Try** restarting the Expo development server

#### User Profile Not Found
- **Ensure** the users table exists
- **Check** RLS policies are set correctly
- **Verify** the user was created in the auth.users table

### Debug Console Logs

The app includes helpful console logs:

- `🔐 Attempting Supabase login with: [email]`
- `✅ Supabase login successful`
- `❌ Supabase login error: [error message]`
- `👤 User already logged in: [email]`

## 📞 Getting Help

If you encounter issues:

1. **Check the Supabase dashboard** for error logs
2. **Review the console output** in your development server
3. **Verify your database schema** matches the expected structure
4. **Test authentication** in the Supabase dashboard first

## 🌐 Related Documentation

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)
- [React Native Auth Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**SOLACE Mobile** - Secure authentication for social workers 🔐 