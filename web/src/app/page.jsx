'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '../lib/auth';
import HomeScreen from '../components/HomeScreen';
import WelcomeScreen from '../components/WelcomeScreen';

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

  // Otherwise show login/signup form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-6 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Install PWA Banner */}
        {isInstallable && (
          <div className="bg-blue-600 text-white p-3 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">📱 Install SOLACE App</p>
                <p className="text-xs opacity-90">Get the full mobile experience!</p>
              </div>
              <button
                onClick={handleInstall}
                className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Install
              </button>
            </div>
          </div>
        )}

        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center shadow-lg">
            <div className="h-8 w-8 text-blue-600 font-bold text-2xl">S</div>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            Welcome to SOLACE
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            📱 {isSignUpMode ? 'Create Your Account' : 'Mobile-Ready Social Work Assistant'}
          </p>
          <div className="mt-2 flex items-center justify-center space-x-2 text-xs">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
              ✅ JavaScript
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              📱 PWA Ready
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800">
              📡 Responsive
            </span>
          </div>
        </div>

        <form className="space-y-4" onSubmit={isSignUpMode ? handleSignUp : handleLogin}>
          {/* Name field - only show in signup mode */}
          {isSignUpMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                👤 Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-base placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📧 Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-base placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔒 Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignUpMode ? "Create a password (min 6 characters)" : "Enter your password"}
              className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-base placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
              required
            />
          </div>

          {/* Confirm Password field - only show in signup mode */}
          {isSignUpMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔒 Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-base placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform active:scale-95 transition-all duration-150 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading 
              ? (isSignUpMode ? '⏳ Creating Account...' : '⏳ Signing In...')
              : (isSignUpMode ? '📝 Create Account' : '📱 Sign In to Web App')
            }
          </button>

          {/* Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleMode}
            className="w-full text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {isSignUpMode 
              ? '👤 Already have an account? Sign In' 
              : '📝 Don\'t have an account? Sign Up'
            }
          </button>

          {/* Logout Button - Show only when user is logged in */}
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium py-3 px-6 rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transform active:scale-95 transition-all duration-150 shadow-lg"
            >
              🚪 Sign Out
            </button>
          )}

          {/* User Status - Show when logged in */}
          {user ? (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <div className="text-sm text-green-700">
                <p className="font-medium mb-2">✅ Logged In:</p>
                <div className="space-y-1 text-xs">
                  <p><strong>Name:</strong> {user.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role || 'N/A'}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Demo Credentials - Show when not logged in */
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="text-sm text-blue-700">
                {isSignUpMode ? (
                  <>
                    <p className="font-medium mb-2">📝 Sign Up Instructions:</p>
                    <div className="space-y-1 text-xs">
                      <p>• Fill in your name, email, and password</p>
                      <p>• Password must be at least 6 characters</p>
                      <p>• Check your email for confirmation link</p>
                      <p>• Return here to sign in after confirmation</p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-medium mb-2">🎯 Demo Credentials:</p>
                    <div className="space-y-1 text-xs">
                      <p><strong>Email:</strong> demo@solace.app</p>
                      <p><strong>Password:</strong> demo123</p>
                      <p><strong>Or create your own account!</strong></p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </form>
        
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            SOLACE - Social Work Operations Assistant
          </p>
          <p className="text-xs text-gray-400">
            🌍 Empowering social workers in the San Francisco Bay Area
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span>📱 Mobile Optimized</span>
            <span>🔒 Secure</span>
            <span>⚡ Fast</span>
          </div>
        </div>
      </div>
    </div>
  );
}
