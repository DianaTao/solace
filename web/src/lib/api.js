import { AuthService } from './auth';
import logger from './logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    try {
      // Get current user session
      const session = await AuthService.getCurrentSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const url = `${this.baseURL}${endpoint}`;
      const config = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          ...options.headers,
        },
        ...options,
      };

      if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
      }

      logger.info(`API Request: ${config.method} ${url}`, 'API');

      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.text();
        logger.error(`API Error: ${response.status} ${response.statusText}`, { errorData }, 'API');
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      logger.info(`API Response: ${config.method} ${url} - Success`, 'API');
      return data;

    } catch (error) {
      logger.error(`API Request failed: ${endpoint}`, error, 'API');
      throw error;
    }
  }

  // ===== CLIENT MANAGEMENT =====

  /**
   * Get list of clients with optional filtering
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
   * Get a specific client by ID
   */
  async getClient(clientId) {
    return await this.makeRequest(`/api/clients/${clientId}/`);
  }

  /**
   * Create a new client
   */
  async createClient(clientData) {
    return await this.makeRequest('/api/clients/', {
      method: 'POST',
      body: clientData
    });
  }

  /**
   * Update an existing client
   */
  async updateClient(clientId, updates) {
    return await this.makeRequest(`/api/clients/${clientId}/`, {
      method: 'PUT',
      body: updates
    });
  }

  /**
   * Delete a client
   */
  async deleteClient(clientId) {
    return await this.makeRequest(`/api/clients/${clientId}/`, {
      method: 'DELETE'
    });
  }

  // ===== CASE NOTES =====

  /**
   * Get case notes for a specific client
   */
  async getClientCaseNotes(clientId, params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.category) queryParams.append('category', params.category);

    queryParams.append('client_id', clientId);

    const endpoint = `/api/case-notes/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.makeRequest(endpoint);
  }

  /**
   * Create a new case note
   */
  async createCaseNote(noteData) {
    return await this.makeRequest('/api/case-notes/', {
      method: 'POST',
      body: noteData
    });
  }

  // ===== TASKS =====

  /**
   * Get tasks for a specific client
   */
  async getClientTasks(clientId, params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);

    queryParams.append('client_id', clientId);

    const endpoint = `/api/tasks/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.makeRequest(endpoint);
  }

  /**
   * Create a new task
   */
  async createTask(taskData) {
    return await this.makeRequest('/api/tasks/', {
      method: 'POST',
      body: taskData
    });
  }

  /**
   * Update a task
   */
  async updateTask(taskId, updates) {
    return await this.makeRequest(`/api/tasks/${taskId}/`, {
      method: 'PUT',
      body: updates
    });
  }

  // ===== REPORTS =====

  /**
   * Get reports for a specific client
   */
  async getClientReports(clientId, params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.type) queryParams.append('type', params.type);

    queryParams.append('client_id', clientId);

    const endpoint = `/api/reports/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.makeRequest(endpoint);
  }

  /**
   * Generate Monthly Case Summary Report
   */
  async generateMonthlyCaseSummary(month, year) {
    return await this.makeRequest(`/api/reports/monthly-summary?month=${month}&year=${year}`, {
      method: 'POST'
    });
  }

  /**
   * Generate Quarterly Outcome Report
   */
  async generateQuarterlyOutcomeReport(quarter, year) {
    return await this.makeRequest(`/api/reports/quarterly-outcome?quarter=${quarter}&year=${year}`, {
      method: 'POST'
    });
  }

  /**
   * Get Report Service Status
   */
  async getReportServiceStatus() {
    return await this.makeRequest('/api/reports/service-status');
  }

  /**
   * Get Available Reports
   */
  async getReports() {
    return await this.makeRequest('/api/reports/');
  }

  // ===== DASHBOARD =====

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    return await this.makeRequest('/api/dashboard/stats/');
  }

  // ===== HEALTH CHECK =====

  /**
   * Check API health
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/api/health`);
      return await response.json();
    } catch (error) {
      logger.error('Health check failed', error, 'API');
      return { status: 'error', message: error.message };
    }
  }
}

// Create and export a singleton instance
const apiService = new APIService();
export default apiService; 