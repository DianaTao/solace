import { createClient } from '@supabase/supabase-js';

// Supabase configuration - MUST be set via environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = 'Missing Supabase environment variables! Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY';
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌', errorMessage); // eslint-disable-line no-console
  }
  
  throw new Error('Supabase configuration is missing. Please check your environment variables.');
}

// Debug logging (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Web Supabase config:', { // eslint-disable-line no-console
  url: supabaseUrl, 
  keyLength: supabaseAnonKey?.length
});
}

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