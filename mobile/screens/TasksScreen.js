import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  Linking,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../lib/api';

const { width } = Dimensions.get('window');

const TasksScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [googleCalendarStatus, setGoogleCalendarStatus] = useState(null);

  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b', 
    high: '#f97316',
    urgent: '#ef4444'
  };

  const statusColors = {
    pending: '#6b7280',
    in_progress: '#3b82f6',
    completed: '#10b981',
    cancelled: '#ef4444',
    overdue: '#dc2626'
  };

  const filters = [
    { key: 'all', label: 'All Tasks', icon: 'list' },
    { key: 'pending', label: 'Pending', icon: 'time' },
    { key: 'in_progress', label: 'In Progress', icon: 'play' },
    { key: 'completed', label: 'Completed', icon: 'checkmark' },
    { key: 'overdue', label: 'Overdue', icon: 'warning' },
    { key: 'due_today', label: 'Due Today', icon: 'today' },
    { key: 'upcoming', label: 'Upcoming', icon: 'calendar' }
  ];

  useEffect(() => {
    loadData();
    checkGoogleCalendarStatus();
  }, [selectedFilter]);

  const loadData = async () => {
    try {
      await Promise.all([
        loadTasks(),
        loadTaskStats()
      ]);
    } catch (error) {
      console.error('Error loading tasks data:', error);
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      let tasksData;
      
      switch (selectedFilter) {
        case 'overdue':
          tasksData = await apiService.getOverdueTasks();
          break;
        case 'due_today':
          tasksData = await apiService.getTasksDueToday();
          break;
        case 'upcoming':
          tasksData = await apiService.getUpcomingTasks(7);
          break;
        case 'all':
          tasksData = await apiService.getTasks({ limit: 100 });
          break;
        default:
          tasksData = await apiService.getTasks({ status: selectedFilter, limit: 100 });
      }
      
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    }
  };

  const loadTaskStats = async () => {
    try {
      const stats = await apiService.getTaskStats();
      setTaskStats(stats);
    } catch (error) {
      console.error('Error loading task stats:', error);
    }
  };

  const checkGoogleCalendarStatus = async () => {
    try {
      const status = await apiService.getGoogleCalendarStatus();
      setGoogleCalendarStatus(status);
    } catch (error) {
      console.error('Error checking Google Calendar status:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [selectedFilter]);

  const handleTaskPress = (task) => {
    navigation.navigate('TaskDetail', { taskId: task.id, task });
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await apiService.completeTask(taskId);
      await loadTasks(); // Refresh the list
      Alert.alert('Success', 'Task marked as completed!');
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to complete task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteTask(taskId);
              await loadTasks();
              Alert.alert('Success', 'Task deleted successfully!');
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleGoogleCalendarAuth = async () => {
    try {
      const response = await apiService.getGoogleCalendarAuthUrl();
      if (response.auth_url) {
        Alert.alert(
          'Google Calendar Integration',
          'You will be redirected to Google to authorize calendar access.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Continue',
              onPress: () => Linking.openURL(response.auth_url)
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
      Alert.alert('Error', 'Failed to initialize Google Calendar integration.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeUntilDue = (timeString) => {
    if (!timeString) return '';
    return ` (${timeString})`;
  };

  const renderTask = (task) => (
    <TouchableOpacity
      key={task.id}
      style={[styles.taskCard, { borderLeftColor: priorityColors[task.priority] }]}
      onPress={() => handleTaskPress(task)}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleRow}>
          <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColors[task.priority] }]}>
            <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.taskMeta}>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[task.status] }]}>
            <Text style={styles.statusText}>{task.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
          {task.google_calendar_event_id && (
            <Ionicons name="calendar" size={16} color="#10b981" style={styles.calendarIcon} />
          )}
        </View>
      </View>

      {task.description && (
        <Text style={styles.taskDescription} numberOfLines={2}>{task.description}</Text>
      )}

      <View style={styles.taskDetails}>
        <Text style={styles.dueDate}>
          {formatDate(task.due_date)}
          {task.time_until_due && (
            <Text style={[styles.timeUntilDue, { color: task.is_overdue ? '#ef4444' : '#6b7280' }]}>
              {formatTimeUntilDue(task.time_until_due)}
            </Text>
          )}
        </Text>
        
        {task.tags && task.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {task.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {task.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{task.tags.length - 3}</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.taskActions}>
        {task.status !== 'completed' && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleCompleteTask(task.id)}
          >
            <Ionicons name="checkmark" size={20} color="#10b981" />
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTask(task.id)}
        >
          <Ionicons name="trash" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderStatsCard = () => {
    if (!taskStats) return null;

    return (
      <TouchableOpacity style={styles.statsCard} onPress={() => setShowStatsModal(true)}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>Task Overview</Text>
          <Ionicons name="stats-chart" size={20} color="#6366f1" />
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{taskStats.total_tasks}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#10b981' }]}>{taskStats.completed_tasks}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{taskStats.pending_tasks}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#ef4444' }]}>{taskStats.overdue_tasks}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>
        
        <View style={styles.completionRate}>
          <Text style={styles.completionRateText}>
            Completion Rate: {taskStats.completion_rate}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Tasks</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.filterList}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterItem,
                  selectedFilter === filter.key && styles.selectedFilter
                ]}
                onPress={() => {
                  setSelectedFilter(filter.key);
                  setShowFilterModal(false);
                }}
              >
                <Ionicons 
                  name={filter.icon} 
                  size={20} 
                  color={selectedFilter === filter.key ? '#6366f1' : '#6b7280'} 
                />
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter.key && styles.selectedFilterText
                ]}>
                  {filter.label}
                </Text>
                {selectedFilter === filter.key && (
                  <Ionicons name="checkmark" size={20} color="#6366f1" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderStatsModal = () => (
    <Modal
      visible={showStatsModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowStatsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.statsModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Task Statistics</Text>
            <TouchableOpacity onPress={() => setShowStatsModal(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          {taskStats && (
            <ScrollView style={styles.statsDetails}>
              <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>Overview</Text>
                <View style={styles.statsDetailGrid}>
                  <View style={styles.statsDetailItem}>
                    <Text style={styles.statsDetailNumber}>{taskStats.total_tasks}</Text>
                    <Text style={styles.statsDetailLabel}>Total Tasks</Text>
                  </View>
                  <View style={styles.statsDetailItem}>
                    <Text style={styles.statsDetailNumber}>{taskStats.tasks_due_today}</Text>
                    <Text style={styles.statsDetailLabel}>Due Today</Text>
                  </View>
                  <View style={styles.statsDetailItem}>
                    <Text style={styles.statsDetailNumber}>{taskStats.upcoming_tasks_7_days}</Text>
                    <Text style={styles.statsDetailLabel}>Next 7 Days</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>Priority Breakdown</Text>
                <View style={styles.priorityBreakdown}>
                  {Object.entries(taskStats.priority_breakdown || {}).map(([priority, count]) => (
                    <View key={priority} style={styles.priorityItem}>
                      <View style={[styles.priorityDot, { backgroundColor: priorityColors[priority] }]} />
                      <Text style={styles.priorityLabel}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Text>
                      <Text style={styles.priorityCount}>{count}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>Google Calendar</Text>
                <View style={styles.calendarSection}>
                  <View style={styles.calendarStatus}>
                    <Ionicons 
                      name={googleCalendarStatus?.connected ? "checkmark-circle" : "close-circle"} 
                      size={24} 
                      color={googleCalendarStatus?.connected ? "#10b981" : "#ef4444"} 
                    />
                    <Text style={styles.calendarStatusText}>
                      {googleCalendarStatus?.connected ? "Connected" : "Not Connected"}
                    </Text>
                  </View>
                  
                  {!googleCalendarStatus?.connected && googleCalendarStatus?.available && (
                    <TouchableOpacity style={styles.connectButton} onPress={handleGoogleCalendarAuth}>
                      <Text style={styles.connectButtonText}>Connect Google Calendar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tasks</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterButton}>
            <Ionicons name="filter" size={24} color="#6366f1" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate('CreateTask')} 
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {renderStatsCard()}
        
        <View style={styles.tasksSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {filters.find(f => f.key === selectedFilter)?.label || 'Tasks'} ({tasks.length})
            </Text>
          </View>
          
          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyStateTitle}>No tasks found</Text>
              <Text style={styles.emptyStateText}>
                {selectedFilter === 'all' 
                  ? "Create your first task to get started"
                  : `No ${selectedFilter.replace('_', ' ')} tasks at the moment`
                }
              </Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => navigation.navigate('CreateTask')}
              >
                <Text style={styles.createButtonText}>Create Task</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.tasksList}>
              {tasks.map(renderTask)}
            </View>
          )}
        </View>
      </ScrollView>
      
      {renderFilterModal()}
      {renderStatsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    padding: 8,
    marginRight: 8,
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  completionRate: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  completionRateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366f1',
  },
  tasksSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  tasksList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskHeader: {
    marginBottom: 8,
  },
  taskTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flex: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#ffffff',
  },
  calendarIcon: {
    marginLeft: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  taskDetails: {
    marginBottom: 12,
  },
  dueDate: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 8,
  },
  timeUntilDue: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#6b7280',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  completeButtonText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  statsModal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  filterList: {
    padding: 20,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedFilter: {
    backgroundColor: '#f0f9ff',
  },
  filterText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
    flex: 1,
  },
  selectedFilterText: {
    color: '#6366f1',
    fontWeight: '500',
  },
  statsDetails: {
    padding: 20,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  statsDetailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  statsDetailNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statsDetailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  priorityBreakdown: {
    gap: 12,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  priorityLabel: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  priorityCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  calendarSection: {
    gap: 12,
  },
  calendarStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarStatusText: {
    fontSize: 14,
    color: '#1f2937',
  },
  connectButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TasksScreen; 