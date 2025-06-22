import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  isLoading, 
  onLogin, 
  onSwitchToSignup 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [floatingAnim1] = useState(new Animated.Value(0));
  const [floatingAnim2] = useState(new Animated.Value(0));
  const [floatingAnim3] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Floating animations
    const createFloatingAnimation = (animValue, duration, delay = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    createFloatingAnimation(floatingAnim1, 3000, 0).start();
    createFloatingAnimation(floatingAnim2, 3000, 1000).start();
    createFloatingAnimation(floatingAnim3, 3000, 2000).start();
    pulseAnimation.start();
  }, []);

  const handleSubmit = () => {
    if (onLogin) {
      onLogin();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#dbeafe', '#e0e7ff', '#faf5ff']}
        style={styles.backgroundGradient}
      />

      {/* Background Blobs */}
      <View style={styles.backgroundElements}>
        <Animated.View 
          style={[
            styles.backgroundBlob1,
            {
              transform: [{
                scale: pulseAnim,
              }]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.2)', 'rgba(168, 85, 247, 0.2)']}
            style={styles.blobGradient}
          />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.backgroundBlob2,
            {
              transform: [{
                scale: pulseAnim,
              }]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(34, 197, 94, 0.2)', 'rgba(59, 130, 246, 0.2)']}
            style={styles.blobGradient}
          />
        </Animated.View>

        <Animated.View 
          style={[
            styles.backgroundBlob3,
            {
              transform: [{
                translateY: floatingAnim3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              }]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(251, 191, 36, 0.1)', 'rgba(249, 115, 22, 0.1)']}
            style={styles.blobGradient}
          />
        </Animated.View>
      </View>

      {/* Floating Icons */}
      <Animated.View 
        style={[
          styles.floatingIcon1,
          {
            transform: [{
              translateY: floatingAnim1.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -20],
              }),
            }]
          }
        ]}
      >
        <Ionicons name="heart" size={32} color="rgba(59, 130, 246, 0.3)" />
      </Animated.View>

      <Animated.View 
        style={[
          styles.floatingIcon2,
          {
            transform: [{
              translateY: floatingAnim2.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -20],
              }),
            }]
          }
        ]}
      >
        <Ionicons name="shield-checkmark" size={24} color="rgba(168, 85, 247, 0.3)" />
      </Animated.View>

      <Animated.View 
        style={[
          styles.floatingIcon3,
          {
            transform: [{
              translateY: floatingAnim3.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -20],
              }),
            }]
          }
        ]}
      >
        <Ionicons name="people" size={40} color="rgba(34, 197, 94, 0.3)" />
      </Animated.View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Animated.View 
              style={[
                styles.logoGlow,
                {
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <LinearGradient
                colors={['#2563eb', '#9333ea']}
                style={styles.logoGlowGradient}
              />
            </Animated.View>
            <View style={styles.logoBg}>
              <Ionicons name="clipboard" size={64} color="#2563eb" />
            </View>
          </View>
          
          <Text style={styles.heroTitle}>Welcome to Solace</Text>
          <Text style={styles.heroDescription}>
            Empowering social workers with intuitive tools to make a meaningful difference in people's lives.
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>10K+</Text>
              <Text style={styles.statLabel}>Social Workers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.statValuePurple]}>50K+</Text>
              <Text style={styles.statLabel}>Cases Managed</Text>
            </View>
          </View>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
            style={styles.formCard}
          >
            <View style={styles.formTopBorder}>
              <LinearGradient
                colors={['#3b82f6', '#9333ea', '#ec4899']}
                style={styles.topBorderGradient}
              />
            </View>

            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Welcome back</Text>
              <Text style={styles.formDescription}>
                Continue your journey of making a difference
              </Text>
            </View>

            <View style={styles.formContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
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
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#9ca3af" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#2563eb', '#9333ea']}
                  style={styles.loginButtonGradient}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onSwitchToSignup}>
              <Text style={styles.switchLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backgroundElements: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  backgroundBlob1: {
    position: 'absolute',
    top: -160,
    right: -160,
    width: 320,
    height: 320,
  },
  backgroundBlob2: {
    position: 'absolute',
    bottom: -160,
    left: -160,
    width: 384,
    height: 384,
  },
  backgroundBlob3: {
    position: 'absolute',
    top: height * 0.5,
    left: width * 0.25,
    width: 128,
    height: 128,
  },
  blobGradient: {
    flex: 1,
    borderRadius: 200,
    opacity: 0.6,
  },
  floatingIcon1: {
    position: 'absolute',
    top: 80,
    left: 80,
    zIndex: 1,
  },
  floatingIcon2: {
    position: 'absolute',
    top: 160,
    right: 128,
    zIndex: 1,
  },
  floatingIcon3: {
    position: 'absolute',
    bottom: 128,
    left: 128,
    zIndex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  logoGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 80,
    opacity: 0.3,
  },
  logoGlowGradient: {
    flex: 1,
    borderRadius: 80,
  },
  logoBg: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 10,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    background: 'linear-gradient(to right, #2563eb, #9333ea)',
    color: '#2563eb',
  },
  heroDescription: {
    fontSize: 18,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  statValuePurple: {
    color: '#9333ea',
  },
  statLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  formContainer: {
    flex: 1,
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.4,
    shadowRadius: 50,
    elevation: 15,
    position: 'relative',
    overflow: 'hidden',
  },
  formTopBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  topBorderGradient: {
    flex: 1,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  formDescription: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
  },
  formContent: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: '#4b5563',
  },
  switchLink: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
}); 