const config = {
  development: {
    SUPABASE_URL: 'https://ccotkrhrqkldgfdjnlea.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb3RrcmhycWtsZGdmZGpubGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM4MDgsImV4cCI6MjA2NjA1OTgwOH0.-Q3LvNkbaNvfjnEoKwY53BNLPVIEvxoDzRD9z3-5NO0',
    API_BASE_URL: 'http://192.168.5.41:8000',
    API_TIMEOUT: 10000,
  },
  production: {
    SUPABASE_URL: 'https://ccotkrhrqkldgfdjnlea.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb3RrcmhycWtsZGdmZGpubGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM4MDgsImV4cCI6MjA2NjA1OTgwOH0.-Q3LvNkbaNvfjnEoKwY53BNLPVIEvxoDzRD9z3-5NO0',
    API_BASE_URL: 'https://your-backend-domain.com',
    API_TIMEOUT: 10000,
  }
};

const ENV = __DEV__ ? 'development' : 'production';
export default config[ENV]; 