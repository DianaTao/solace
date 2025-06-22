// Script to create a test user and test authentication
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://ccotkrhrqkldgfdjnlea.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb3RrcmhycWtsZGdmZGpubGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM4MDgsImV4cCI6MjA2NjA1OTgwOH0.-Q3LvNkbaNvfjnEoKwY53BNLPVIEvxoDzRD9z3-5NO0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAndTestUser() {
  console.log('🔐 Creating test user and testing authentication...');
  
  const testEmail = 'test@solace.com';
  const testPassword = 'TestPassword123!';
  
  try {
    // Step 1: Try to create a new user
    console.log('\n📋 Step 1: Create test user');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test User',
          role: 'social_worker'
        }
      }
    });
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('ℹ️ User already exists, trying to sign in...');
      } else {
        console.error('❌ Sign up error:', signUpError.message);
        return;
      }
    } else {
      console.log('✅ User created successfully:', signUpData.user?.email);
    }
    
    // Step 2: Sign in with the user
    console.log('\n📋 Step 2: Sign in with test user');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('❌ Sign in error:', signInError.message);
      return;
    }
    
    console.log('✅ Signed in successfully:', {
      user: signInData.user?.email,
      session_expires: signInData.session?.expires_at,
      access_token_length: signInData.session?.access_token?.length
    });
    
    // Step 3: Test API call with user token
    console.log('\n📋 Step 3: Test API call with user access token');
    await testAPIWithToken(signInData.session.access_token);
    
    // Step 4: Test profile creation
    console.log('\n📋 Step 4: Check/Create user profile');
    await checkUserProfile(signInData.user.id, signInData.user.email);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testAPIWithToken(token) {
  console.log(`🔑 Testing API with user token: ${token?.substring(0, 20)}...`);
  
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

async function checkUserProfile(userId, email) {
  try {
    // Check if profile exists
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);
    
    if (profileError) {
      console.error('❌ Profile check error:', profileError.message);
      return;
    }
    
    if (profiles && profiles.length > 0) {
      console.log('✅ Profile exists:', profiles[0]);
    } else {
      console.log('ℹ️ No profile found, creating one...');
      
      // Create profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: email,
            name: 'Test User',
            role: 'social_worker'
          }
        ])
        .select();
      
      if (createError) {
        console.error('❌ Profile creation error:', createError.message);
      } else {
        console.log('✅ Profile created:', newProfile[0]);
      }
    }
  } catch (error) {
    console.error('❌ Profile operation failed:', error);
  }
}

// Run the test
createAndTestUser().catch(console.error); 