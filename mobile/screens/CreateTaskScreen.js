import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiService from '../lib/api';

const CreateTaskScreen = ({ navigation, route }) => {
  const { clientId } = route.params || {};
  
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [showClientPicker, setShowClientPicker] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClientId, setSelectedClientId] = useState(clientId || '');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [enableNotifications, setEnableNotifications] = useState(false);
  
  // Date picker state
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const priorities = [
    { key: 'low', label: 'Low', color: '#10b981' },
    { key: 'medium', label: 'Medium', color: '#f59e0b' },
    { key: 'high', label: 'High', color: '#f97316' },
    { key: 'urgent', label: 'Urgent', color: '#ef4444' }
  ];

  const statuses = [
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' }
  ];

  const recurrenceOptions = [
    { key: 'none', label: 'No Repeat' },
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' }
  ];

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await apiService.getClients({ limit: 100 });
      setClients(response || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a task title.');
      return false;
    }

    if (startTime && endTime && startTime >= endTime) {
      Alert.alert('Validation Error', 'End time must be after start time.');
      return false;
    }

    if (estimatedDuration && (isNaN(estimatedDuration) || parseInt(estimatedDuration) <= 0)) {
      Alert.alert('Validation Error', 'Please enter a valid estimated duration in minutes.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        client_id: selectedClientId || null,
        priority,
        status,
        due_date: dueDate ? dueDate.toISOString() : null,
        start_time: startTime ? startTime.toISOString() : null,
        end_time: endTime ? endTime.toISOString() : null,
        location: location.trim() || null,
        notes: notes.trim() || null,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        estimated_duration_minutes: estimatedDuration ? parseInt(estimatedDuration) : null,
        recurrence
      };

      const newTask = await apiService.createTask(taskData);
      
      Alert.alert(
        'Success',
        'Task created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString();
  };

  const formatTime = (time) => {
    if (!time) return 'Select Time';
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderPrioritySelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Priority</Text>
      <View style={styles.prioritySelector}>
        {priorities.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.priorityButton,
              { borderColor: item.color },
              priority === item.key && { backgroundColor: item.color }
            ]}
            onPress={() => setPriority(item.key)}
          >
            <Text style={[
              styles.priorityButtonText,
              priority === item.key && { color: '#ffffff' }
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStatusSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Status</Text>
      <View style={styles.statusSelector}>
        {statuses.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.statusButton,
              status === item.key && styles.selectedStatusButton
            ]}
            onPress={() => setStatus(item.key)}
          >
            <Text style={[
              styles.statusButtonText,
              status === item.key && styles.selectedStatusButtonText
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderRecurrenceSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recurrence</Text>
      <View style={styles.recurrenceSelector}>
        {recurrenceOptions.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.recurrenceButton,
              recurrence === item.key && styles.selectedRecurrenceButton
            ]}
            onPress={() => setRecurrence(item.key)}
          >
            <Text style={[
              styles.recurrenceButtonText,
              recurrence === item.key && styles.selectedRecurrenceButtonText
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderClientSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Client (Optional)</Text>
      <TouchableOpacity
        style={styles.clientSelector}
        onPress={() => setShowClientPicker(!showClientPicker)}
      >
        <Text style={[
          styles.clientSelectorText,
          !selectedClientId && styles.placeholderText
        ]}>
          {selectedClientId 
            ? clients.find(c => c.id === selectedClientId)?.name || 'Select Client'
            : 'Select Client'
          }
        </Text>
        <Ionicons 
          name={showClientPicker ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#6b7280" 
        />
      </TouchableOpacity>
      
      {showClientPicker && (
        <View style={styles.clientList}>
          <TouchableOpacity
            style={styles.clientItem}
            onPress={() => {
              setSelectedClientId('');
              setShowClientPicker(false);
            }}
          >
            <Text style={styles.clientItemText}>No Client</Text>
          </TouchableOpacity>
          {clients.map((client) => (
            <TouchableOpacity
              key={client.id}
              style={styles.clientItem}
              onPress={() => {
                setSelectedClientId(client.id);
                setShowClientPicker(false);
              }}
            >
              <Text style={styles.clientItemText}>{client.name}</Text>
              {client.phone && (
                <Text style={styles.clientItemSubtext}>{client.phone}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Task</Text>
        <TouchableOpacity 
          onPress={handleSubmit} 
          style={[styles.saveButton, (!title.trim() || loading) && styles.disabledButton]}
          disabled={!title.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor="#9ca3af"
              multiline={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
              placeholderTextColor="#9ca3af"
              multiline={true}
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Client Selection */}
        {renderClientSelector()}

        {/* Priority and Status */}
        {renderPrioritySelector()}
        {renderStatusSelector()}

        {/* Timing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timing</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Due Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDueDatePicker(true)}
            >
              <Text style={[styles.dateButtonText, !dueDate && styles.placeholderText]}>
                {formatDate(dueDate)}
              </Text>
              <Ionicons name="calendar" size={20} color="#6b7280" />
            </TouchableOpacity>
            {dueDate && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setDueDate(null)}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.timeRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Start Time</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={[styles.dateButtonText, !startTime && styles.placeholderText]}>
                  {formatTime(startTime)}
                </Text>
                <Ionicons name="time" size={20} color="#6b7280" />
              </TouchableOpacity>
              {startTime && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setStartTime(null)}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>End Time</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={[styles.dateButtonText, !endTime && styles.placeholderText]}>
                  {formatTime(endTime)}
                </Text>
                <Ionicons name="time" size={20} color="#6b7280" />
              </TouchableOpacity>
              {endTime && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setEndTime(null)}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Estimated Duration (minutes)</Text>
            <TextInput
              style={styles.textInput}
              value={estimatedDuration}
              onChangeText={setEstimatedDuration}
              placeholder="e.g. 30"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Recurrence */}
        {renderRecurrenceSelector()}

        {/* Additional Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.textInput}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter location"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tags (comma-separated)</Text>
            <TextInput
              style={styles.textInput}
              value={tags}
              onChangeText={setTags}
              placeholder="e.g. meeting, urgent, housing"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional notes or instructions"
              placeholderTextColor="#9ca3af"
              multiline={true}
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Date/Time Pickers */}
      {showDueDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDueDatePicker(false);
            if (selectedDate) {
              setDueDate(selectedDate);
            }
          }}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={startTime || new Date()}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => {
            setShowStartTimePicker(false);
            if (selectedTime) {
              setStartTime(selectedTime);
            }
          }}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={endTime || (startTime ? new Date(startTime.getTime() + 60 * 60 * 1000) : new Date())}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => {
            setShowEndTimePicker(false);
            if (selectedTime) {
              setEndTime(selectedTime);
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  saveButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  prioritySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#ffffff',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  statusSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  selectedStatusButton: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  selectedStatusButtonText: {
    color: '#ffffff',
  },
  recurrenceSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recurrenceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  selectedRecurrenceButton: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  recurrenceButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
  },
  selectedRecurrenceButtonText: {
    color: '#ffffff',
  },
  clientSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
  },
  clientSelectorText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  clientList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    maxHeight: 200,
  },
  clientItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  clientItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
  clientItemSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  clearButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#6366f1',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bottomPadding: {
    height: 40,
  },
});

export default CreateTaskScreen; 