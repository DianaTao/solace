// Environment Configuration for SOLACE Mobile App
// This file contains environment-specific settings

// Supabase Configuration
// Replace these with your actual Supabase project credentials
const config = {
  development: {
    SUPABASE_URL: 'https://ccotkrhrqkldgfdjnlea.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb3RrcmhycWtsZGdmZGpubGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM4MDgsImV4cCI6MjA2NjA1OTgwOH0.-Q3LvNkbaNvfjnEoKwY53BNLPVIEvxoDzRD9z3-5NO0',
    // Python Backend API Configuration - Using IP address for mobile device access
    API_BASE_URL: 'http://10.40.104.226:8000',
    API_TIMEOUT: 10000, // 10 seconds
  },
  production: {
    SUPABASE_URL: 'https://ccotkrhrqkldgfdjnlea.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb3RrcmhycWtsZGdmZGpubGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM4MDgsImV4cCI6MjA2NjA1OTgwOH0.-Q3LvNkbaNvfjnEoKwY53BNLPVIEvxoDzRD9z3-5NO0',
    // Python Backend API Configuration (Update with your production URL)
    API_BASE_URL: 'https://your-backend-domain.com',
    API_TIMEOUT: 10000, // 10 seconds
  }
};

// Get current environment (defaults to development)
const ENV = __DEV__ ? 'development' : 'production';

// Export the configuration for the current environment
export default config[ENV];

// Example usage:
// import config from './config/env';
// console.log(config.SUPABASE_URL);
// console.log(config.API_BASE_URL);

/*
To set up your configuration:

1. Supabase Setup:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy your Project URL and anon/public key
   - Replace the placeholder values above

2. Backend API Setup:
   - For development: Keep http://localhost:8000 (default FastAPI port)
   - For production: Replace with your deployed backend URL
   - Make sure your backend is running and accessible

Example:
SUPABASE_URL: 'https://abcdefghijklmnop.supabase.co'
SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2ODAwMCwiZXhwIjoyMDE0MzQ0MDAwfQ.example-key'
API_BASE_URL: 'https://api.yourdomain.com'
*/ 