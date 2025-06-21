import React, { useState } from 'react';
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

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email === 'demo@solace.app' && password === 'demo123') {
      Alert.alert('✅ Success!', 'Welcome to SOLACE Mobile!', [
        { text: 'Continue', style: 'default' }
      ]);
    } else {
      Alert.alert('📱 Mobile Login', `Login attempt with email: ${email}`, [
        { text: 'Try Again', style: 'cancel' }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.title}>Welcome to SOLACE</Text>
          <Text style={styles.subtitle}>📱 Native Mobile Social Work Assistant</Text>
          
          {/* Status Badges */}
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, styles.badgeGreen]}>
              <Text style={styles.badgeTextGreen}>✅ React Native</Text>
            </View>
            <View style={[styles.badge, styles.badgeBlue]}>
              <Text style={styles.badgeTextBlue}>📱 Native</Text>
            </View>
            <View style={[styles.badge, styles.badgePurple]}>
              <Text style={styles.badgeTextPurple}>⚡ Fast</Text>
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

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>📱 Sign In to Mobile</Text>
          </TouchableOpacity>

          {/* Demo Credentials */}
          <View style={styles.demoCard}>
            <Text style={styles.demoTitle}>🎯 Demo Credentials:</Text>
            <Text style={styles.demoText}><Text style={styles.demoBold}>Email:</Text> demo@solace.app</Text>
            <Text style={styles.demoText}><Text style={styles.demoBold}>Password:</Text> demo123</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SOLACE - Social Work Operations Assistant</Text>
          <Text style={styles.footerSubtext}>🌍 Empowering social workers in the San Francisco Bay Area</Text>
          <View style={styles.footerFeatures}>
            <Text style={styles.featureText}>📱 Native Mobile</Text>
            <Text style={styles.featureText}>🔒 Secure</Text>
            <Text style={styles.featureText}>⚡ Offline Ready</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginHorizontal: 4,
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
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  loginButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  demoCard: {
    backgroundColor: '#eff6ff',
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
    paddingTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 12,
  },
  footerFeatures: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  featureText: {
    fontSize: 10,
    color: '#6b7280',
  },
}); 