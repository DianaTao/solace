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
  Dimensions,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../lib/auth';
import apiService from '../lib/api';
import ClientManagementScreen from './ClientManagementScreen';
import ReportsScreen from './ReportsScreen';
import ReportViewerScreen from './ReportViewerScreen';
import TasksScreen from './TasksScreen';
import VoiceNoteRecorder from '../components/VoiceNoteRecorder';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen({ user, onLogout }) {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [reportViewerParams, setReportViewerParams] = useState(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      activeClients: 0,
      pendingTasks: 0,
      caseNotes: 0,
      reportsDue: 0
    },
    clients: [],
    tasks: [],
    caseNotes: [],
    reports: []
  });
  
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
    
    // Load dashboard data
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('📊 Loading dashboard data from API...');
      setApiConnected(true);
      
      const [clientsData, notesData, tasksData] = await Promise.all([
        apiService.getClients({ limit: 5 }),
        apiService.getCaseNotes({ limit: 5 }),
        apiService.getTasks({ limit: 5 })
      ]);

      // Ensure we have arrays (some endpoints may return placeholder objects)
      const safeClientsData = Array.isArray(clientsData) ? clientsData : [];
      const safeNotesData = Array.isArray(notesData) ? notesData : [];
      const safeTasksData = Array.isArray(tasksData) ? tasksData : [];

      // Update stats with real data
      setDashboardData({
        stats: {
          activeClients: safeClientsData.length,
          pendingTasks: safeTasksData.length,
          caseNotes: safeNotesData.length,
          reportsDue: 0, // Will be updated when reports endpoint is available
        },
        clients: safeClientsData,
        tasks: safeTasksData,
        caseNotes: safeNotesData,
        reports: []
      });
      
      console.log('✅ Dashboard data loaded successfully from API');
      console.log('📊 API Response Summary:', {
        clients: safeClientsData.length,
        tasks: safeTasksData.length,
        notes: safeNotesData.length
      });
      
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      
      // Check if it's an authentication error
      if (error.message === 'USER_NOT_AUTHENTICATED') {
        console.log('🔒 User not authenticated, showing login message');
        setApiConnected(false);
        setDashboardData({
          stats: {
            activeClients: 0,
            pendingTasks: 0,
            caseNotes: 0,
            reportsDue: 0
          },
          clients: [],
          tasks: [],
          caseNotes: [],
          reports: []
        });
      } else {
        // Other API errors - show offline mode
        setApiConnected(false);
        setDashboardData({
          stats: {
            activeClients: 0,
            pendingTasks: 0,
            caseNotes: 0,
            reportsDue: 0
          },
          clients: [],
          tasks: [],
          caseNotes: [],
          reports: []
        });
        
        // Show user-friendly error
        Alert.alert(
          'Connection Issue',
          'Unable to connect to the backend. Please check your connection and try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

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

  // Dynamic stats data based on API connection status
  const statsData = [
    { 
      label: 'Active Clients', 
      value: dashboardData.stats.activeClients.toString(), 
      subtitle: apiConnected ? 'From API' : 'Offline mode', 
      color: 'emerald' 
    },
    { 
      label: 'Pending Tasks', 
      value: dashboardData.stats.pendingTasks.toString(), 
      subtitle: apiConnected ? 'From API' : 'Offline mode', 
      color: 'cyan' 
    },
    { 
      label: 'Case Notes', 
      value: dashboardData.stats.caseNotes.toString(), 
      subtitle: apiConnected ? 'From API' : 'Offline mode', 
      color: 'teal' 
    },
    { 
      label: 'Reports Due', 
      value: dashboardData.stats.reportsDue.toString(), 
      subtitle: apiConnected ? 'From API' : 'Offline mode', 
      color: 'purple' 
    }
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
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setMenuVisible(false);
              handleNavigateToClients();
            }}
          >
            <Ionicons name="people" size={20} color="#6b7280" />
            <Text style={styles.menuItemText}>Clients</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="document-text" size={20} color="#6b7280" />
            <Text style={styles.menuItemText}>Case Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setMenuVisible(false);
              handleNavigateToTasks();
            }}
          >
            <Ionicons name="checkmark-circle" size={20} color="#6b7280" />
            <Text style={styles.menuItemText}>Tasks</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setMenuVisible(false);
              handleNavigateToReports();
            }}
          >
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

  const handleComingSoon = (feature) => {
    Alert.alert(
      'Coming Soon! 🚧',
      `The ${feature} feature is being developed and will be available soon.`,
      [{ text: 'OK' }]
    );
  };

  const handleNavigateToClients = () => {
    console.log('📋 Navigating to Client Management');
    setCurrentScreen('clients');
  };

  const handleNavigateHome = () => {
    console.log('🏠 Navigating back to Home');
    setCurrentScreen('home');
  };

  const handleNavigateToReports = () => {
    console.log('📊 Navigating to Reports');
    setCurrentScreen('reports');
  };

  const handleNavigateToTasks = () => {
    console.log('✅ Navigating to Tasks');
    setCurrentScreen('tasks');
  };

  const handleCreateCustomReport = () => {
    Alert.alert(
      'Create Custom Report',
      'Choose the type of report you want to generate:',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Monthly Report',
          onPress: () => handleGenerateMonthlyReport()
        },
        {
          text: 'Quarterly Report',
          onPress: () => handleGenerateQuarterlyReport()
        }
      ],
      { cancelable: true }
    );
  };

  const handleGenerateMonthlyReport = async () => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    Alert.alert(
      'Generate Monthly Report',
      `Generate case summary for ${month}/${year}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            try {
              setIsLoading(true);
              const response = await apiService.generateMonthlyCaseSummary(month, year);
              
              if (response.report) {
                setReportViewerParams({
                  report: response.report,
                  title: 'Monthly Case Summary'
                });
                setCurrentScreen('reportViewer');
              } else {
                Alert.alert('Success', 'Monthly report generated! Navigate to Reports to view it.');
                setCurrentScreen('reports');
              }
            } catch (error) {
              console.error('Error generating monthly report:', error);
              Alert.alert('Error', 'Failed to generate monthly report. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleGenerateQuarterlyReport = async () => {
    const currentDate = new Date();
    const quarter = Math.ceil((currentDate.getMonth() + 1) / 3);
    const year = currentDate.getFullYear();

    Alert.alert(
      'Generate Quarterly Report',
      `Generate outcome report for Q${quarter} ${year}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            try {
              setIsLoading(true);
              const response = await apiService.generateQuarterlyOutcomeReport(quarter, year);
              
              if (response.report) {
                setReportViewerParams({
                  report: response.report,
                  title: 'Quarterly Outcome Report'
                });
                setCurrentScreen('reportViewer');
              } else {
                Alert.alert('Success', 'Quarterly report generated! Navigate to Reports to view it.');
                setCurrentScreen('reports');
              }
            } catch (error) {
              console.error('Error generating quarterly report:', error);
              Alert.alert('Error', 'Failed to generate quarterly report. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // If we're on the client management screen, render that instead
  if (currentScreen === 'clients') {
    return (
      <ClientManagementScreen 
        user={user} 
        onBack={handleNavigateHome}
      />
    );
  }

  // If we're on the report viewer screen, render that instead
  if (currentScreen === 'reportViewer' && reportViewerParams) {
    return (
      <ReportViewerScreen 
        route={{ params: reportViewerParams }}
        navigation={{ 
          goBack: () => {
            setCurrentScreen('reports');
            setReportViewerParams(null);
          }
        }}
      />
    );
  }

  // If we're on the tasks screen, render that instead
  if (currentScreen === 'tasks') {
    return (
      <TasksScreen 
        navigation={{ 
          goBack: handleNavigateHome,
          navigate: (screenName, params) => {
            if (screenName === 'CreateTask') {
              // For now, just show a coming soon alert
              Alert.alert('Coming Soon', 'Task creation will be available soon!');
            } else if (screenName === 'TaskDetail') {
              // For now, just show a coming soon alert
              Alert.alert('Coming Soon', 'Task details will be available soon!');
            }
          }
        }}
      />
    );
  }

  // If we're on the reports screen, render that instead
  if (currentScreen === 'reports') {
    return (
      <ReportsScreen 
        navigation={{ 
          goBack: handleNavigateHome,
          navigate: (screenName, params) => {
            if (screenName === 'ReportViewer') {
              console.log('📄 Navigate to ReportViewer with params:', params);
              setReportViewerParams(params);
              setCurrentScreen('reportViewer');
            }
          }
        }}
      />
    );
  }

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

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#059669"
            colors={['#059669']}
          />
        }
      >
        
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
            <TouchableOpacity 
              style={[styles.viewAllButton, { backgroundColor: getColorClasses('emerald')[0] }]}
              onPress={handleNavigateToClients}
            >
              <Text style={styles.viewAllButtonText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.featureCardContent}>
            {dashboardData.clients.slice(0, 5).map((client, index) => {
              const initials = client.name ? client.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'CL';
              const colors = ['emerald', 'teal', 'cyan', 'purple', 'pink'];
              const clientColor = colors[index % colors.length];
              
              return (
                <TouchableOpacity key={client.id || index} style={styles.clientItem}>
                  <View style={[styles.clientAvatar, { backgroundColor: getColorClasses(clientColor)[0] }]}>
                    <Text style={styles.clientAvatarText}>{initials}</Text>
                  </View>
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>{client.name || 'Unknown Client'}</Text>
                    <Text style={styles.clientMeta}>
                      {client.case_number || 'No case number'} • {client.created_at || 'No date'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.clientViewButton}>
                    <Text style={[styles.clientViewButtonText, { color: getColorClasses('emerald')[0] }]}>View</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
          
          <TouchableOpacity 
            style={[styles.addButton, { borderColor: getColorClasses('emerald')[0] + '40' }]}
            onPress={handleNavigateToClients}
          >
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
            {dashboardData.tasks.slice(0, 5).map((task, index) => (
              <View key={task.id || index} style={styles.taskItem}>
                <View style={[styles.taskPriority, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                  <Ionicons name="checkmark-circle" size={16} color={getPriorityColor(task.priority)} />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskText}>{task.title || task.task || 'Untitled Task'}</Text>
                  <Text style={styles.taskMeta}>{task.due_date || task.due || 'No due date'}</Text>
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
            {dashboardData.caseNotes.slice(0, 5).map((note, index) => (
              <TouchableOpacity key={note.id || index} style={styles.noteItem}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteTitle}>{note.title || 'Untitled Note'}</Text>
                  <Text style={styles.noteTime}>{note.created_at || 'No date'}</Text>
                </View>
                <Text style={styles.noteText} numberOfLines={2}>
                  {note.content || note.note || 'No content available'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={[styles.addButton, { borderColor: getColorClasses('teal')[0] + '40' }]}
            onPress={() => setShowVoiceRecorder(true)}
          >
            <Ionicons name="mic" size={16} color={getColorClasses('teal')[0]} />
            <Text style={[styles.addButtonText, { color: getColorClasses('teal')[0] }]}>Record Voice Note</Text>
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
            <TouchableOpacity 
              style={[styles.viewAllButton, { backgroundColor: getColorClasses('purple')[0] }]}
              onPress={handleNavigateToReports}
            >
              <Text style={styles.viewAllButtonText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.featureCardContent}>
            {dashboardData.reports.slice(0, 5).map((report, index) => {
              const colors = ['purple', 'pink', 'cyan', 'emerald', 'teal'];
              const reportColor = colors[index % colors.length];
              
              return (
                <View key={report.id || index} style={styles.reportItem}>
                  <View style={[styles.reportIcon, { backgroundColor: getColorClasses(reportColor)[0] + '20' }]}>
                    <Ionicons name="bar-chart" size={18} color={getColorClasses(reportColor)[0]} />
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportTitle}>{report.title || 'Untitled Report'}</Text>
                    <Text style={styles.reportMeta}>{report.due_date || report.due || 'No due date'}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.generateButton}
                    onPress={handleCreateCustomReport}
                  >
                    <Text style={[styles.generateButtonText, { color: getColorClasses(reportColor)[0] }]}>Generate</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
          
          <TouchableOpacity 
            style={[styles.addButton, { borderColor: getColorClasses('purple')[0] + '40' }]}
            onPress={handleCreateCustomReport}
          >
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

      {/* Voice Note Recorder */}
      <VoiceNoteRecorder
        visible={showVoiceRecorder}
        onClose={() => setShowVoiceRecorder(false)}
        clientId={null} // For general notes, will be enhanced later for client-specific notes
        onNoteCreated={(note) => {
          console.log('🎤✅ Voice note created:', note);
          // Refresh dashboard data to show new note
          loadDashboardData();
        }}
        title="Record Case Note"
      />
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