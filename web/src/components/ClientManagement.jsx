'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Eye, 
  UserPlus,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Tag,
  FileText,
  CheckCircle
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { Avatar, AvatarFallback } from './ui/Avatar';
import logger from '../lib/logger';
import apiService from '../lib/api';
import { AddClientForm, EditClientForm } from './ClientForms';
import ClientProfile from './ClientProfile';

export default function ClientManagement({ user }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientProfile, setShowClientProfile] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      
      // Try to load from API first
      try {
        const clientsData = await apiService.getClients({
          search: searchQuery || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter : undefined,
          limit: 50
        });
        setClients(Array.isArray(clientsData) ? clientsData : []);
        logger.info(`Loaded ${clientsData.length} clients from API`, 'ClientManagement');
      } catch (apiError) {
        // Fallback to mock data if API fails
        logger.warn('API failed, using mock data', apiError, 'ClientManagement');
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
            updated_at: '2024-01-20T14:45:00Z',
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
            updated_at: '2024-01-19T11:30:00Z',
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
            updated_at: '2024-01-21T10:15:00Z',
            notes_count: 6,
            tasks_count: 7,
            last_contact: '2024-01-19T09:30:00Z'
          }
        ];
        setClients(mockClients);
      }
    } catch (error) {
      logger.error('Failed to load clients', error, 'ClientManagement');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (clientData) => {
    try {
      const newClient = await apiService.createClient(clientData);
      setClients(prev => [newClient, ...prev]);
      setShowAddModal(false);
      logger.success(`Added new client: ${newClient.name}`, 'ClientManagement');
    } catch (error) {
      logger.error('Failed to add client', error, 'ClientManagement');
      throw error; // Let the form handle the error
    }
  };

  const handleUpdateClient = (updatedClient) => {
    setClients(prev => prev.map(c => 
      c.id === updatedClient.id ? { ...c, ...updatedClient } : c
    ));
    setSelectedClient(null);
  };

  const handleViewClient = (client) => {
    setShowClientProfile(client.id);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'text-red-600 bg-red-50 border-red-200',
      high: 'text-orange-600 bg-orange-50 border-orange-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-green-600 bg-green-50 border-green-200'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-600 bg-green-50 border-green-200',
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      inactive: 'text-gray-600 bg-gray-50 border-gray-200',
      closed: 'text-red-600 bg-red-50 border-red-200'
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
    const matchesSearch = !searchQuery || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.case_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || client.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // If we're showing a client profile, render that instead
  if (showClientProfile) {
    return (
      <ClientProfile 
        clientId={showClientProfile} 
        onBack={() => setShowClientProfile(null)} 
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-2 text-gray-600">Loading clients...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-600" />
            Client Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage client records and case information
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add New Client
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients by name, case number, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-white/20">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first client'}
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add First Client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="bg-white/80 backdrop-blur-sm border-white/20 hover:shadow-md transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                        {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{client.name}</h3>
                        <span className="text-sm text-gray-500">{client.case_number}</span>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(client.priority)}`}>
                          {client.priority}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          <span>{client.case_type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{client.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Last: {formatDate(client.last_contact)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {client.notes_count} notes
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {client.tasks_count} tasks
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewClient(client)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <AddClientForm
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddClient}
        />
      )}

      {/* Edit Client Modal */}
      {selectedClient && (
        <EditClientForm
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onSuccess={handleUpdateClient}
        />
      )}
    </div>
  );
}


