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
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Console log for app initialization
  useEffect(() => {
    console.log('🚀 SOLACE Mobile App initialized');
  }, []);

  const handleLogin = () => {
    console.log('🔐 Login attempt:', { email, password: password ? '***hidden***' : 'empty' });
    
    if (email === 'demo@solace.app' && password === 'demo123') {
      Alert.alert('✅ Login successful!', 'Welcome to SOLACE mobile!', [
        { text: 'Continue', style: 'default' }
      ]);
    } else {
      Alert.alert('📱 Mobile Login', `Mobile login attempt with email: ${email}`, [
        { text: 'Try Again', style: 'cancel' }
      ]);
    }
  };

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
            <Text style={styles.subtitle}>📱 Mobile-Ready Social Work Assistant</Text>
            
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

          {/* Login Form */}
          <View style={styles.form}>
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
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <LinearGradient
              colors={['#2563eb', '#1d4ed8']}
              style={styles.loginButton}
            >
              <TouchableOpacity 
                style={styles.loginButtonInner}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>📱 Sign In to Mobile</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Demo Credentials */}
            <LinearGradient
              colors={['#eff6ff', '#e0f2fe']}
              style={styles.demoCard}
            >
              <Text style={styles.demoTitle}>🎯 Demo Credentials:</Text>
              <Text style={styles.demoText}><Text style={styles.demoBold}>Email:</Text> demo@solace.app</Text>
              <Text style={styles.demoText}><Text style={styles.demoBold}>Password:</Text> demo123</Text>
            </LinearGradient>
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