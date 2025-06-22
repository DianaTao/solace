'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Select } from './ui/Select';
import { Badge } from './ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/Dialog';
import { Textarea } from './ui/Textarea';
import { Calendar } from 'lucide-react';
import { X, Plus, Filter, Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2, Play, Pause, BarChart3, Settings, Trash2 } from 'lucide-react';
import apiService from '../lib/api';
import logger from '../lib/logger';

const TasksScreen = ({ onBack, showCreateTask = false }) => {
  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(showCreateTask);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [googleCalendarStatus, setGoogleCalendarStatus] = useState(null);
  const [clients, setClients] = useState([]);

  // Form state for creating/editing tasks
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    client_id: '',
    priority: 'medium',
    status: 'pending',
    due_date: '',
    start_time: '',
    end_time: '',
    location: '',
    notes: '',
    tags: '',
    estimated_duration_minutes: '',
    recurrence: 'none'
  });

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800 border-gray-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    overdue: 'bg-red-100 text-red-800 border-red-200'
  };

  const filters = [
    { key: 'all', label: 'All Tasks', icon: 'list' },
    { key: 'pending', label: 'Pending', icon: 'clock' },
    { key: 'in_progress', label: 'In Progress', icon: 'play' },
    { key: 'completed', label: 'Completed', icon: 'check-circle' },
    { key: 'overdue', label: 'Overdue', icon: 'alert-circle' },
    { key: 'due_today', label: 'Due Today', icon: 'calendar' },
    { key: 'upcoming', label: 'Upcoming', icon: 'calendar' }
  ];

  useEffect(() => {
    // Reset loading state when filter changes
    setLoading(true);
    
    const fetchData = async () => {
      try {
        await loadData();
        await checkGoogleCalendarStatus();
        await loadClients();
      } catch (error) {
        logger.error('Error in TasksScreen initialization:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // If showCreateTask prop changes, update the modal state
    if (showCreateTask !== showCreateModal) {
      setShowCreateModal(showCreateTask);
    }
  }, [selectedFilter, showCreateTask]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTasks(),
        loadTaskStats()
      ]);
    } catch (error) {
      logger.error('Error loading tasks data:', error);
      throw error; // Re-throw to be caught by the parent try-catch
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
      logger.error('Error loading tasks:', error);
      setTasks([]);
    }
  };

  const loadTaskStats = async () => {
    try {
      const stats = await apiService.getTaskStats();
      setTaskStats(stats);
    } catch (error) {
      logger.error('Error loading task stats:', error);
    }
  };

  const loadClients = async () => {
    try {
      const clientsData = await apiService.getClients({ limit: 100 });
      setClients(clientsData || []);
    } catch (error) {
      logger.error('Error loading clients:', error);
    }
  };

  const checkGoogleCalendarStatus = async () => {
    try {
      const status = await apiService.getGoogleCalendarStatus();
      setGoogleCalendarStatus(status);
    } catch (error) {
      logger.error('Error checking Google Calendar status:', error);
    }
  };

  const handleCreateTask = async () => {
    try {
      const taskData = {
        ...taskForm,
        tags: taskForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        estimated_duration_minutes: taskForm.estimated_duration_minutes ? parseInt(taskForm.estimated_duration_minutes) : null,
        due_date: taskForm.due_date || null,
        start_time: taskForm.start_time || null,
        end_time: taskForm.end_time || null,
        client_id: taskForm.client_id || null
      };

      await apiService.createTask(taskData);
      await loadTasks();
      setShowCreateModal(false);
      setTaskForm({
        title: '',
        description: '',
        client_id: '',
        priority: 'medium',
        status: 'pending',
        due_date: '',
        start_time: '',
        end_time: '',
        location: '',
        notes: '',
        tags: '',
        estimated_duration_minutes: '',
        recurrence: 'none'
      });
    } catch (error) {
      logger.error('Error creating task:', error);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await apiService.completeTask(taskId);
      await loadTasks();
    } catch (error) {
      logger.error('Error completing task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await apiService.deleteTask(taskId);
        await loadTasks();
      } catch (error) {
        logger.error('Error deleting task:', error);
      }
    }
  };

  const handleGoogleCalendarAuth = async () => {
    try {
      const response = await apiService.getGoogleCalendarAuthUrl();
      if (response.auth_url) {
        window.open(response.auth_url, '_blank');
      }
    } catch (error) {
      logger.error('Error getting Google auth URL:', error);
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

  const renderTaskCard = (task) => (
    <Card key={task.id} className="border-l-4" style={{ borderLeftColor: getPriorityColor(task.priority) }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {task.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={priorityColors[task.priority]}>
                {task.priority.toUpperCase()}
              </Badge>
              <Badge className={statusColors[task.status]}>
                {task.status.replace('_', ' ').toUpperCase()}
              </Badge>
              {task.google_calendar_event_id && (
                <CalendarIcon className="w-4 h-4 text-green-600" />
              )}
            </div>
          </div>
        </div>
        
        {task.description && (
          <p className="text-gray-600 text-sm mb-3">{task.description}</p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              {formatDate(task.due_date)}
              {task.time_until_due && (
                <span className={task.is_overdue ? 'text-red-600' : 'text-gray-500'}>
                  {formatTimeUntilDue(task.time_until_due)}
                </span>
              )}
            </span>
          </div>
          
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{task.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          {task.status !== 'completed' && (
            <Button
              size="sm"
              onClick={() => handleCompleteTask(task.id)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Complete
            </Button>
          )}
          
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteTask(task.id)}
            className="ml-auto"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#f97316',
      urgent: '#ef4444'
    };
    return colors[priority] || colors.medium;
  };

  const renderStatsCard = () => {
    if (!taskStats) return null;

    return (
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-emerald-800">Task Overview</CardTitle>
            <BarChart3 className="w-5 h-5 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{taskStats.total_tasks}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{taskStats.completed_tasks}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{taskStats.pending_tasks}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{taskStats.overdue_tasks}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </div>
          
          <div className="text-center border-t pt-4">
            <div className="text-sm text-emerald-700 font-medium">
              Completion Rate: {taskStats.completion_rate}%
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600">Manage your tasks and to-dos</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
            <option value="due_today">Due Today</option>
            <option value="upcoming">Upcoming</option>
          </Select>
          
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="client">Client (Optional)</Label>
                  <Select 
                    value={taskForm.client_id} 
                    onValueChange={(value) => setTaskForm({ ...taskForm, client_id: value })}
                  >
                    <option value="">Select Client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={taskForm.priority} 
                      onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={taskForm.status} 
                      onValueChange={(value) => setTaskForm({ ...taskForm, status: value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="due_date">Due Date & Time</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={taskForm.tags}
                    onChange={(e) => setTaskForm({ ...taskForm, tags: e.target.value })}
                    placeholder="e.g. meeting, urgent, housing"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={taskForm.notes}
                    onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                    placeholder="Additional notes or instructions"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateTask}
                    disabled={!taskForm.title.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Create Task
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Card */}
      <div className="mb-8">
        {renderStatsCard()}
      </div>

      {/* Tasks Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {filters.find(f => f.key === selectedFilter)?.label || 'Tasks'} ({tasks.length})
          </h2>
        </div>
        
        {tasks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <CalendarIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-6">
                {selectedFilter === 'all' 
                  ? "Create your first task to get started"
                  : `No ${selectedFilter.replace('_', ' ')} tasks at the moment`
                }
              </p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Create Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map(renderTaskCard)}
          </div>
        )}
      </div>

      {/* Google Calendar Integration */}
      {googleCalendarStatus && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Google Calendar Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${googleCalendarStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {googleCalendarStatus.connected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              
              {!googleCalendarStatus.connected && googleCalendarStatus.available && (
                <Button 
                  size="sm"
                  onClick={handleGoogleCalendarAuth}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Connect Google Calendar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TasksScreen; 