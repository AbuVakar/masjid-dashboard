// API_BASE_URL is used in the constructor

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.token = localStorage.getItem('accessToken') || null;
    this.csrfToken = null;
    this.isOnline = navigator.onLine;
    this.failedRequests = [];

    // Initialize CSRF token if not in development mode
    if (process.env.NODE_ENV !== 'development') {
      this.refreshCSRFToken();
    }

    // Setup network listeners
    this.setupNetworkListeners();
  }

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.retryFailedRequests();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async retryFailedRequests() {
    if (this.failedRequests.length === 0) return;

    console.log(`🔄 Retrying ${this.failedRequests.length} failed requests...`);

    const requestsToRetry = [...this.failedRequests];
    this.failedRequests = [];

    for (const request of requestsToRetry) {
      try {
        await this.request(request.endpoint, request.options);
        console.log(`✅ Retry successful for: ${request.endpoint}`);
      } catch (error) {
        console.error(`❌ Retry failed for: ${request.endpoint}`, error);
        // Don't add back to failed requests to prevent infinite loops
      }
    }
  }

  setToken(token) {
    this.token = token;
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('accessToken');
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

    // Ensure CSRF token is available for non-GET requests in production
    if (
      process.env.NODE_ENV !== 'development' &&
      options.method &&
      options.method !== 'GET' &&
      !this.csrfToken
    ) {
      await this.refreshCSRFToken();
    }

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

          // Store failed request for retry when online
          if (!this.isOnline && options.method !== 'GET') {
            this.failedRequests.push({ endpoint, options });
            console.log(`📝 Stored failed request for retry: ${endpoint}`);
          }

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
    console.log('🔍 API updateHouse called with:', { id, houseData });
    const result = await this.put(`/houses/${id}`, houseData);
    console.log('🔍 API updateHouse result:', result);
    return result;
  }

  async deleteHouse(id) {
    return this.delete(`/houses/${id}`);
  }

  // Member API methods
  async addMember(houseId, memberData) {
    console.log('API addMember called with:', { houseId, memberData });
    return this.post(`/houses/${houseId}/members`, memberData);
  }

  async updateMember(houseId, memberId, memberData) {
    console.log('API updateMember called with:', {
      houseId,
      memberId,
      memberData,
    });
    return this.put(`/houses/${houseId}/members/${memberId}`, memberData);
  }

  async deleteMember(houseId, memberId) {
    console.log('🔍 API deleteMember called with:', { houseId, memberId });
    const result = await this.delete(`/houses/${houseId}/members/${memberId}`);
    console.log('🔍 API deleteMember result:', result);
    return result;
  }

  async loadDemoData() {
    return this.post('/houses/load-demo');
  }

  async getHouseAnalytics() {
    return this.get('/houses/analytics/summary');
  }

  // Resource API methods
  async getResources(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/resources${queryString ? `?${queryString}` : ''}`);
  }

  async getResource(id) {
    return this.get(`/resources/${id}`);
  }

  // Specialized method for creating a resource with a file upload
  async createResource(resourceData) {
    const formData = new FormData();
    Object.keys(resourceData).forEach(key => {
      // The 'file' key should be the actual File object
      formData.append(key, resourceData[key]);
    });

    // We cannot use the generic `post` method because it forces JSON.
    // We must call `fetch` directly and let the browser set the Content-Type header.
    const url = `${this.baseURL}/resources`;
    const headers = this.getHeaders();
    delete headers['Content-Type']; // Let the browser set this for FormData

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Specialized method for updating a resource, potentially with a new file
  async updateResource(id, resourceData) {
    const formData = new FormData();
    Object.keys(resourceData).forEach(key => {
      // The 'file' key should be the actual File object if it exists
      formData.append(key, resourceData[key]);
    });

    const url = `${this.baseURL}/resources/${id}`;
    const headers = this.getHeaders();
    delete headers['Content-Type']; // Let the browser set this for FormData

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async deleteResource(id) {
    return this.delete(`/resources/${id}`);
  }

  async incrementResourceDownload(id) {
    return this.post(`/resources/${id}/download`);
  }

  // User API methods
  async register(userData) {
    const response = await this.post('/users/register', userData);
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
      localStorage.setItem('accessToken', response.data.token);
    }
    return response;
  }

  async login(credentials) {
    const response = await this.post('/users/login', credentials);
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
      localStorage.setItem('accessToken', response.data.token);
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

  // Prayer Times API methods
  async getPrayerTimes() {
    return this.get('/prayer-times');
  }

  async updatePrayerTimes(times) {
    return this.put('/prayer-times', times);
  }

  async getPrayerTimesHistory() {
    return this.get('/prayer-times/history');
  }

  // Contact API methods
  async submitContactForm(contactData) {
    return this.post('/contact', contactData);
  }

  async getContactMessages(
    page = 1,
    limit = 20,
    category = null,
    status = null,
  ) {
    let url = `/contact?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    if (status) url += `&status=${status}`;
    return this.get(url);
  }

  async updateContactStatus(messageId, status) {
    return this.patch(`/contact/${messageId}/status`, { status });
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
