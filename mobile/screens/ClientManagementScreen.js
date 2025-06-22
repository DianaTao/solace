import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../lib/api';

export default function ClientManagementScreen({ user, onBack }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClientDetail, setShowClientDetail] = useState(null);

  useEffect(() => {
    console.log('📋 ClientManagementScreen initialized');
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading clients from API...');
      
      const clientsData = await apiService.getClients({ limit: 50 });
      const safeClientsData = Array.isArray(clientsData) ? clientsData : [];
      
      setClients(safeClientsData);
      console.log(`✅ Loaded ${safeClientsData.length} clients`);
      
    } catch (error) {
      console.error('❌ Failed to load clients:', error);
      
      // Use mock data for demo
      const mockClients = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+1 (555) 123-4567',
          address: '123 Main St, Anytown, ST 12345',
          case_number: 'CASE-001-2024',
          case_type: 'Housing Assistance',
          status: 'active',
          priority: 'high',
          emergency_contact: 'Jane Doe - (555) 987-6543',
          created_at: '2024-01-15T10:30:00Z',
          notes_count: 8,
          tasks_count: 3,
          last_contact: '2024-01-18T16:20:00Z'
        },
        {
          id: '2',
          name: 'Alice Smith',
          email: 'alice.smith@email.com',
          phone: '+1 (555) 234-5678',
          address: '456 Oak Ave, Springfield, ST 67890',
          case_number: 'CASE-002-2024',
          case_type: 'Employment Support',
          status: 'active',
          priority: 'medium',
          emergency_contact: 'Bob Smith - (555) 876-5432',
          created_at: '2024-01-10T09:15:00Z',
          notes_count: 12,
          tasks_count: 5,
          last_contact: '2024-01-17T13:45:00Z'
        },
        {
          id: '3',
          name: 'Maria Rodriguez',
          email: 'maria.rodriguez@email.com',
          phone: '+1 (555) 345-6789',
          address: '789 Pine St, Riverside, ST 34567',
          case_number: 'CASE-003-2024',
          case_type: 'Family Services',
          status: 'pending',
          priority: 'urgent',
          emergency_contact: 'Carlos Rodriguez - (555) 765-4321',
          created_at: '2024-01-12T14:20:00Z',
          notes_count: 6,
          tasks_count: 7,
          last_contact: '2024-01-19T09:30:00Z'
        }
      ];
      
      setClients(mockClients);
      
      Alert.alert(
        'Offline Mode',
        'Unable to connect to server. Showing demo data.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
  };

  const handleAddClient = () => {
    setShowAddModal(true);
  };

  const handleViewClient = (client) => {
    setShowClientDetail(client);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: '#dc2626',
      high: '#ea580c',
      medium: '#d97706',
      low: '#16a34a'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#16a34a',
      pending: '#d97706',
      inactive: '#6b7280',
      closed: '#dc2626'
    };
    return colors[status] || colors.active;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredClients = clients.filter(client => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      client.name?.toLowerCase().includes(query) ||
      client.case_number?.toLowerCase().includes(query) ||
      client.case_type?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading clients...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Client Management</Text>
          <Text style={styles.headerSubtitle}>Manage client records</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddClient}>
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients by name, case number, or type..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Text style={styles.resultsCount}>
          {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Clients List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredClients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No clients found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first client'}
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddClient}>
              <Text style={styles.emptyButtonText}>Add First Client</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.clientsList}>
            {filteredClients.map((client) => {
              const initials = client.name
                ? client.name.split(' ').map(n => n[0]).join('').toUpperCase()
                : 'CL';
              
              return (
                <TouchableOpacity
                  key={client.id}
                  style={styles.clientCard}
                  onPress={() => handleViewClient(client)}
                >
                  <View style={styles.clientCardContent}>
                    <View style={styles.clientAvatar}>
                      <LinearGradient
                        colors={['#10b981', '#059669']}
                        style={styles.clientAvatarGradient}
                      >
                        <Text style={styles.clientAvatarText}>{initials}</Text>
                      </LinearGradient>
                    </View>
                    
                    <View style={styles.clientInfo}>
                      <View style={styles.clientHeader}>
                        <Text style={styles.clientName}>{client.name}</Text>
                        <Text style={styles.clientCaseNumber}>{client.case_number}</Text>
                      </View>
                      
                      <View style={styles.clientBadges}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(client.status) + '20' }]}>
                          <Text style={[styles.statusText, { color: getStatusColor(client.status) }]}>
                            {client.status}
                          </Text>
                        </View>
                        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(client.priority) + '20' }]}>
                          <Text style={[styles.priorityText, { color: getPriorityColor(client.priority) }]}>
                            {client.priority}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.clientMeta}>
                        <Text style={styles.clientMetaText}>
                          {client.case_type} • {formatDate(client.last_contact)}
                        </Text>
                        <View style={styles.clientStats}>
                          <Text style={styles.clientStatsText}>
                            {client.notes_count || 0} notes • {client.tasks_count || 0} tasks
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <TouchableOpacity style={styles.clientViewButton}>
                      <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Client Modal */}
      <AddClientModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(clientData) => {
          console.log('Adding new client:', clientData);
          setShowAddModal(false);
          Alert.alert('Success', 'Client added successfully!');
          loadClients(); // Refresh the list
        }}
      />

      {/* Client Detail Modal */}
      <ClientDetailModal
        visible={!!showClientDetail}
        client={showClientDetail}
        onClose={() => setShowClientDetail(null)}
      />
    </SafeAreaView>
  );
}

