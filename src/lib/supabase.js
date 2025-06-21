import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

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