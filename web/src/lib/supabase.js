import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase configuration (matching mobile app)
const supabaseUrl = 'https://ccotkrhrqkldgfdjnlea.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb3RrcmhycWtsZGdmZGpubGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM4MDgsImV4cCI6MjA2NjA1OTgwOH0.-Q3LvNkbaNvfjnEoKwY53BNLPVIEvxoDzRD9z3-5NO0';

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