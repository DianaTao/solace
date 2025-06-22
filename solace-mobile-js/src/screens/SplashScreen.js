import React from 'react';
import { 
  Text, 
  View, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/Button';
import { splashStyles } from '../styles/splashStyles';
import { colors } from '../styles/commonStyles';

export default function SplashScreen({ onGetStarted }) {
  return (
    <SafeAreaView style={splashStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <LinearGradient
        colors={[colors.blue[50], colors.white, colors.blue[50]]}
        style={splashStyles.gradient}
      >
        <View style={splashStyles.content}>
          {/* Logo */}
          <View style={splashStyles.logoContainer}>
            <View style={splashStyles.logo}>
              <Text style={splashStyles.logoText}>S</Text>
            </View>
            <Text style={splashStyles.appName}>SOLACE</Text>
          </View>

          {/* Slogan */}
          <View style={splashStyles.sloganContainer}>
            <Text style={splashStyles.slogan}>AI powered resources, human ready.</Text>
          </View>

          {/* Get Started Button */}
          <View style={splashStyles.buttonContainer}>
            <Button
              title="Get Started"
              onPress={onGetStarted}
              size="large"
              style={splashStyles.getStartedButton}
            />
          </View>

          {/* Footer */}
          <View style={splashStyles.footer}>
            <Text style={splashStyles.footerText}>Social Work Operations Assistant</Text>
            <Text style={splashStyles.footerSubtext}>🌍 Empowering social workers in the San Francisco Bay Area</Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
} 