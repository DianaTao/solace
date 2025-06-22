import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../lib/auth';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen({ user, onLogout }) {
  const [isLoading, setIsLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Animation values for floating icons
  const heartFloat = useRef(new Animated.Value(0)).current;
  const shieldFloat = useRef(new Animated.Value(0)).current;
  const sparklesFloat = useRef(new Animated.Value(0)).current;
  const targetFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('🏠 HomeScreen initialized for user:', user?.email);
    
    // Start floating animations
    startFloatingAnimation(heartFloat, 3000);
    startFloatingAnimation(shieldFloat, 3500);
    startFloatingAnimation(sparklesFloat, 4000);
    startFloatingAnimation(targetFloat, 2800);
  }, []);

  const startFloatingAnimation = (animatedValue, duration) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getFloatingStyle = (animatedValue) => ({
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -15],
        }),
      },
    ],
  });

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
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
          'Profile Updated!', 
          `Your profile has been refreshed!\n\nName: ${fixedProfile.name}\nEmail: ${fixedProfile.email}`,
          [{ text: 'Great!', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Profile OK', 
          'Your profile is already up to date!',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('❌ Profile fix failed from HomeScreen:', error.message);
      Alert.alert(
        'Profile Fix Failed', 
        `Could not update your profile: ${error.message}`,
        [{ text: 'OK', style: 'cancel' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const statsData = [
    { label: 'Active Clients', value: '42', subtitle: '+2 this week', color: 'emerald' },
    { label: 'Pending Tasks', value: '12', subtitle: '3 due today', color: 'cyan' },
    { label: 'Case Notes', value: '128', subtitle: '+8 this week', color: 'teal' },
    { label: 'Reports Due', value: '5', subtitle: '2 due this week', color: 'purple' }
  ];

  const clientsData = [
    { name: 'John Doe', case: 'Case #4209', time: '2d ago', avatar: 'JD', color: 'emerald' },
    { name: 'Alice Smith', case: 'Case #4183', time: '3d ago', avatar: 'AS', color: 'teal' }
  ];

  const tasksData = [
    { task: 'Call John Doe about job placement', due: 'Due today at 2:00 PM', priority: 'high' },
    { task: 'Submit housing application', due: 'Due tomorrow at 9:00 AM', priority: 'medium' }
  ];

  const caseNotesData = [
    { title: 'Alice Smith - Housing', time: 'Today', note: 'Completed housing application. Waiting for approval from county office.' },
    { title: 'John Doe - Employment', time: 'Yesterday', note: 'Attended job interview. Follow-up scheduled for next week.' }
  ];

  const reportsData = [
    { title: 'Monthly Case Summary', due: 'Due in 5 days', color: 'purple' },
    { title: 'Quarterly Outcomes', due: 'Due in 2 weeks', color: 'pink' }
  ];

  const getColorClasses = (color) => {
    const colors = {
      emerald: ['#10b981', '#059669'],
      teal: ['#14b8a6', '#0d9488'],
      cyan: ['#06b6d4', '#0891b2'],
      purple: ['#8b5cf6', '#7c3aed'],
      pink: ['#ec4899', '#db2777']
    };
    return colors[color] || colors.emerald;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return colors[priority] || colors.medium;
  };

  const MenuOverlay = () => (
    <View style={styles.menuOverlay}>
      <TouchableOpacity 
        style={styles.menuBackdrop} 
        onPress={() => setMenuVisible(false)}
        activeOpacity={1}
      />
      <View style={styles.menuContent}>
        <View style={styles.menuHeader}>
          <View style={styles.logoContainer}>
            <Ionicons name="clipboard" size={24} color="#059669" />
            <Text style={styles.logoText}>Solace</Text>
          </View>
          <TouchableOpacity onPress={() => setMenuVisible(false)}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.menuItems}>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemActive]}>
            <Ionicons name="home" size={20} color="#059669" />
            <Text style={[styles.menuItemText, styles.menuItemTextActive]}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="people" size={20} color="#6b7280" />
            <Text style={styles.menuItemText}>Clients</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="document-text" size={20} color="#6b7280" />
            <Text style={styles.menuItemText}>Case Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="checkmark-circle" size={20} color="#6b7280" />
            <Text style={styles.menuItemText}>Tasks</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="bar-chart" size={20} color="#6b7280" />
            <Text style={styles.menuItemText}>Reports</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuFooter}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isLoading}
          >
            <Ionicons name="log-out" size={20} color="#dc2626" />
            <Text style={styles.logoutText}>
              {isLoading ? 'Signing Out...' : 'Sign Out'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Artistic Background */}
      <LinearGradient
        colors={['#ecfdf5', '#f0fdfa', '#ecfeff']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Background Blobs */}
      <View style={styles.backgroundBlobs}>
        <View style={[styles.blob, styles.blob1]} />
        <View style={[styles.blob, styles.blob2]} />
        <View style={[styles.blob, styles.blob3]} />
      </View>

      {/* Floating Icons */}
      <Animated.View style={[styles.floatingIcon, styles.heartIcon, getFloatingStyle(heartFloat)]}>
        <Ionicons name="heart" size={16} color="rgba(16, 185, 129, 0.3)" />
      </Animated.View>
      
      <Animated.View style={[styles.floatingIcon, styles.shieldIcon, getFloatingStyle(shieldFloat)]}>
        <Ionicons name="shield-checkmark" size={20} color="rgba(20, 184, 166, 0.3)" />
      </Animated.View>
      
      <Animated.View style={[styles.floatingIcon, styles.sparklesIcon, getFloatingStyle(sparklesFloat)]}>
        <Ionicons name="sparkles" size={18} color="rgba(139, 92, 246, 0.3)" />
      </Animated.View>
      
      <Animated.View style={[styles.floatingIcon, styles.targetIcon, getFloatingStyle(targetFloat)]}>
        <Ionicons name="radio-button-on" size={16} color="rgba(16, 185, 129, 0.3)" />
      </Animated.View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="menu" size={20} color="#374151" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.logoContainer}>
            <Ionicons name="clipboard" size={20} color="#059669" />
            <Text style={styles.headerLogoText}>Solace</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search" size={18} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications" size={18} color="#374151" />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>SW</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back, {user?.name || 'Sarah'}</Text>
          <Text style={styles.welcomeSubtitle}>Here's an overview of your work today.</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.statCard}
              activeOpacity={0.8}
            >
              <View style={styles.statCardContent}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={[styles.statValue, { color: getColorClasses(stat.color)[0] }]}>
                  {stat.value}
                </Text>
                <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Clients Card */}
        <View style={styles.featureCard}>
          <View style={[styles.featureCardBorder, { backgroundColor: getColorClasses('emerald')[0] }]} />
          <View style={styles.featureCardHeader}>
            <View>
              <Text style={[styles.featureCardTitle, { color: getColorClasses('emerald')[0] }]}>
                👥 Clients
              </Text>
              <Text style={styles.featureCardDescription}>Manage client records</Text>
            </View>
            <TouchableOpacity style={[styles.viewAllButton, { backgroundColor: getColorClasses('emerald')[0] }]}>
              <Text style={styles.viewAllButtonText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.featureCardContent}>
            {clientsData.map((client, index) => (
              <TouchableOpacity key={index} style={styles.clientItem}>
                <View style={[styles.clientAvatar, { backgroundColor: getColorClasses(client.color)[0] }]}>
                  <Text style={styles.clientAvatarText}>{client.avatar}</Text>
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <Text style={styles.clientMeta}>{client.case} • {client.time}</Text>
                </View>
                <TouchableOpacity style={styles.clientViewButton}>
                  <Text style={[styles.clientViewButtonText, { color: getColorClasses('emerald')[0] }]}>View</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={[styles.addButton, { borderColor: getColorClasses('emerald')[0] + '40' }]}>
            <Ionicons name="add" size={16} color={getColorClasses('emerald')[0]} />
            <Text style={[styles.addButtonText, { color: getColorClasses('emerald')[0] }]}>Add New Client</Text>
          </TouchableOpacity>
        </View>

        {/* Tasks Card */}
        <View style={styles.featureCard}>
          <View style={[styles.featureCardBorder, { backgroundColor: getColorClasses('cyan')[0] }]} />
          <View style={styles.featureCardHeader}>
            <View>
              <Text style={[styles.featureCardTitle, { color: getColorClasses('cyan')[0] }]}>
                ✅ Tasks
              </Text>
              <Text style={styles.featureCardDescription}>Track your to-dos</Text>
            </View>
            <TouchableOpacity style={[styles.viewAllButton, { backgroundColor: getColorClasses('cyan')[0] }]}>
              <Text style={styles.viewAllButtonText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.featureCardContent}>
            {tasksData.map((task, index) => (
              <View key={index} style={styles.taskItem}>
                <View style={[styles.taskPriority, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                  <Ionicons name="checkmark-circle" size={16} color={getPriorityColor(task.priority)} />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskText}>{task.task}</Text>
                  <Text style={styles.taskMeta}>{task.due}</Text>
                </View>
              </View>
            ))}
          </View>
          
          <TouchableOpacity style={[styles.addButton, { borderColor: getColorClasses('cyan')[0] + '40' }]}>
            <Ionicons name="add" size={16} color={getColorClasses('cyan')[0]} />
            <Text style={[styles.addButtonText, { color: getColorClasses('cyan')[0] }]}>Add New Task</Text>
          </TouchableOpacity>
        </View>

        {/* Case Notes Card */}
        <View style={styles.featureCard}>
          <View style={[styles.featureCardBorder, { backgroundColor: getColorClasses('teal')[0] }]} />
          <View style={styles.featureCardHeader}>
            <View>
              <Text style={[styles.featureCardTitle, { color: getColorClasses('teal')[0] }]}>
                📋 Case Notes
              </Text>
              <Text style={styles.featureCardDescription}>Document case progress</Text>
            </View>
            <TouchableOpacity style={[styles.viewAllButton, { backgroundColor: getColorClasses('teal')[0] }]}>
              <Text style={styles.viewAllButtonText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.featureCardContent}>
            {caseNotesData.map((note, index) => (
              <TouchableOpacity key={index} style={styles.noteItem}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteTitle}>{note.title}</Text>
                  <Text style={styles.noteTime}>{note.time}</Text>
                </View>
                <Text style={styles.noteText} numberOfLines={2}>{note.note}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={[styles.addButton, { borderColor: getColorClasses('teal')[0] + '40' }]}>
            <Ionicons name="add" size={16} color={getColorClasses('teal')[0]} />
            <Text style={[styles.addButtonText, { color: getColorClasses('teal')[0] }]}>Add New Note</Text>
          </TouchableOpacity>
        </View>

        {/* Reports Card */}
        <View style={styles.featureCard}>
          <View style={[styles.featureCardBorder, { backgroundColor: getColorClasses('purple')[0] }]} />
          <View style={styles.featureCardHeader}>
            <View>
              <Text style={[styles.featureCardTitle, { color: getColorClasses('purple')[0] }]}>
                📊 Reports
              </Text>
              <Text style={styles.featureCardDescription}>Generate reports</Text>
            </View>
            <TouchableOpacity style={[styles.viewAllButton, { backgroundColor: getColorClasses('purple')[0] }]}>
              <Text style={styles.viewAllButtonText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.featureCardContent}>
            {reportsData.map((report, index) => (
              <View key={index} style={styles.reportItem}>
                <View style={[styles.reportIcon, { backgroundColor: getColorClasses(report.color)[0] + '20' }]}>
                  <Ionicons name="bar-chart" size={18} color={getColorClasses(report.color)[0]} />
                </View>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportMeta}>{report.due}</Text>
                </View>
                <TouchableOpacity style={styles.generateButton}>
                  <Text style={[styles.generateButtonText, { color: getColorClasses(report.color)[0] }]}>Generate</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          <TouchableOpacity style={[styles.addButton, { borderColor: getColorClasses('purple')[0] + '40' }]}>
            <Ionicons name="add" size={16} color={getColorClasses('purple')[0]} />
            <Text style={[styles.addButtonText, { color: getColorClasses('purple')[0] }]}>Create Custom Report</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Fix Button */}
        {(!user?.name || user?.name === 'User') && (
          <TouchableOpacity 
            style={styles.profileFixButton}
            onPress={handleProfileFix}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.profileFixGradient}
            >
              <Ionicons name="person" size={20} color="white" />
              <Text style={styles.profileFixText}>
                {isLoading ? 'Updating Profile...' : 'Update Profile'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* Menu Overlay */}
      {menuVisible && <MenuOverlay />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  backgroundBlobs: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blob: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.05,
  },
  blob1: {
    width: 160,
    height: 160,
    backgroundColor: '#10b981',
    top: -80,
    left: -80,
  },
  blob2: {
    width: 192,
    height: 192,
    backgroundColor: '#06b6d4',
    top: screenHeight * 0.6,
    right: -96,
  },
  blob3: {
    width: 120,
    height: 120,
    backgroundColor: '#8b5cf6',
    bottom: -60,
    left: -60,
  },
  floatingIcon: {
    position: 'absolute',
    zIndex: 1,
  },
  heartIcon: {
    top: screenHeight * 0.2,
    left: 20,
  },
  shieldIcon: {
    top: screenHeight * 0.15,
    right: 32,
  },
  sparklesIcon: {
    top: screenHeight * 0.65,
    right: 20,
  },
  targetIcon: {
    top: screenHeight * 0.45,
    right: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    marginLeft: 6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  avatarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  welcomeSection: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardContent: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: '#9ca3af',
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  featureCardBorder: {
    height: 4,
    width: '100%',
  },
  featureCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  featureCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  featureCardDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewAllButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  featureCardContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  clientAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clientAvatarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  clientMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  clientViewButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clientViewButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  taskPriority: {
    padding: 6,
    borderRadius: 12,
    marginRight: 12,
    marginTop: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  taskMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  noteItem: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  noteTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  reportIcon: {
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  reportMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  generateButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  generateButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    borderWidth: 1,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  profileFixButton: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  profileFixGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  profileFixText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingTop: 50,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
    marginLeft: 8,
  },
  menuItems: {
    flex: 1,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  menuItemText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 12,
  },
  menuItemTextActive: {
    color: '#059669',
    fontWeight: '600',
  },
  menuFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#dc2626',
    marginLeft: 12,
    fontWeight: '500',
  },
}); 