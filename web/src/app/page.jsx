'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '../lib/auth';
import HomeScreen from '../components/HomeScreen';
import WelcomeScreen from '../components/WelcomeScreen';
import LoginPage from '../components/LoginPage';
import SignupPage from '../components/SignupPage';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    console.log('🚀 SOLACE Web App initialized');
    
    // Check if user has seen welcome screen
    checkWelcomeStatus();
    
    // Add a small delay to ensure Supabase is fully initialized
    const initializeAuth = async () => {
      try {
        // Wait a moment for the client to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        await checkCurrentUser();
      } catch (error) {
        console.log('ℹ️ Auth initialization completed with no active session');
      }
    };
    
    initializeAuth();
    
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Check if user has already seen the welcome screen
  const checkWelcomeStatus = () => {
    try {
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
      if (hasSeenWelcome === 'true') {
        setShowWelcome(false);
      }
    } catch (error) {
      console.log('ℹ️ Could not check welcome status:', error.message);
    }
  };

  // Mark welcome as seen
  const markWelcomeAsSeen = () => {
    try {
      localStorage.setItem('hasSeenWelcome', 'true');
      setShowWelcome(false);
    } catch (error) {
      console.log('ℹ️ Could not save welcome status:', error.message);
      setShowWelcome(false); // Continue anyway
    }
  };

  // Check if user is already logged in
  const checkCurrentUser = async () => {
    try {
      console.log('🔍 Checking for existing user session...');
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        console.log('👤 User already logged in:', currentUser.email);
        setUser(currentUser);
      } else {
        console.log('ℹ️ No current user session found');
      }
    } catch (error) {
      // Handle any authentication errors gracefully
      if (error.message && error.message.includes('Auth session missing')) {
        console.log('ℹ️ No auth session (user not logged in)');
      } else {
        console.log('ℹ️ Error checking user session:', error.message || 'Unknown error');
      }
      // Ensure user state is null if there's any error
      setUser(null);
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        alert('SOLACE app installed successfully! 🎉');
      }
      setDeferredPrompt(null);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('🔐 Login attempt:', { email, password: password ? '***hidden***' : 'empty' });
    
    // Demo credentials fallback
    if (email === 'demo@solace.app' && password === 'demo123') {
      alert('✅ Demo Login successful! Welcome to SOLACE web app! (Demo Mode)');
      return;
    }

    // Validation
    if (!email || !password) {
      alert('❌ Validation Error: Please enter both email and password.');
      return;
    }

    // Supabase authentication
    setIsLoading(true);
    try {
      const result = await AuthService.signIn({ email, password });
      
      if (result.user) {
        console.log('✅ Supabase login successful:', result.user.email);
        setUser(result.user);
        alert(`✅ Login successful! Welcome back, ${result.user.name || result.user.email}!`);
      }
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      
      // Provide helpful error messages
      let errorMessage = 'Please check your credentials and try again.';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = `Invalid email or password for ${email}. Please check your credentials or sign up if you don't have an account.`;
        if (confirm(`${errorMessage}\n\nWould you like to sign up instead?`)) {
          setIsSignUpMode(true);
          setPassword('');
        }
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in. Check your spam folder if you don\'t see it.';
        alert(errorMessage);
      } else {
        alert(`❌ Login Failed: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    console.log('📝 Sign up attempt:', { email, name, password: password ? '***hidden***' : 'empty' });
    
    // Validation
    if (!email || !password || !name) {
      alert('❌ Validation Error: Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      alert('❌ Validation Error: Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      alert('❌ Validation Error: Password must be at least 6 characters long.');
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
        if (confirm('✅ Account Created!\n\nPlease check your email for a confirmation link before signing in.\n\nWould you like to switch to sign in mode?')) {
          setIsSignUpMode(false);
          // Clear form
          setName('');
          setConfirmPassword('');
        }
      }
    } catch (error) {
      console.error('❌ Signup failed:', error.message);
      
      // Provide helpful error messages
      if (error.message.includes('already registered') || 
          error.message.includes('User already registered') ||
          error.message.includes('already exists')) {
        if (confirm(`👤 Account Already Exists\n\nGood news! You already have an account with ${email}.\n\nWould you like to sign in instead?`)) {
          setIsSignUpMode(false);
          setName('');
          setConfirmPassword('');
          setPassword('');
        }
      } else if (error.message.includes('Invalid email')) {
        alert('❌ Sign Up Failed: Please enter a valid email address.');
      } else if (error.message.includes('row-level security policy')) {
        if (confirm('✅ Account Created!\n\nYour account was created successfully! Please check your email for a confirmation link, then sign in.\n\nWould you like to switch to sign in mode?')) {
          setIsSignUpMode(false);
          setName('');
          setConfirmPassword('');
        }
      } else {
        alert(`❌ Sign Up Failed: Failed to create account. Please try again.`);
      }
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
      console.log('🚪 User logged out from web app');
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

  // Show welcome screen first
  if (showWelcome) {
    return <WelcomeScreen onContinue={markWelcomeAsSeen} />;
  }

  // If user is logged in, show HomeScreen
  if (user) {
    return <HomeScreen user={user} onLogout={handleLogout} />;
  }

  // Otherwise show artistic login/signup pages
  if (isSignUpMode) {
    return (
      <SignupPage 
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
      <LoginPage 
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
