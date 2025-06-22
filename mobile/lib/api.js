/**
 * API Service for SOLACE Mobile App
 * Handles communication with the Python FastAPI backend
 */

import config from '../config/env';
import { supabase } from './supabase';

class APIService {
  constructor() {
    this.baseURL = config.API_BASE_URL;
    this.timeout = config.API_TIMEOUT;
  }

  /**
   * Get authentication token from Supabase session
   */
  async getAuthToken() {
    try {
      console.log('🔐 Getting auth token from Supabase session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Supabase session error:', error);
        throw new Error(`Supabase session error: ${error.message}`);
      }
      
      if (!session) {
        console.error('❌ No authentication session found - user needs to sign in');
        throw new Error('USER_NOT_AUTHENTICATED');
      }
      
      // Check if the token is actually the anon key (which shouldn't be used for user API calls)
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb3RrcmhycWtsZGdmZGpubGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM4MDgsImV4cCI6MjA2NjA1OTgwOH0.-Q3LvNkbaNvfjnEoKwY53BNLPVIEvxoDzRD9z3-5NO0';
      
      if (session.access_token === anonKey) {
        console.error('❌ Received anon key instead of user access token - user needs to sign in properly');
        throw new Error('USER_NOT_AUTHENTICATED');
      }
      
      if (!session.access_token || session.access_token.length < 100) {
        console.error('❌ Invalid or missing access token - user needs to sign in');
        throw new Error('USER_NOT_AUTHENTICATED');
      }
      
      console.log('✅ Session found:', {
        user: session.user?.email,
        expires_at: session.expires_at,
        token_type: session.token_type,
        access_token_length: session.access_token?.length
      });
      
      console.log('🔑 Access token preview:', session.access_token?.substring(0, 20) + '...');
      
      return session.access_token;
    } catch (error) {
      console.error('❌ Failed to get auth token:', error);
      throw error;
    }
  }

  /**
   * Make an authenticated request to the backend API
   */
  async makeRequest(endpoint, options = {}) {
    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${this.baseURL}${endpoint}`);
      
      // Get auth token
      const token = await this.getAuthToken();
      console.log('🔑 Token obtained, length:', token?.length);
      
      // Prepare request configuration
      const config = {
        timeout: this.timeout,
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      };

      // Handle FormData (don't set Content-Type for FormData, let React Native set it)
      if (!options.isFormData) {
        config.headers['Content-Type'] = 'application/json';
        // Convert body to JSON string for regular requests
        if (config.body && typeof config.body === 'object') {
          config.body = JSON.stringify(config.body);
        }
      }
      // For FormData, body stays as FormData object
      
      console.log('📋 Request config:', {
        url: `${this.baseURL}${endpoint}`,
        method: config.method || 'GET',
        headers: {
          'Content-Type': config.headers['Content-Type'],
          'Authorization': `Bearer ${token?.substring(0, 20)}...${token?.slice(-10)}`,
        },
        body_type: config.body ? config.body.constructor.name : 'none',
        body_length: config.body && !options.isFormData ? JSON.stringify(config.body).length : 'FormData'
      });

      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
      console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error: ${options.method || 'GET'} ${endpoint} [${response.status}] ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log(`✅ JSON Response:`, data);
      } else {
        data = await response.text();
        console.log(`✅ Text Response:`, data);
      }

      return data;
    } catch (error) {
      console.error(`❌ API Error: ${options.method || 'GET'} ${endpoint} [${error.constructor.name}] ${error.message}`);
      throw error;
    }
  }

  // ===== HEALTH & INFO =====

  /**
   * Check API health
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        timeout: 5000,
      });
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Get API information
   */
  async getAPIInfo() {
    try {
      const response = await fetch(`${this.baseURL}/api`, {
        method: 'GET',
        timeout: 5000,
      });
      return await response.json();
    } catch (error) {
      console.error('API info request failed:', error);
      throw error;
    }
  }

  // ===== CLIENTS =====

  /**
   * Get list of clients
   */
  async getClients(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.search) queryParams.append('search', params.search);

    const endpoint = `/api/clients/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.makeRequest(endpoint);
  }

  /**
   * Get client by ID
   */
  async getClient(clientId) {
    return await this.makeRequest(`/api/clients/${clientId}/`);
  }

  /**
   * Create new client
   */
  async createClient(clientData) {
    return await this.makeRequest('/api/clients/', {
      method: 'POST',
      body: clientData,
    });
  }

  /**
   * Update client
   */
  async updateClient(clientId, clientData) {
    return await this.makeRequest(`/api/clients/${clientId}/`, {
      method: 'PUT',
      body: clientData,
    });
  }

  /**
   * Delete client
   */
  async deleteClient(clientId) {
    return await this.makeRequest(`/api/clients/${clientId}/`, {
      method: 'DELETE',
    });
  }

  /**
   * Get client summary
   */
  async getClientSummary(clientId) {
    return await this.makeRequest(`/api/clients/${clientId}/summary/`);
  }

  // ===== CASE NOTES =====

  /**
   * Get case notes
   */
  async getCaseNotes(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.client_id) queryParams.append('client_id', params.client_id);
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);

    const endpoint = `/api/case-notes/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.makeRequest(endpoint);
  }

  /**
   * Create case note
   */
  async createCaseNote(noteData) {
    return await this.makeRequest('/api/case-notes/', {
      method: 'POST',
      body: noteData,
    });
  }

  /**
   * Start voice intake session
   */
  async startVoiceIntake(clientId, sessionType = 'intake') {
    return await this.makeRequest('/api/case-notes/voice-intake/', {
      method: 'POST',
      body: {
        client_id: clientId,
        session_type: sessionType,
      },
    });
  }

  /**
   * Upload audio for transcription and automatic note creation
   */
  async uploadAudioForTranscription(audioFile, clientId, sessionId = null) {
    console.log('📁 Preparing audio file for upload:', audioFile);
    
    const formData = new FormData();
    
    // Format the audio file correctly for React Native FormData
    // Normalize MIME type to ensure backend compatibility
    let mimeType = audioFile.type || 'audio/m4a';
    if (mimeType === 'audio/x-m4a') {
      mimeType = 'audio/m4a';
    } else if (mimeType === 'audio/x-wav') {
      mimeType = 'audio/wav';
    } else if (mimeType === 'audio/x-mp3') {
      mimeType = 'audio/mp3';
    }
    
    const fileObj = {
      uri: audioFile.uri,
      type: mimeType,
      name: audioFile.name || `voice_note_${Date.now()}.m4a`,
    };
    
    console.log('📋 File object for FormData:', fileObj);
    formData.append('audio_file', fileObj);
    
    if (clientId) {
      formData.append('client_id', clientId.toString());
    }
    
    const endpoint = sessionId 
      ? `/api/case-notes/voice-sessions/${sessionId}/upload`
      : '/api/case-notes/transcribe-audio/';
    
    console.log(`🚀 Uploading to endpoint: ${endpoint}`);
    
    return await this.makeRequest(endpoint, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  }

  /**
   * Check voice service health
   */
  async checkVoiceServiceHealth() {
    return await this.makeRequest('/api/case-notes/voice/health/');
  }

  // ===== TASKS =====

  /**
   * Get list of tasks with advanced filtering
   */
  async getTasks(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.client_id) queryParams.append('client_id', params.client_id);
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.assigned_to) queryParams.append('assigned_to', params.assigned_to);
    if (params.tags) queryParams.append('tags', Array.isArray(params.tags) ? params.tags.join(',') : params.tags);
    if (params.due_date_from) queryParams.append('due_date_from', params.due_date_from);
    if (params.due_date_to) queryParams.append('due_date_to', params.due_date_to);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);

    const endpoint = `/api/tasks/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.makeRequest(endpoint);
  }

  /**
   * Get a specific task by ID
   */
  async getTask(taskId) {
    return await this.makeRequest(`/api/tasks/${taskId}`);
  }

  /**
   * Create new task
   */
  async createTask(taskData) {
    return await this.makeRequest('/api/tasks/', {
      method: 'POST',
      body: taskData,
    });
  }

  /**
   * Update existing task
   */
  async updateTask(taskId, taskData) {
    return await this.makeRequest(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: taskData,
    });
  }

  /**
   * Delete task
   */
  async deleteTask(taskId) {
    return await this.makeRequest(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Mark task as completed
   */
  async completeTask(taskId) {
    return await this.makeRequest(`/api/tasks/${taskId}/complete`, {
      method: 'PATCH',
    });
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks() {
    return await this.makeRequest('/api/tasks/overdue');
  }

  /**
   * Get tasks due today
   */
  async getTasksDueToday() {
    return await this.makeRequest('/api/tasks/due-today');
  }

  /**
   * Get upcoming tasks
   */
  async getUpcomingTasks(daysAhead = 7) {
    return await this.makeRequest(`/api/tasks/upcoming?days_ahead=${daysAhead}`);
  }

  /**
   * Get task statistics
   */
  async getTaskStats() {
    return await this.makeRequest('/api/tasks/stats');
  }

  // ===== GOOGLE CALENDAR INTEGRATION =====

  /**
   * Get Google Calendar authorization URL
   */
  async getGoogleCalendarAuthUrl() {
    return await this.makeRequest('/api/google-calendar/auth');
  }

  /**
   * Disconnect Google Calendar integration
   */
  async disconnectGoogleCalendar() {
    return await this.makeRequest('/api/google-calendar/disconnect', {
      method: 'POST',
    });
  }

  /**
   * Get Google Calendar integration status
   */
  async getGoogleCalendarStatus() {
    return await this.makeRequest('/api/google-calendar/status');
  }

  // ===== REPORTS =====

  /**
   * Get reports service info and available reports
   */
  async getReports(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.client_id) queryParams.append('client_id', params.client_id);
    if (params.type) queryParams.append('type', params.type);
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);

    const endpoint = `/api/reports/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.makeRequest(endpoint);
  }

  /**
   * Generate monthly case summary report using AI
   */
  async generateMonthlyCaseSummary(month, year) {
    const queryParams = new URLSearchParams();
    queryParams.append('month', month);
    queryParams.append('year', year);

    return await this.makeRequest(`/api/reports/monthly-summary?${queryParams.toString()}`, {
      method: 'POST',
    });
  }

  /**
   * Generate quarterly outcome report using AI
   */
  async generateQuarterlyOutcomeReport(quarter, year) {
    const queryParams = new URLSearchParams();
    queryParams.append('quarter', quarter);
    queryParams.append('year', year);

    return await this.makeRequest(`/api/reports/quarterly-outcome?${queryParams.toString()}`, {
      method: 'POST',
    });
  }

  /**
   * Get AI report service status
   */
  async getReportServiceStatus() {
    return await this.makeRequest('/api/reports/service-status');
  }

  /**
   * Generate report (deprecated - use specific methods)
   */
  async generateReport(reportData) {
    return await this.makeRequest('/api/reports/generate/', {
      method: 'POST',
      body: reportData,
    });
  }
}

// Create and export singleton instance
const apiService = new APIService();

export default apiService;

// Named exports for convenience
export { APIService };

/**
 * Usage Examples:
 * 
 * // Check API health
 * const health = await apiService.checkHealth();
 * 
 * // Get clients
 * const clients = await apiService.getClients({ limit: 10, status: 'active' });
 * 
 * // Create client
 * const newClient = await apiService.createClient({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   phone: '555-0123'
 * });
 * 
 * // Get case notes for a client
 * const notes = await apiService.getCaseNotes({ client_id: 'client-123' });
 */ 