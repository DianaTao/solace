export interface User {
  id: string;
  email: string;
  name: string;
  agency: string;
  role: 'social_worker' | 'supervisor' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  case_status: 'active' | 'closed' | 'pending';
  assigned_worker_id: string;
  created_at: string;
  updated_at: string;
}

export interface CaseNote {
  id: string;
  case_id: string;
  client_id: string;
  worker_id: string;
  title: string;
  content: string;
  transcription?: string;
  mood_assessment?: string;
  ai_generated: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  case_id: string;
  client_id: string;
  worker_id: string;
  title: string;
  description: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  task_type: 'follow_up' | 'appointment' | 'documentation' | 'referral' | 'other';
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  category: 'housing' | 'counseling' | 'medical' | 'education' | 'employment' | 'legal' | 'other';
  contact_info: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  eligibility_criteria?: string;
  availability_status: 'available' | 'limited' | 'full' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface VoiceSession {
  id: string;
  worker_id: string;
  case_id?: string;
  client_id?: string;
  transcription: string;
  duration: number;
  status: 'recording' | 'processing' | 'completed' | 'error';
  ai_analysis?: {
    tasks: Partial<Task>[];
    summary: string;
    mood_assessment: string;
    next_steps: string[];
  };
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'task_due' | 'high_priority' | 'system' | 'case_update';
  read: boolean;
  created_at: string;
}

export interface Agency {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  type: 'government' | 'nonprofit' | 'private' | 'healthcare';
  services_offered: string[];
  contact_person?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface VoiceNoteForm {
  transcription: string;
  case_id?: string;
  client_id?: string;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  status?: string[];
  priority?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  assigned_worker?: string;
} 