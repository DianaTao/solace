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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      };
      
      console.log('📋 Request config:', {
        url: `${this.baseURL}${endpoint}`,
        method: config.method || 'GET',
        headers: {
          'Content-Type': config.headers['Content-Type'],
          'Authorization': `Bearer ${token?.substring(0, 20)}...${token?.slice(-10)}`,
        },
        body_length: config.body ? JSON.stringify(config.body).length : 0
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

  // ===== TASKS =====

  /**
   * Get tasks
   */
  async getTasks(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.client_id) queryParams.append('client_id', params.client_id);
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);

    const endpoint = `/api/tasks/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.makeRequest(endpoint);
  }

  /**
   * Create task
   */
  async createTask(taskData) {
    return await this.makeRequest('/api/tasks/', {
      method: 'POST',
      body: taskData,
    });
  }

  // ===== REPORTS =====

  /**
   * Get reports
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
   * Generate report
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