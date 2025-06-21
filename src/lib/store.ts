import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Client, Task, CaseNote, Notification, VoiceSession } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

interface AppState {
  // Current active client/case
  activeClient: Client | null;
  setActiveClient: (client: Client | null) => void;
  
  // Cases and clients
  clients: Client[];
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  
  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Case notes
  caseNotes: CaseNote[];
  setCaseNotes: (notes: CaseNote[]) => void;
  addCaseNote: (note: CaseNote) => void;
  
  // Voice sessions
  activeVoiceSession: VoiceSession | null;
  setActiveVoiceSession: (session: VoiceSession | null) => void;
  voiceSessions: VoiceSession[];
  setVoiceSessions: (sessions: VoiceSession[]) => void;
  addVoiceSession: (session: VoiceSession) => void;
  
  // Notifications
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Search and filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'solace-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export const useAppStore = create<AppState>()((set, get) => ({
  // Current active client/case
  activeClient: null,
  setActiveClient: (activeClient) => set({ activeClient }),
  
  // Cases and clients
  clients: [],
  setClients: (clients) => set({ clients }),
  addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
  updateClient: (id, updates) =>
    set((state) => ({
      clients: state.clients.map((client) =>
        client.id === id ? { ...client, ...updates } : client
      ),
    })),
  
  // Tasks
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
  
  // Case notes
  caseNotes: [],
  setCaseNotes: (caseNotes) => set({ caseNotes }),
  addCaseNote: (note) => set((state) => ({ caseNotes: [...state.caseNotes, note] })),
  
  // Voice sessions
  activeVoiceSession: null,
  setActiveVoiceSession: (activeVoiceSession) => set({ activeVoiceSession }),
  voiceSessions: [],
  setVoiceSessions: (voiceSessions) => set({ voiceSessions }),
  addVoiceSession: (session) =>
    set((state) => ({ voiceSessions: [...state.voiceSessions, session] })),
  
  // Notifications
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      ),
    })),
  clearNotifications: () => set({ notifications: [] }),
  
  // UI state
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  
  // Search and filters
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
})); 