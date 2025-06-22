import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from './lib/auth';
import HomeScreen from './screens/HomeScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import APITestScreen from './screens/APITestScreen';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showAPITest, setShowAPITest] = useState(false);
  
  // Console log for app initialization
  useEffect(() => {
    console.log('🚀 SOLACE Mobile App initialized');
    checkWelcomeStatus();
    checkCurrentUser();
  }, []);

  // Check if user has already seen the welcome screen
  const checkWelcomeStatus = async () => {
    try {
      const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
      if (hasSeenWelcome === 'true') {
        setShowWelcome(false);
      }
    } catch (error) {
      console.log('ℹ️ Could not check welcome status:', error.message);
    }
  };

  // Mark welcome as seen
  const markWelcomeAsSeen = async () => {
    try {
      await AsyncStorage.setItem('hasSeenWelcome', 'true');
      setShowWelcome(false);
    } catch (error) {
      console.log('ℹ️ Could not save welcome status:', error.message);
      setShowWelcome(false); // Continue anyway
    }
  };

  // Check if user is already logged in
  const checkCurrentUser = async () => {
    try {
      console.log('🔍 Checking current user session...');
      
      // First check if there's a valid Supabase session
      const session = await AuthService.getCurrentSession();
      if (!session) {
        console.log('ℹ️ No active session found');
        return;
      }
      
      // Validate that it's not just an anon session
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb3RrcmhycWtsZGdmZGpubGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM4MDgsImV4cCI6MjA2NjA1OTgwOH0.-Q3LvNkbaNvfjnEoKwY53BNLPVIEvxoDzRD9z3-5NO0';
      
      if (session.access_token === anonKey) {
        console.log('ℹ️ Found anon session, not authenticated user session');
        return;
      }
      
      // Now get the user profile
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        console.log('👤 User already logged in:', currentUser.email);
        setUser(currentUser);
      }
    } catch (error) {
      console.log('ℹ️ No current user session:', error.message);
    }
  };

  const handleLogin = async () => {
    console.log('🔐 Login attempt:', { email, password: password ? '***hidden***' : 'empty' });
    
    // Demo credentials fallback
    if (email === 'demo@solace.app' && password === 'demo123') {
      Alert.alert('✅ Demo Login successful!', 'Welcome to SOLACE mobile! (Demo Mode)', [
        { text: 'Continue', style: 'default' }
      ]);
      return;
    }

    // Validation
    if (!email || !password) {
      Alert.alert('❌ Validation Error', 'Please enter both email and password.', [
        { text: 'OK', style: 'cancel' }
      ]);
      return;
    }

    // Supabase authentication
    setIsLoading(true);
    try {
      const result = await AuthService.signIn({ email, password });
      
      if (result.user) {
        console.log('✅ Supabase login successful:', result.user.email);
        setUser(result.user);
        Alert.alert('✅ Login successful!', `Welcome back, ${result.user.name || result.user.email}!`, [
          { text: 'Continue', style: 'default' }
        ]);
      }
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      
      // Provide helpful error messages
      let errorMessage = 'Please check your credentials and try again.';
      let alertButtons = [{ text: 'Try Again', style: 'cancel' }];
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = `Invalid email or password for ${email}. Please check your credentials or sign up if you don't have an account.`;
        alertButtons = [
          { text: 'Try Again', style: 'cancel' },
          { 
            text: 'Sign Up', 
            style: 'default',
            onPress: () => {
              setIsSignUpMode(true);
              setPassword('');
            }
          }
        ];
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in. Check your spam folder if you don\'t see it.';
      }
      
      Alert.alert('❌ Login Failed', errorMessage, alertButtons);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    console.log('📝 Sign up attempt:', { email, name, password: password ? '***hidden***' : 'empty' });
    
    // Validation
    if (!email || !password || !name) {
      Alert.alert('❌ Validation Error', 'Please fill in all required fields.', [
        { text: 'OK', style: 'cancel' }
      ]);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('❌ Validation Error', 'Passwords do not match.', [
        { text: 'OK', style: 'cancel' }
      ]);
      return;
    }

    if (password.length < 6) {
      Alert.alert('❌ Validation Error', 'Password must be at least 6 characters long.', [
        { text: 'OK', style: 'cancel' }
      ]);
      return;
    }

    // Supabase sign up
    setIsLoading(true);
    try {
      const result = await AuthService.signUp(email, password, {
        name: name,
        role: 'social_worker'
      });
      
      if (result.user) {
        console.log('✅ Supabase signup successful:', result.user.email);
        Alert.alert(
          '✅ Account Created!', 
          'Please check your email for a confirmation link before signing in.',
          [
            { 
              text: 'OK', 
              style: 'default',
              onPress: () => {
                setIsSignUpMode(false);
                // Clear form
                setName('');
                setConfirmPassword('');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Signup failed:', error.message);
      
      // Provide helpful error messages
      let errorMessage = 'Failed to create account. Please try again.';
      let alertTitle = '❌ Sign Up Failed';
      let alertButtons = [{ text: 'Try Again', style: 'cancel' }];
      
      if (error.message.includes('already registered') || 
          error.message.includes('User already registered') ||
          error.message.includes('already exists')) {
        alertTitle = '👤 Account Already Exists';
        errorMessage = `Good news! You already have an account with ${email}.\n\nWould you like to sign in instead?`;
        alertButtons = [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: '🔐 Sign In Now', 
            style: 'default',
            onPress: () => {
              setIsSignUpMode(false);
              // Keep the email filled in for convenience
              setName('');
              setConfirmPassword('');
              // Clear the password field so they can enter their real password
              setPassword('');
            }
          }
        ];
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message.includes('row-level security policy')) {
        // Handle the RLS policy error more gracefully
        alertTitle = '✅ Account Created!';
        errorMessage = 'Your account was created successfully! Please check your email for a confirmation link, then sign in.';
        alertButtons = [
          { 
            text: 'Sign In', 
            style: 'default',
            onPress: () => {
              setIsSignUpMode(false);
              setName('');
              setConfirmPassword('');
            }
          }
        ];
      }
      
      Alert.alert(alertTitle, errorMessage, alertButtons);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
      // Clear all form fields
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setIsSignUpMode(false);
      console.log('🚪 User logged out from App.js');
    } catch (error) {
      console.error('❌ Logout error:', error.message);
    }
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    // Clear form when switching modes
    setPassword('');
    setConfirmPassword('');
    setName('');
  };

  const handleFixProfile = async () => {
    console.log('🔧 Attempting to fix missing user profile...');
    setIsLoading(true);
    
    try {
      const fixedProfile = await AuthService.createProfileForCurrentUser();
      
      if (fixedProfile) {
        console.log('✅ Profile fixed successfully:', fixedProfile);
        setUser(fixedProfile);
        Alert.alert(
          '✅ Profile Fixed!', 
          `Your database profile has been created successfully!\n\nName: ${fixedProfile.name}\nEmail: ${fixedProfile.email}`,
          [{ text: 'Great!', style: 'default' }]
        );
      } else {
        Alert.alert(
          'ℹ️ No Action Needed', 
          'You either already have a profile or are not logged in. Please sign in first if you haven\'t already.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('❌ Profile fix failed:', error.message);
      Alert.alert(
        '❌ Profile Fix Failed', 
        `Could not create your database profile: ${error.message}\n\nPlease try signing in again or contact support.`,
        [{ text: 'OK', style: 'cancel' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show welcome screen first
  if (showWelcome) {
    return <WelcomeScreen onContinue={markWelcomeAsSeen} />;
  }

  // Show API test screen if requested
  if (showAPITest) {
    return <APITestScreen onBack={() => setShowAPITest(false)} />;
  }

  // If user is logged in, show HomeScreen
  if (user) {
    return (
      <HomeScreen 
        user={user} 
        onLogout={handleLogout}
        onShowAPITest={() => setShowAPITest(true)}
      />
    );
  }

  // Otherwise show artistic login/signup screens
  if (isSignUpMode) {
    return (
      <SignupScreen 
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        name={name}
        setName={setName}
        isLoading={isLoading}
        onSignup={handleSignUp}
        onSwitchToLogin={() => setIsSignUpMode(false)}
      />
    );
  } else {
    return (
      <LoginScreen 
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isLoading={isLoading}
        onLogin={handleLogin}
        onSwitchToSignup={() => setIsSignUpMode(true)}
      />
    );
  }
}

// Styles removed - now using separate artistic screens 