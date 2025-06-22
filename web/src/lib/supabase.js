import { createClient } from '@supabase/supabase-js';

// Supabase configuration - MUST be set via environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
  throw new Error('Supabase configuration is missing. Please check your environment variables.');
}

// Debug logging
console.log('🔧 Web Supabase config:', { 
  url: supabaseUrl, 
  keyLength: supabaseAnonKey?.length
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database table names
export const TABLES = {
  USERS: 'users',
  CLIENTS: 'clients',
  CASE_NOTES: 'case_notes',
  TASKS: 'tasks',
  RESOURCES: 'resources',
  VOICE_SESSIONS: 'voice_sessions',
  NOTIFICATIONS: 'notifications',
  AGENCIES: 'agencies',
}; 