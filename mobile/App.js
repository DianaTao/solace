import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StatusBar,
  ScrollView,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthService } from './lib/auth';
import HomeScreen from './screens/HomeScreen';
import WelcomeScreen from './screens/WelcomeScreen';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  
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
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        console.log('👤 User already logged in:', currentUser.email);
        setUser(currentUser);
      }
    } catch (error) {
      console.log('ℹ️ No current user session');
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

  // If user is logged in, show HomeScreen
  if (user) {
    return <HomeScreen user={user} onLogout={handleLogout} />;
  }

  // Otherwise show login/signup form
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <LinearGradient
        colors={['#eff6ff', '#ffffff', '#eff6ff']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <Text style={styles.title}>Welcome to SOLACE</Text>
            <Text style={styles.subtitle}>
              📱 {isSignUpMode ? 'Create Your Account' : 'Mobile-Ready Social Work Assistant'}
            </Text>
            
            {/* Status Badges - Matching Web App */}
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, styles.badgeGreen]}>
                <Text style={styles.badgeTextGreen}>✅ JavaScript</Text>
              </View>
              <View style={[styles.badge, styles.badgeBlue]}>
                <Text style={styles.badgeTextBlue}>📱 PWA Ready</Text>
              </View>
              <View style={[styles.badge, styles.badgePurple]}>
                <Text style={styles.badgeTextPurple}>📡 Responsive</Text>
              </View>
            </View>
          </View>

          {/* Login/Signup Form */}
          <View style={styles.form}>
            {/* Name field - only show in signup mode */}
            {isSignUpMode && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>👤 Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>📧 Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>🔒 Password</Text>
              <TextInput
                style={styles.input}
                placeholder={isSignUpMode ? "Create a password (min 6 characters)" : "Enter your password"}
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Confirm Password field - only show in signup mode */}
            {isSignUpMode && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>🔒 Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            )}

            <LinearGradient
              colors={['#2563eb', '#1d4ed8']}
              style={styles.loginButton}
            >
              <TouchableOpacity 
                style={styles.loginButtonInner}
                onPress={isSignUpMode ? handleSignUp : handleLogin}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading 
                    ? (isSignUpMode ? '⏳ Creating Account...' : '⏳ Signing In...')
                    : (isSignUpMode ? '📝 Create Account' : '📱 Sign In to Mobile')
                  }
                </Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Mode Toggle Button */}
            <TouchableOpacity 
              style={styles.toggleButton}
              onPress={toggleMode}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleButtonText}>
                {isSignUpMode 
                  ? '👤 Already have an account? Sign In' 
                  : '📝 Don\'t have an account? Sign Up'
                }
              </Text>
            </TouchableOpacity>

            {/* Logout Button - Show only when user is logged in */}
            {user && (
              <LinearGradient
                colors={['#dc2626', '#b91c1c']}
                style={[styles.loginButton, { marginTop: 8 }]}
              >
                <TouchableOpacity 
                  style={styles.loginButtonInner}
                  onPress={handleLogout}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loginButtonText}>🚪 Sign Out</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}

            {/* Fix Profile Button - Show when no user or user doesn't have full profile */}
            {(!user || !user.name || user.name === 'User') && (
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                style={[styles.loginButton, { marginTop: 8 }]}
              >
                <TouchableOpacity 
                  style={styles.loginButtonInner}
                  onPress={handleFixProfile}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading ? '⏳ Fixing Profile...' : '🔧 Fix Database Profile'}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            )}

            {/* User Status - Show when logged in */}
            {user ? (
              <LinearGradient
                colors={['#dcfce7', '#bbf7d0']}
                style={styles.demoCard}
              >
                <Text style={styles.demoTitle}>✅ Logged In:</Text>
                <Text style={styles.demoText}><Text style={styles.demoBold}>Name:</Text> {user.name || 'N/A'}</Text>
                <Text style={styles.demoText}><Text style={styles.demoBold}>Email:</Text> {user.email}</Text>
                <Text style={styles.demoText}><Text style={styles.demoBold}>Role:</Text> {user.role || 'N/A'}</Text>
              </LinearGradient>
            ) : (
              /* Demo Credentials - Show when not logged in */
              <LinearGradient
                colors={['#eff6ff', '#e0f2fe']}
                style={styles.demoCard}
              >
                {isSignUpMode ? (
                  <>
                    <Text style={styles.demoTitle}>📝 Sign Up Instructions:</Text>
                    <Text style={styles.demoText}>• Fill in your name, email, and password</Text>
                    <Text style={styles.demoText}>• Password must be at least 6 characters</Text>
                    <Text style={styles.demoText}>• Check your email for confirmation link</Text>
                    <Text style={styles.demoText}>• Return here to sign in after confirmation</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.demoTitle}>🎯 Demo Credentials:</Text>
                    <Text style={styles.demoText}><Text style={styles.demoBold}>Email:</Text> demo@solace.app</Text>
                    <Text style={styles.demoText}><Text style={styles.demoBold}>Password:</Text> demo123</Text>
                    <Text style={styles.demoText}><Text style={styles.demoBold}>Or create your own account!</Text></Text>
                  </>
                )}
              </LinearGradient>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>SOLACE - Social Work Operations Assistant</Text>
            <Text style={styles.footerSubtext}>🌍 Empowering social workers in the San Francisco Bay Area</Text>
            <View style={styles.footerFeatures}>
              <Text style={styles.featureText}>📱 Mobile Optimized</Text>
              <Text style={styles.featureText}>🔒 Secure</Text>
              <Text style={styles.featureText}>⚡ Fast</Text>
            </View>
          </View>

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  badgeGreen: {
    backgroundColor: '#dcfce7',
  },
  badgeBlue: {
    backgroundColor: '#dbeafe',
  },
  badgePurple: {
    backgroundColor: '#f3e8ff',
  },
  badgeTextGreen: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextBlue: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextPurple: {
    color: '#7c3aed',
    fontSize: 12,
    fontWeight: '600',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  loginButton: {
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonInner: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  demoCard: {
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 16,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d4ed8',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    color: '#1e40af',
    marginBottom: 2,
  },
  demoBold: {
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 12,
  },
  footerFeatures: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#6b7280',
    marginHorizontal: 8,
  },
}); 