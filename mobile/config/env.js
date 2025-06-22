// Environment Configuration for SOLACE Mobile App
// This file contains environment-specific settings

// Supabase Configuration
// Replace these with your actual Supabase project credentials
const config = {
  development: {
    SUPABASE_URL: 'https://ccotkrhrqkldgfdjnlea.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb3RrcmhycWtsZGdmZGpubGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM4MDgsImV4cCI6MjA2NjA1OTgwOH0.-Q3LvNkbaNvfjnEoKwY53BNLPVIEvxoDzRD9z3-5NO0',
  },
  production: {
    SUPABASE_URL: 'https://ccotkrhrqkldgfdjnlea.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb3RrcmhycWtsZGdmZGpubGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM4MDgsImV4cCI6MjA2NjA1OTgwOH0.-Q3LvNkbaNvfjnEoKwY53BNLPVIEvxoDzRD9z3-5NO00',
  }
};

// Get current environment (defaults to development)
const ENV = __DEV__ ? 'development' : 'production';

// Export the configuration for the current environment
export default config[ENV];

// Example usage:
// import config from './config/env';
// console.log(config.SUPABASE_URL);

/*
To set up your Supabase credentials:

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy your Project URL and anon/public key
4. Replace the placeholder values above

Example:
SUPABASE_URL: 'https://abcdefghijklmnop.supabase.co'
SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2ODAwMCwiZXhwIjoyMDE0MzQ0MDAwfQ.example-key'
*/ 