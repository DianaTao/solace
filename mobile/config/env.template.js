// Environment Configuration Template for SOLACE Mobile App
// Copy this file to env.js and replace with your actual credentials

// Supabase Configuration Template
// Replace these with your actual Supabase project credentials
const config = {
  development: {
    SUPABASE_URL: 'https://your-project-id.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here',
  },
  production: {
    SUPABASE_URL: 'https://your-project-id.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here',
  }
};

// Get current environment (defaults to development)
const ENV = __DEV__ ? 'development' : 'production';

// Export the configuration for the current environment
export default config[ENV];

/*
SETUP INSTRUCTIONS:

1. Copy this file to env.js:
   cp config/env.template.js config/env.js

2. Edit config/env.js with your actual Supabase credentials:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy your Project URL and anon/public key
   - Replace the placeholder values above

3. Example values:
   SUPABASE_URL: 'https://abcdefghijklmnop.supabase.co'
   SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2ODAwMCwiZXhwIjoyMDE0MzQ0MDAwfQ.example-key'

4. The env.js file is gitignored for security

SECURITY NOTES:
- Never commit real credentials to version control
- Use different credentials for development and production
- Rotate keys regularly in production
- The anon key is safe to use in client-side code (it's public)
- Never expose your service_role key in client-side code
*/ 