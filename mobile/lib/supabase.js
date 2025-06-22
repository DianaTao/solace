import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/env';

// Supabase configuration - Use environment-specific configuration
const isDev = __DEV__;
const supabaseUrl = config.SUPABASE_URL;
const supabaseAnonKey = config.SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Please check your config/env.js file');
  throw new Error('Supabase configuration is missing. Please check your environment configuration.');
}

// Debug logging
console.log('🔧 Supabase config:', { 
  url: supabaseUrl, 
  keyLength: supabaseAnonKey?.length,
  isDev 
});

// Create Supabase client with React Native specific configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable for React Native
  },
});

console.log('✅ Supabase client created successfully');

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