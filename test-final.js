// Final test script
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ccotkrhrqkldgfdjnlea.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb3RrcmhycWtsZGdmZGpubGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM4MDgsImV4cCI6MjA2NjA1OTgwOH0.-Q3LvNkbaNvfjnEoKwY53BNLPVIEvxoDzRD9z3-5NO0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function finalTest() {
  console.log('🔐 Final authentication and API test...');
  
  const testEmail = 'final@test.com';
  const testPassword = 'TestPassword123!';
  
  try {
    // Create user
    console.log('📝 Creating user...');
    await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: { emailRedirectTo: 'http://localhost' }
    });
    
    // Sign in 
    console.log('🔐 Signing in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('❌ Sign in error:', signInError.message);
      return;
    }
    
    console.log('✅ Signed in successfully');
    
    // Test API with proper token
    console.log('�� Testing API with user token...');
    const response = await fetch('http://10.40.104.226:8000/api/clients?limit=5', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signInData.session.access_token}`
      }
    });
    
    console.log(`📊 Response: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API call successful!');
      console.log('📋 Clients data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ API call failed:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

finalTest().catch(console.error);
