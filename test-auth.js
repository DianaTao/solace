// Test script to debug the authentication issue
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration (same as mobile app)
const supabaseUrl = 'https://ccotkrhrqkldgfdjnlea.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb3RrcmhycWtsZGdmZGpubGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM4MDgsImV4cCI6MjA2NjA1OTgwOH0.-Q3LvNkbaNvfjnEoKwY53BNLPVIEvxoDzRD9z3-5NO0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthentication() {
  console.log('🔐 Testing Authentication Flow...');
  
  try {
    // Step 1: Check if we have an existing session
    console.log('\n📋 Step 1: Check existing session');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return;
    }
    
    if (!session) {
      console.log('ℹ️ No existing session. Creating test user session...');
      
      // For testing, try to sign in with test credentials
      // Note: You'll need to create this user in Supabase dashboard first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      });
      
      if (signInError) {
        console.error('❌ Sign in error:', signInError.message);
        console.log('ℹ️ You may need to create a test user in Supabase dashboard first');
        
        // Try using the anon key directly as a token (this should fail but show us the logs)
        console.log('\n🔧 Testing with anon key as auth token (should fail but show logs)...');
        await testAPIWithToken(supabaseAnonKey);
        return;
      }
      
      console.log('✅ Signed in successfully');
      session = signInData.session;
    }
    
    console.log('✅ Session found:', {
      user: session.user?.email,
      expires_at: session.expires_at,
      token_type: session.token_type,
      access_token_length: session.access_token?.length
    });
    
    // Step 2: Test API call with the token
    console.log('\n📋 Step 2: Test API call with session token');
    await testAPIWithToken(session.access_token);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testAPIWithToken(token) {
  console.log(`🔑 Testing API with token: ${token?.substring(0, 20)}...`);
  
  try {
    const response = await fetch('http://10.40.104.226:8000/api/clients?limit=5', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log('📋 Response Body:', responseText);
    
    if (response.ok) {
      console.log('✅ API call successful!');
    } else {
      console.log('❌ API call failed');
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Run the test
testAuthentication().catch(console.error); 