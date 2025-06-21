'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  FileText, 
  CheckSquare, 
  AlertTriangle, 
  Clock,
  Plus,
  ArrowRight,
  Mic,
  TrendingUp
} from 'lucide-react';

import { useAuthStore, useAppStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import { formatDate, formatRelativeTime, getPriorityColor, getStatusColor } from '@/lib/utils';
import { Client, Task, CaseNote } from '@/types';

// Mock data for demonstration
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Jane Doe',
    case_status: 'active',
    assigned_worker_id: 'user1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    phone: '(555) 123-4567',
    email: 'jane.doe@email.com'
  },
  {
    id: '2',
    name: 'John Smith',
    case_status: 'pending',
    assigned_worker_id: 'user1',
    created_at: '2024-01-18T09:15:00Z',
    updated_at: '2024-01-19T16:45:00Z',
    phone: '(555) 987-6543'
  },
  {
    id: '3',
    name: 'Maria Garcia',
    case_status: 'active',
    assigned_worker_id: 'user1',
    created_at: '2024-01-10T11:20:00Z',
    updated_at: '2024-01-21T13:10:00Z',
    email: 'maria.garcia@email.com'
  }
];

const mockTasks: Task[] = [
  {
    id: '1',
    case_id: '1',
    client_id: '1',
    worker_id: 'user1',
    title: 'Follow up with housing authority',
    description: 'Check status of Jane\'s housing application',
    due_date: '2024-01-25T17:00:00Z',
    status: 'pending',
    priority: 'high',
    task_type: 'follow_up',
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    case_id: '2',
    client_id: '2',
    worker_id: 'user1',
    title: 'Schedule check-in call',
    description: 'Weekly check-in with John Smith',
    due_date: '2024-01-24T14:00:00Z',
    status: 'pending',
    priority: 'medium',
    task_type: 'appointment',
    created_at: '2024-01-19T16:45:00Z',
    updated_at: '2024-01-19T16:45:00Z'
  },
  {
    id: '3',
    case_id: '3',
    client_id: '3',
    worker_id: 'user1',
    title: 'Update case documentation',
    description: 'Complete monthly case review for Maria',
    due_date: '2024-01-26T12:00:00Z',
    status: 'in_progress',
    priority: 'urgent',
    task_type: 'documentation',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-21T09:00:00Z'
  }
];

const mockCaseNotes: CaseNote[] = [
  {
    id: '1',
    case_id: '1',
    client_id: '1',
    worker_id: 'user1',
    title: 'Home visit - January 20th',
    content: 'Conducted home visit. Client appears to be in good spirits but mentioned housing application is still pending. Need to follow up with housing authority by Friday.',
    ai_generated: true,
    priority: 'medium',
    mood_assessment: 'Positive - client showing improvement',
    created_at: '2024-01-20T15:00:00Z',
    updated_at: '2024-01-20T15:00:00Z'
  },
  {
    id: '2',
    case_id: '2',
    client_id: '2',
    worker_id: 'user1',
    title: 'Phone consultation',
    content: 'Brief phone check-in. Client requested information about job training programs. Provided contact for local workforce development center.',
    ai_generated: false,
    priority: 'low',
    created_at: '2024-01-19T11:30:00Z',
    updated_at: '2024-01-19T11:30:00Z'
  }
];

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { clients, tasks, caseNotes, setClients, setTasks, setCaseNotes } = useAppStore();

  useEffect(() => {
    // Initialize with mock data
    setClients(mockClients);
    setTasks(mockTasks);
    setCaseNotes(mockCaseNotes);
  }, [setClients, setTasks, setCaseNotes]);

  const activeClients = clients.filter(c => c.case_status === 'active').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length;
  const recentNotes = caseNotes.slice(0, 3);

  const stats = [
    {
      name: 'Active Cases',
      value: activeClients,
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
      href: '/clients'
    },
    {
      name: 'Pending Tasks',
      value: pendingTasks,
      icon: CheckSquare,
      color: 'text-yellow-600 bg-yellow-100',
      href: '/tasks'
    },
    {
      name: 'Urgent Items',
      value: urgentTasks,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-100',
      href: '/tasks?priority=urgent,high'
    },
    {
      name: 'Case Notes',
      value: caseNotes.length,
      icon: FileText,
      color: 'text-green-600 bg-green-100',
      href: '/case-notes'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your cases today
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push('/clients/new')}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Client
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push('/voice')}
            >
              <Mic className="mr-2 h-4 w-4" />
              Start Dictation
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              onClick={() => router.push(stat.href)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Urgent Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Urgent Tasks</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/tasks')}
              >
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {tasks
              .filter(t => t.priority === 'urgent' || t.priority === 'high')
              .slice(0, 4)
              .map((task) => (
                <div key={task.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {task.due_date ? formatRelativeTime(task.due_date) : 'No due date'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Case Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Case Notes</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/case-notes')}
              >
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentNotes.map((note) => (
              <div key={note.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{note.title}</h3>
                      {note.ai_generated && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                          AI
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {note.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatRelativeTime(note.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Clients */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Clients</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/clients')}
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.slice(0, 5).map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {client.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{client.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(client.case_status)}`}>
                      {client.case_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatRelativeTime(client.updated_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.phone || client.email || 'No contact info'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 