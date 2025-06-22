'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock,
  FileText,
  CheckSquare,
  AlertCircle,
  TrendingUp,
  User,
  Settings,
  MoreHorizontal,
  MessageSquare,
  Activity,
  Mic
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Avatar, AvatarFallback } from './ui/Avatar';
import { Progress } from './ui/Progress';
import { EditClientForm } from './ClientForms';
import logger from '../lib/logger';
import apiService from '../lib/api';
import VoiceNoteRecorder from './VoiceNoteRecorder';

export default function ClientProfile({ clientId, onBack }) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [caseNotes, setCaseNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  useEffect(() => {
    if (clientId) {
      loadClientData();
    }
  }, [clientId]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      
      // Load client info and related data in parallel
      const [clientData, notesData, tasksData, reportsData] = await Promise.all([
        apiService.getClient(clientId),
        apiService.getClientCaseNotes(clientId, { limit: 10 }),
        apiService.getClientTasks(clientId, { limit: 10 }),
        apiService.getClientReports(clientId, { limit: 5 })
      ]);

      setClient(clientData);
      setCaseNotes(Array.isArray(notesData) ? notesData : []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setReports(Array.isArray(reportsData) ? reportsData : []);
      
      logger.info(`Loaded client profile: ${clientData.name}`, 'ClientProfile');
      
    } catch (error) {
      logger.error('Failed to load client data', error, 'ClientProfile');
      
      // Use mock data for demo
      setClient({
        id: clientId,
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, Anytown, ST 12345',
        case_number: 'CASE-001-2024',
        case_type: 'Housing Assistance',
        status: 'active',
        priority: 'high',
        emergency_contact: 'Jane Doe - (555) 987-6543',
        date_of_birth: '1985-03-15',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-20T14:45:00Z',
        notes_count: 8,
        tasks_count: 3,
        last_contact: '2024-01-18T16:20:00Z'
      });
      
      setCaseNotes([
        {
          id: '1',
          title: 'Initial Assessment',
          content: 'Client presented with housing instability. Currently staying in temporary accommodation.',
          category: 'assessment',
          created_at: '2024-01-15T10:30:00Z',
          social_worker: 'Sarah Wilson'
        },
        {
          id: '2',
          title: 'Housing Application Submitted',
          content: 'Completed housing application with local authority. Awaiting response.',
          category: 'housing',
          created_at: '2024-01-17T14:20:00Z',
          social_worker: 'Sarah Wilson'
        }
      ]);
      
      setTasks([
        {
          id: '1',
          title: 'Follow up on housing application',
          description: 'Contact housing office for application status',
          status: 'pending',
          priority: 'high',
          due_date: '2024-01-25T09:00:00Z',
          assigned_to: 'Sarah Wilson'
        },
        {
          id: '2',
          title: 'Schedule financial assessment',
          description: 'Book appointment with financial advisor',
          status: 'in_progress',
          priority: 'medium',
          due_date: '2024-01-28T10:00:00Z',
          assigned_to: 'Sarah Wilson'
        }
      ]);
      
    } finally {
      setLoading(false);
    }
  };

  const handleClientUpdate = (updatedClient) => {
    setClient(prev => ({ ...prev, ...updatedClient }));
    setShowEditForm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-600 bg-green-100',
      pending: 'text-yellow-600 bg-yellow-100',
      inactive: 'text-gray-600 bg-gray-100',
      closed: 'text-red-600 bg-red-100'
    };
    return colors[status] || colors.active;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'text-red-600 bg-red-100',
      high: 'text-orange-600 bg-orange-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-green-600 bg-green-100'
    };
    return colors[priority] || colors.medium;
  };

  const getTaskStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      in_progress: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      overdue: 'text-red-600 bg-red-100'
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-2 text-gray-600">Loading client profile...</span>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Client not found</h3>
        <p className="text-gray-600 mb-4">The requested client could not be loaded.</p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Profile</h1>
            <p className="text-gray-600">Detailed client information and case management</p>
          </div>
        </div>
        <Button
          onClick={() => setShowEditForm(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Client
        </Button>
      </div>

      {/* Client Info Header */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-2xl">
                  {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
                  <p className="text-emerald-600 font-medium">{client.case_number}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(client.status)}`}>
                    {client.status.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(client.priority)}`}>
                    {client.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {formatDate(client.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Last Contact: {formatDate(client.last_contact)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-600">{client.notes_count || 0}</div>
                <div className="text-sm text-gray-600">Case Notes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{client.tasks_count || 0}</div>
                <div className="text-sm text-gray-600">Active Tasks</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">3</div>
                <div className="text-sm text-gray-600">Meetings</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'notes', label: 'Case Notes', icon: FileText },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
            { id: 'activity', label: 'Activity', icon: Activity }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">{client.phone || 'Not provided'}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{client.email || 'Not provided'}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Address</div>
                  <div className="font-medium">{client.address || 'Not provided'}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Emergency Contact</div>
                  <div className="font-medium">{client.emergency_contact || 'Not provided'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Case Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Case Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Case Type</div>
                <div className="font-medium">{client.case_type}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Date of Birth</div>
                <div className="font-medium">{formatDate(client.date_of_birth)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Case Opened</div>
                <div className="font-medium">{formatDate(client.created_at)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Last Updated</div>
                <div className="font-medium">{formatDate(client.updated_at)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Case Notes</h3>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setShowVoiceRecorder(true)}
            >
              <Mic className="h-4 w-4 mr-2" />
              Record Voice Note
            </Button>
          </div>
          
          {caseNotes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No case notes yet</h3>
                <p className="text-gray-600 mb-4">Start documenting this client's case progress</p>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => setShowVoiceRecorder(true)}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Record First Voice Note
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {caseNotes.map((note) => (
                <Card key={note.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{note.title}</h4>
                      <span className="text-xs text-gray-500">{formatDateTime(note.created_at)}</span>
                    </div>
                    <p className="text-gray-600 mb-3">{note.content}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>By: {note.social_worker}</span>
                      <span>•</span>
                      <span className="capitalize">{note.category}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Tasks</h3>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
          
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                <p className="text-gray-600 mb-4">Create tasks to track action items for this client</p>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Task
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Due: {formatDateTime(task.due_date)}</span>
                      <span>•</span>
                      <span>Assigned to: {task.assigned_to}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Activity Feed</h3>
            <p className="text-gray-600">Activity tracking will be implemented here</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Client Modal */}
      {showEditForm && (
        <EditClientForm
          client={client}
          onClose={() => setShowEditForm(false)}
          onSuccess={handleClientUpdate}
        />
      )}

      {/* Voice Note Recorder */}
      <VoiceNoteRecorder
        open={showVoiceRecorder}
        onClose={() => setShowVoiceRecorder(false)}
        clientId={clientId}
        onNoteCreated={(note) => {
          logger.info('Voice note created for client', { clientId, note }, 'VoiceRecorder');
          // Refresh case notes
          loadClientData();
        }}
        title={`Record Voice Note for ${client.name}`}
      />
    </div>
  );
}
