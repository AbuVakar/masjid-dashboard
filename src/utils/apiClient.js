/**
 * Enhanced API Client with comprehensive error handling
 * Provides timeout, retry, and network error handling
 */

import { logError, ERROR_SEVERITY } from './errorHandler';
import { toast } from 'react-toastify';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Default timeout and retry settings
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Enhanced fetch with timeout and retry mechanism
 */
export const fetchWithTimeout = async (
  url,
  options = {},
  timeout = DEFAULT_TIMEOUT,
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Request timeout - server is taking too long to respond');
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error - please check your internet connection');
    }

    throw error;
  }
};

/**
 * Retry mechanism for failed requests
 */
export const retryOperation = async (
  operation,
  maxRetries = DEFAULT_RETRIES,
) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on certain errors
      if (
        error.message.includes('404') ||
        error.message.includes('401') ||
        error.message.includes('403')
      ) {
        throw error;
      }

      if (attempt < maxRetries) {
        console.log(
          `🔄 Retrying operation (Attempt ${attempt + 1}/${maxRetries})`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY * attempt),
        );
      }
    }
  }

  throw lastError;
};

/**
 * Standardized API request with error handling
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await retryOperation(async () => {
      return await fetchWithTimeout(url, options);
    });

    // Handle HTTP errors
    if (!response.ok) {
      let errorMessage = 'Server error';

      try {
        const errorData = await response.json();
        errorMessage =
          errorData.error?.message || errorData.message || errorMessage;
      } catch {
        // If error response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    // Parse JSON response
    try {
      return await response.json();
    } catch (error) {
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    // Log error with context
    logError(error, `API Request: ${endpoint}`, ERROR_SEVERITY.MEDIUM, {
      url,
      method: options.method || 'GET',
      status: error.status,
    });

    // Show user-friendly error message
    if (error.message.includes('timeout')) {
      toast.error('Server is taking too long to respond. Please try again.');
    } else if (error.message.includes('Network error')) {
      toast.error('Network error. Please check your internet connection.');
    } else if (error.status === 404) {
      toast.error('Resource not found.');
    } else if (error.status === 401) {
      toast.error('Authentication required. Please login again.');
    } else if (error.status === 403) {
      toast.error("Access denied. You don't have permission for this action.");
    } else if (error.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(error.message || 'An unexpected error occurred.');
    }

    throw error;
  }
};

/**
 * Convenience methods for common HTTP operations
 */
export const apiClient = {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' }),

  patch: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

/**
 * Check if server is reachable
 */
export const checkServerHealth = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/health`, {}, 5000);
    return response.ok;
  } catch (error) {
    console.warn('Server health check failed:', error.message);
    return false;
  }
};

/**
 * Get network status
 */
export const getNetworkStatus = () => {
  return {
    online: navigator.onLine,
    connectionType: navigator.connection?.effectiveType || 'unknown',
    downlink: navigator.connection?.downlink || 'unknown',
  };
};
