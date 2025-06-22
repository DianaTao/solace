import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ onContinue }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log('👋 WelcomeScreen initialized');
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const slides = [
    {
      emoji: '🤝',
      title: 'Welcome to SOLACE',
      subtitle: 'Social Work Operations Assistant',
      description: 'Empowering social workers with modern tools to better serve their communities in the San Francisco Bay Area.',
      color: ['#3b82f6', '#1d4ed8']
    },
    {
      emoji: '📱',
      title: 'Mobile-First Design',
      subtitle: 'Work anywhere, anytime',
      description: 'Access your client information, case notes, and tasks from your mobile device or web browser.',
      color: ['#10b981', '#059669']
    },
    {
      emoji: '🔒',
      title: 'Secure & Private',
      subtitle: 'Your data is protected',
      description: 'Built with enterprise-grade security to protect sensitive client information and maintain confidentiality.',
      color: ['#8b5cf6', '#7c3aed']
    },
    {
      emoji: '⚡',
      title: 'Ready to Start?',
      subtitle: 'Join the SOLACE community',
      description: 'Sign in to your account or create a new one to begin streamlining your social work operations.',
      color: ['#f59e0b', '#d97706']
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onContinue();
    }
  };

  const handleSkip = () => {
    onContinue();
  };

  const currentSlideData = slides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1d4ed8" />

      <View style={styles.pulseContainer}>
        <Animated.View style={[styles.pulseCircle, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }, { transform: [{ scale: pulseAnim }] }]} />
        <Animated.View style={[styles.pulseCircle, { width: 600, height: 600, backgroundColor: 'rgba(59, 130, 246, 0.15)' }, { transform: [{ scale: pulseAnim }] }]} />
      </View>

      <LinearGradient
        colors={currentSlideData.color}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          
          {/* Skip Button */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            
            {/* Logo */}
            <Image 
              source={require('../assets/logo.png')} 
              style={styles.logo}
            />

            {/* Emoji Icon */}
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{currentSlideData.emoji}</Text>
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>{currentSlideData.title}</Text>
              <Text style={styles.subtitle}>{currentSlideData.subtitle}</Text>
            </View>

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.description}>{currentSlideData.description}</Text>
            </View>

            {/* Features List - Show on first slide */}
            {currentSlide === 0 && (
              <View style={styles.featuresSection}>
                <View style={styles.feature}>
                  <Text style={styles.featureIcon}>👥</Text>
                  <Text style={styles.featureText}>Client Management</Text>
                </View>
                <View style={styles.feature}>
                  <Text style={styles.featureIcon}>📋</Text>
                  <Text style={styles.featureText}>Case Documentation</Text>
                </View>
                <View style={styles.feature}>
                  <Text style={styles.featureIcon}>✅</Text>
                  <Text style={styles.featureText}>Task Tracking</Text>
                </View>
                <View style={styles.feature}>
                  <Text style={styles.featureIcon}>📊</Text>
                  <Text style={styles.featureText}>Progress Reports</Text>
                </View>
              </View>
            )}

          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            
            {/* Slide Indicators */}
            <View style={styles.indicators}>
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentSlide ? styles.activeIndicator : styles.inactiveIndicator
                  ]}
                />
              ))}
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonText}>
                  {currentSlide === slides.length - 1 ? '🚀 Get Started' : '➡️ Next'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Version Info */}
            <View style={styles.versionInfo}>
              <Text style={styles.versionText}>SOLACE Mobile v1.0</Text>
              <Text style={styles.versionSubtext}>Built for Social Workers</Text>
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
  },
  pulseContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 400,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  topBar: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  skipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 60,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    width: '100%',
    maxWidth: 280,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  bottomSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  indicators: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  inactiveIndicator: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  actionButton: {
    width: '100%',
    maxWidth: 280,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  versionInfo: {
    alignItems: 'center',
  },
  versionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  versionSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 2,
  },
}); 