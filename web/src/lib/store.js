import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create()(
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

export const useAppStore = create()((set, get) => ({
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