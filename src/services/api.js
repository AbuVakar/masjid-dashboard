// API_BASE_URL is used in the constructor

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.token = null;
    this.csrfToken = null;
  }

  setToken(token) {
    this.token = token;
  }

  removeToken() {
    this.token = null;
  }

  setCSRFToken(token) {
    this.csrfToken = token;
  }

  async refreshCSRFToken() {
    try {
      const response = await fetch(
        `${this.baseURL.replace('/api', '')}/api/csrf-token`,
      );
      const data = await response.json();
      if (data.success) {
        this.csrfToken = data.data.token;
        return this.csrfToken;
      }
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error);
    }
    return null;
  }

  getToken() {
    return this.token;
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (this.csrfToken) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }

    return headers;
  }

  // Generic request method with timeout and retry logic
  async request(endpoint, options = {}) {
    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 1000;
    const timeout = options.timeout || 10000; // 10 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
          headers: this.getHeaders(),
          ...options,
        };

        // Add timeout to fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle offline/network errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          // Check for offline error from service worker
          if (errorData.error?.code === 'OFFLINE_ERROR') {
            throw new Error(
              'You are currently offline. Please check your connection.',
            );
          }

          throw new Error(
            errorData.error?.message ||
              `HTTP error! status: ${response.status}`,
          );
        }

        const data = await response.json();
        return data;
      } catch (error) {
        // Don't retry on client errors (4xx)
        if (error.name === 'AbortError') {
          throw new Error('Request timeout. Please try again.');
        }

        if (attempt === maxRetries) {
          console.error('API request failed after all retries:', error);
          throw error;
        }

        // Wait before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * attempt),
        );
        console.warn(
          `API request failed, retrying (${attempt}/${maxRetries}):`,
          error.message,
        );
      }
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    // Add CSRF token to request body for POST requests
    const requestData = { ...data };
    if (this.csrfToken) {
      requestData._csrf = this.csrfToken;
    }

    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  // PUT request
  async put(endpoint, data) {
    // Add CSRF token to request body for PUT requests
    const requestData = { ...data };
    if (this.csrfToken) {
      requestData._csrf = this.csrfToken;
    }

    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
  }

  // DELETE request
  async delete(endpoint) {
    // Add CSRF token to query parameters for DELETE requests
    const separator = endpoint.includes('?') ? '&' : '?';
    const csrfEndpoint = this.csrfToken
      ? `${endpoint}${separator}_csrf=${this.csrfToken}`
      : endpoint;

    return this.request(csrfEndpoint, { method: 'DELETE' });
  }

  // House API methods
  async getHouses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/houses?${queryString}`);
  }

  async getHouse(id) {
    return this.get(`/houses/${id}`);
  }

  async createHouse(houseData) {
    return this.post('/houses', houseData);
  }

  async updateHouse(id, houseData) {
    return this.put(`/houses/${id}`, houseData);
  }

  async deleteHouse(id) {
    return this.delete(`/houses/${id}`);
  }

  async loadDemoData() {
    return this.post('/houses/load-demo');
  }

  async getHouseAnalytics() {
    return this.get('/houses/analytics/summary');
  }

  // User API methods
  async register(userData) {
    const response = await this.post('/users/register', userData);
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async login(credentials) {
    const response = await this.post('/users/login', credentials);
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async logout() {
    this.removeToken();
    return { success: true, message: 'Logged out successfully' };
  }

  async getProfile() {
    return this.get('/users/profile');
  }

  async updateProfile(profileData) {
    return this.put('/users/profile', profileData);
  }

  async changePassword(passwordData) {
    return this.put('/users/change-password', passwordData);
  }

  async forgotPassword(email) {
    return this.post('/users/forgot-password', { email });
  }

  async resetPassword(token, newPassword) {
    return this.post('/users/reset-password', { token, newPassword });
  }

  async getUserActivity(days = 30) {
    return this.get(`/users/activity?days=${days}`);
  }

  // Admin API methods
  async getAllUsers() {
    return this.get('/users/admin/users');
  }

  async updateUserRole(userId, role) {
    return this.put(`/users/admin/users/${userId}/role`, { role });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(
        `${this.baseURL.replace('/api', '')}/health`,
      );
      return response.json();
    } catch (error) {
      throw new Error('Server is not responding');
    }
  }

  // Track activity
  async trackActivity(action, details = {}) {
    try {
      return this.post('/activity', { action, details });
    } catch (error) {
      console.error('Activity tracking failed:', error);
      return { success: false };
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
export { apiService };