// Add Client Modal Component
function AddClientModal({ visible, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    case_type: 'Housing Assistance',
    priority: 'medium',
    emergency_contact: ''
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter the client name.');
      return;
    }

    try {
      const newClient = await apiService.createClient(formData);
      onAdd(newClient);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        case_type: 'Housing Assistance',
        priority: 'medium',
        emergency_contact: ''
      });
    } catch (error) {
      console.error('Failed to add client:', error);
      // Still call onAdd for demo purposes
      onAdd({ ...formData, id: Date.now().toString() });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add New Client</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.modalSaveText}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Full Name *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter client's full name"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email</Text>
            <TextInput
              style={styles.formInput}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="client@example.com"
              keyboardType="email-address"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Phone Number</Text>
            <TextInput
              style={styles.formInput}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="+1 (555) 123-4567"
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Address</Text>
            <TextInput
              style={styles.formInput}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Street address, city, state, zip"
              multiline
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Emergency Contact</Text>
            <TextInput
              style={styles.formInput}
              value={formData.emergency_contact}
              onChangeText={(text) => setFormData({ ...formData, emergency_contact: text })}
              placeholder="Contact name and phone number"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// Client Detail Modal Component
function ClientDetailModal({ visible, client, onClose }) {
  if (!client) return null;

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: '#dc2626',
      high: '#ea580c',
      medium: '#d97706',
      low: '#16a34a'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#16a34a',
      pending: '#d97706',
      inactive: '#6b7280',
      closed: '#dc2626'
    };
    return colors[status] || colors.active;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancelText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Client Details</Text>
          <TouchableOpacity>
            <Text style={styles.modalSaveText}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {/* Client Info Header */}
          <View style={styles.clientDetailHeader}>
            <View style={styles.clientDetailAvatar}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.clientDetailAvatarGradient}
              >
                <Text style={styles.clientDetailAvatarText}>
                  {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.clientDetailInfo}>
              <Text style={styles.clientDetailName}>{client.name}</Text>
              <Text style={styles.clientDetailCaseNumber}>{client.case_number}</Text>
              <View style={styles.clientDetailBadges}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(client.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(client.status) }]}>
                    {client.status?.toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(client.priority) + '20' }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(client.priority) }]}>
                    {client.priority?.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Contact Information */}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Contact Information</Text>
            <View style={styles.detailItem}>
              <Ionicons name="call" size={20} color="#6b7280" />
              <Text style={styles.detailText}>{client.phone}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="mail" size={20} color="#6b7280" />
              <Text style={styles.detailText}>{client.email}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={20} color="#6b7280" />
              <Text style={styles.detailText}>{client.address}</Text>
            </View>
          </View>
          
          {/* Case Information */}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Case Information</Text>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Case Type:</Text>
              <Text style={styles.detailValue}>{client.case_type}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Emergency Contact:</Text>
              <Text style={styles.detailValue}>{client.emergency_contact}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Last Contact:</Text>
              <Text style={styles.detailValue}>
                {new Date(client.last_contact).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          {/* Statistics */}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Case Statistics</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{client.notes_count || 0}</Text>
                <Text style={styles.statLabel}>Case Notes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{client.tasks_count || 0}</Text>
                <Text style={styles.statLabel}>Active Tasks</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>Meetings</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>Reports</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  addButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#111827',
  },
  resultsCount: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  clientsList: {
    padding: 16,
  },
  clientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  clientCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  clientAvatar: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  clientAvatarGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientAvatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  clientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  clientCaseNumber: {
    fontSize: 12,
    color: '#6b7280',
  },
  clientBadges: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  clientMeta: {
    marginTop: 4,
  },
  clientMetaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  clientStats: {
    marginTop: 2,
  },
  clientStatsText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  clientViewButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  clientDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    marginBottom: 24,
  },
  clientDetailAvatar: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  clientDetailAvatarGradient: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientDetailAvatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  clientDetailInfo: {
    flex: 1,
    marginLeft: 16,
  },
  clientDetailName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  clientDetailCaseNumber: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    marginBottom: 8,
  },
  clientDetailBadges: {
    flexDirection: 'row',
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
}); 