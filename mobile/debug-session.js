// Debug Session Storage - Mobile App
// Add this to your App.js temporarily to see what's stored

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './lib/supabase';

// Function to debug current session storage
export const debugSessionStorage = async () => {
  console.log('🔍 === DEBUGGING SESSION STORAGE ===');
  
  try {
    // 1. Check AsyncStorage for Supabase session
    const supabaseSession = await AsyncStorage.getItem('supabase.auth.token');
    console.log('📱 AsyncStorage Supabase session:', supabaseSession ? 'EXISTS' : 'NOT FOUND');
    
    if (supabaseSession) {
      const parsed = JSON.parse(supabaseSession);
      console.log('📱 Session details:', {
        hasAccessToken: !!parsed.access_token,
        hasRefreshToken: !!parsed.refresh_token,
        expiresAt: parsed.expires_at,
        tokenType: parsed.token_type,
        userEmail: parsed.user?.email
      });
    }

    // 2. Check current Supabase session
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('🔐 Current Supabase session:', session ? 'ACTIVE' : 'NONE');
    
    if (session) {
      console.log('🔐 Session info:', {
        userEmail: session.user?.email,
        userId: session.user?.id,
        expiresAt: new Date(session.expires_at * 1000).toLocaleString(),
        accessTokenLength: session.access_token?.length
      });
    }

    // 3. Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('👤 Current user:', user ? user.email : 'NONE');
    
    if (user) {
      console.log('👤 User details:', {
        id: user.id,
        email: user.email,
        emailConfirmed: !!user.email_confirmed_at,
        createdAt: user.created_at,
        metadata: user.user_metadata
      });
    }

    // 4. Check all AsyncStorage keys (Supabase related)
    const allKeys = await AsyncStorage.getAllKeys();
    const supabaseKeys = allKeys.filter(key => key.includes('supabase'));
    console.log('📱 All Supabase AsyncStorage keys:', supabaseKeys);

    // 5. Get all Supabase-related storage
    for (const key of supabaseKeys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`📱 ${key}:`, value ? 'HAS_DATA' : 'EMPTY');
    }

  } catch (error) {
    console.error('❌ Error debugging session storage:', error);
  }
};

// Function to clear all session storage (for testing)
export const clearSessionStorage = async () => {
  console.log('🗑️ Clearing all session storage...');
  
  try {
    // Sign out from Supabase (this clears session)
    await supabase.auth.signOut();
    
    // Clear AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    const supabaseKeys = allKeys.filter(key => key.includes('supabase'));
    
    for (const key of supabaseKeys) {
      await AsyncStorage.removeItem(key);
      console.log(`🗑️ Cleared: ${key}`);
    }
    
    console.log('✅ Session storage cleared');
  } catch (error) {
    console.error('❌ Error clearing session storage:', error);
  }
};

// Add these to your App.js component for testing:
/*
// Add this to your useEffect or a button press
useEffect(() => {
  // Debug session on app start
  debugSessionStorage();
}, []);

// Add this button to your UI for testing
<TouchableOpacity onPress={debugSessionStorage}>
  <Text>🔍 Debug Session</Text>
</TouchableOpacity>

<TouchableOpacity onPress={clearSessionStorage}>
  <Text>🗑️ Clear Session</Text>
</TouchableOpacity>
*/ 