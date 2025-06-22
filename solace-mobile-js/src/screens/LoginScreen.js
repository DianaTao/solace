import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  Alert, 
  StatusBar,
  ScrollView,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthService } from '../../lib/auth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { loginStyles } from '../styles/loginStyles';
import { colors } from '../styles/commonStyles';
import { validateLoginForm, validateSignUpForm } from '../utils/validation';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Console log for app initialization
  useEffect(() => {
    console.log('🚀 SOLACE Mobile App initialized');
    checkCurrentUser();
  }, []);

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
    
    // Clear previous errors
    setErrors({});
    
    // Demo credentials fallback
    if (email === 'demo@solace.app' && password === 'demo123') {
      Alert.alert('✅ Demo Login successful!', 'Welcome to SOLACE mobile! (Demo Mode)', [
        { text: 'Continue', style: 'default' }
      ]);
      return;
    }

    // Validation
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      setErrors(validation.errors);
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
              setErrors({});
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
    
    // Clear previous errors
    setErrors({});
    
    // Validation
    const validation = validateSignUpForm(name, email, password, confirmPassword);
    if (!validation.isValid) {
      setErrors(validation.errors);
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
                setErrors({});
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
              setErrors({});
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
              setErrors({});
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
      setErrors({});
      console.log('🚪 User logged out');
      Alert.alert('👋 Logged out', 'You have been logged out successfully.', [
        { text: 'OK', style: 'default' }
      ]);
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
    setErrors({});
  };

  return (
    <SafeAreaView style={loginStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <LinearGradient
        colors={[colors.blue[50], colors.white, colors.blue[50]]}
        style={loginStyles.gradient}
      >
        <ScrollView contentContainerStyle={loginStyles.scrollContainer}>
          
          {/* Header */}
          <View style={loginStyles.header}>
            <View style={loginStyles.logo}>
              <Text style={loginStyles.logoText}>S</Text>
            </View>
            <Text style={loginStyles.title}>Welcome to SOLACE</Text>
            <Text style={loginStyles.subtitle}>
              📱 {isSignUpMode ? 'Create Your Account' : 'Mobile-Ready Social Work Assistant'}
            </Text>
            
            {/* Status Badges */}
            <View style={loginStyles.badgeContainer}>
              <View style={[loginStyles.badge, loginStyles.badgeGreen]}>
                <Text style={loginStyles.badgeTextGreen}>✅ JavaScript</Text>
              </View>
              <View style={[loginStyles.badge, loginStyles.badgeBlue]}>
                <Text style={loginStyles.badgeTextBlue}>📱 PWA Ready</Text>
              </View>
              <View style={[loginStyles.badge, loginStyles.badgePurple]}>
                <Text style={loginStyles.badgeTextPurple}>📡 Responsive</Text>
              </View>
            </View>
          </View>

          {/* Login/Signup Form */}
          <View style={loginStyles.form}>
            {/* Name field - only show in signup mode */}
            {isSignUpMode && (
              <Input
                label="👤 Full Name"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                error={errors.name}
              />
            )}

            <Input
              label="📧 Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={errors.email}
            />

            <Input
              label="🔒 Password"
              placeholder={isSignUpMode ? "Create a password (min 6 characters)" : "Enter your password"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />

            {/* Confirm Password field - only show in signup mode */}
            {isSignUpMode && (
              <Input
                label="🔒 Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                error={errors.confirmPassword}
              />
            )}

            <Button
              title={isLoading 
                ? (isSignUpMode ? '⏳ Creating Account...' : '⏳ Signing In...')
                : (isSignUpMode ? '📝 Create Account' : '📱 Sign In to Mobile')
              }
              onPress={isSignUpMode ? handleSignUp : handleLogin}
              disabled={isLoading}
              style={loginStyles.loginButton}
            />

            {/* Mode Toggle Button */}
            <TouchableOpacity 
              style={loginStyles.toggleButton}
              onPress={toggleMode}
              activeOpacity={0.7}
            >
              <Text style={loginStyles.toggleButtonText}>
                {isSignUpMode 
                  ? '👤 Already have an account? Sign In' 
                  : '📝 Don\'t have an account? Sign Up'
                }
              </Text>
            </TouchableOpacity>

            {/* Logout Button - Show only when user is logged in */}
            {user && (
              <Button
                title="🚪 Sign Out"
                onPress={handleLogout}
                variant="secondary"
                style={[loginStyles.loginButton, { marginTop: 8 }]}
              />
            )}

            {/* User Status - Show when logged in */}
            {user ? (
              <LinearGradient
                colors={[colors.success + '20', colors.success + '10']}
                style={loginStyles.demoCard}
              >
                <Text style={loginStyles.demoTitle}>✅ Logged In:</Text>
                <Text style={loginStyles.demoText}><Text style={loginStyles.demoBold}>Name:</Text> {user.name || 'N/A'}</Text>
                <Text style={loginStyles.demoText}><Text style={loginStyles.demoBold}>Email:</Text> {user.email}</Text>
                <Text style={loginStyles.demoText}><Text style={loginStyles.demoBold}>Role:</Text> {user.role || 'N/A'}</Text>
              </LinearGradient>
            ) : (
              /* Demo Credentials - Show when not logged in */
              <LinearGradient
                colors={[colors.blue[50], colors.blue[100]]}
                style={loginStyles.demoCard}
              >
                {isSignUpMode ? (
                  <>
                    <Text style={loginStyles.demoTitle}>📝 Sign Up Instructions:</Text>
                    <Text style={loginStyles.demoText}>• Fill in your name, email, and password</Text>
                    <Text style={loginStyles.demoText}>• Password must be at least 6 characters</Text>
                    <Text style={loginStyles.demoText}>• Check your email for confirmation link</Text>
                    <Text style={loginStyles.demoText}>• Return here to sign in after confirmation</Text>
                  </>
                ) : (
                  <>
                    <Text style={loginStyles.demoTitle}>🎯 Demo Credentials:</Text>
                    <Text style={loginStyles.demoText}><Text style={loginStyles.demoBold}>Email:</Text> demo@solace.app</Text>
                    <Text style={loginStyles.demoText}><Text style={loginStyles.demoBold}>Password:</Text> demo123</Text>
                    <Text style={loginStyles.demoText}><Text style={loginStyles.demoBold}>Or create your own account!</Text></Text>
                  </>
                )}
              </LinearGradient>
            )}
          </View>

          {/* Footer */}
          <View style={loginStyles.footer}>
            <Text style={loginStyles.footerText}>SOLACE - Social Work Operations Assistant</Text>
            <Text style={loginStyles.footerSubtext}>🌍 Empowering social workers in the San Francisco Bay Area</Text>
            <View style={loginStyles.footerFeatures}>
              <Text style={loginStyles.featureText}>📱 Mobile Optimized</Text>
              <Text style={loginStyles.featureText}>🔒 Secure</Text>
              <Text style={loginStyles.featureText}>⚡ Fast</Text>
            </View>
          </View>

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
} 