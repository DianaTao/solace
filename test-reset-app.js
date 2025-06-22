// Script to reset the mobile app's stored authentication data
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration (same as mobile app)
const supabaseUrl = 'https://ccotkrhrqkldgfdjnlea.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb3RrcmhycWtsZGdmZGpubGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM4MDgsImV4cCI6MjA2NjA1OTgwOH0.-Q3LvNkbaNvfjnEoKwY53BNLPVIEvxoDzRD9z3-5NO0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function resetAndTest() {
  console.log('🔄 Resetting authentication state...');
  
  try {
    // Sign out any existing session
    console.log('🚪 Signing out...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError && !signOutError.message.includes('session_not_found')) {
      console.error('❌ Sign out error:', signOutError);
    } else {
      console.log('✅ Signed out successfully (or no session was active)');
    }
    
    // Check current session status
    console.log('\n🔍 Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check error:', sessionError);
    } else if (session) {
      console.log('⚠️ Session still exists:', {
        user: session.user?.email,
        expires_at: session.expires_at
      });
    } else {
      console.log('✅ No session found - app should show login screen');
    }
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
  }
}

// Run the reset
resetAndTest().catch(console.error);
