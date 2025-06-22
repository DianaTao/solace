import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthService } from '../lib/auth';

export default function HomeScreen({ user, onLogout }) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('🏠 HomeScreen initialized for user:', user?.email);
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      '🚪 Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await AuthService.signOut();
              console.log('🚪 User signed out from HomeScreen');
              onLogout();
            } catch (error) {
              console.error('❌ Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleProfileFix = async () => {
    console.log('🔧 Attempting to fix user profile from HomeScreen...');
    setIsLoading(true);
    
    try {
      const fixedProfile = await AuthService.createProfileForCurrentUser();
      
      if (fixedProfile) {
        console.log('✅ Profile fixed successfully from HomeScreen:', fixedProfile);
        Alert.alert(
          '✅ Profile Updated!', 
          `Your profile has been refreshed!\n\nName: ${fixedProfile.name}\nEmail: ${fixedProfile.email}`,
          [{ text: 'Great!', style: 'default' }]
        );
      } else {
        Alert.alert(
          'ℹ️ Profile OK', 
          'Your profile is already up to date!',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('❌ Profile fix failed from HomeScreen:', error.message);
      Alert.alert(
        '❌ Profile Fix Failed', 
        `Could not update your profile: ${error.message}`,
        [{ text: 'OK', style: 'cancel' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { 
      id: 'clients', 
      title: '👥 Clients', 
      subtitle: 'Manage client records',
      color: ['#3b82f6', '#1d4ed8']
    },
    { 
      id: 'cases', 
      title: '📋 Case Notes', 
      subtitle: 'Document case progress',
      color: ['#10b981', '#059669']
    },
    { 
      id: 'tasks', 
      title: '✅ Tasks', 
      subtitle: 'Track your to-dos',
      color: ['#f59e0b', '#d97706']
    },
    { 
      id: 'reports', 
      title: '📊 Reports', 
      subtitle: 'Generate reports',
      color: ['#8b5cf6', '#7c3aed']
    }
  ];

  const handleQuickAction = (actionId) => {
    Alert.alert(
      '🚧 Coming Soon!',
      `The ${actionId} feature is being developed. Stay tuned for updates!`,
      [{ text: 'OK', style: 'default' }]
    );
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
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.userName}>{user?.name || 'Social Worker'}</Text>
            </View>
            
            {/* Status Badges */}
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, styles.badgeGreen]}>
                <Text style={styles.badgeTextGreen}>✅ Online</Text>
              </View>
              <View style={[styles.badge, styles.badgeBlue]}>
                <Text style={styles.badgeTextBlue}>📱 Mobile</Text>
              </View>
              <View style={[styles.badge, styles.badgePurple]}>
                <Text style={styles.badgeTextPurple}>🔒 Secure</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionCard}
                  onPress={() => handleQuickAction(action.title)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={action.color}
                    style={styles.actionGradient}
                  >
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* User Profile Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Your Profile</Text>
            <LinearGradient
              colors={['#f0f9ff', '#e0f2fe']}
              style={styles.profileCard}
            >
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>📧 Email:</Text>
                <Text style={styles.profileValue}>{user?.email || 'N/A'}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>👤 Name:</Text>
                <Text style={styles.profileValue}>{user?.name || 'Not set'}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>🏢 Role:</Text>
                <Text style={styles.profileValue}>{user?.role || 'Social Worker'}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>🏛️ Agency:</Text>
                <Text style={styles.profileValue}>{user?.agency || 'Not specified'}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Action Buttons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Account Actions</Text>
            
            {/* Profile Fix Button */}
            {(!user?.name || user?.name === 'User') && (
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                style={styles.actionButton}
              >
                <TouchableOpacity 
                  style={styles.actionButtonInner}
                  onPress={handleProfileFix}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  <Text style={styles.actionButtonText}>
                    {isLoading ? '⏳ Updating Profile...' : '🔧 Update Profile'}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            )}

            {/* Logout Button */}
            <LinearGradient
              colors={['#dc2626', '#b91c1c']}
              style={styles.actionButton}
            >
              <TouchableOpacity 
                style={styles.actionButtonInner}
                onPress={handleLogout}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text style={styles.actionButtonText}>
                  {isLoading ? '⏳ Signing Out...' : '🚪 Sign Out'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>SOLACE - Social Work Operations Assistant</Text>
            <Text style={styles.footerSubtext}>🌍 Empowering social workers in the San Francisco Bay Area</Text>
            <View style={styles.footerFeatures}>
              <Text style={styles.featureText}>📱 Mobile Ready</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 2,
  },
  userName: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionGradient: {
    padding: 16,
    alignItems: 'center',
  },
  actionTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    textAlign: 'center',
  },
  profileCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    flex: 1,
  },
  profileValue: {
    fontSize: 14,
    color: '#1e40af',
    flex: 2,
    textAlign: 'right',
  },
  actionButton: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonInner: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 16,
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