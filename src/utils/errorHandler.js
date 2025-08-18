/**
 * Enhanced Error Handling and Performance Monitoring Service
 * Provides comprehensive error handling, performance tracking, and recovery mechanisms
 */

import { notify } from './notification';

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  SLOW_OPERATION: 1000, // 1 second
  VERY_SLOW_OPERATION: 5000, // 5 seconds
  MEMORY_WARNING: 50 * 1024 * 1024, // 50MB
};

/**
 * Enhanced error logger with severity and context
 * @param {Error} error - Error object
 * @param {string} context - Error context (component, function, etc.)
 * @param {string} severity - Error severity level
 * @param {Object} additionalData - Additional error data
 */
export const logError = (
  error,
  context = 'Unknown',
  severity = ERROR_SEVERITY.MEDIUM,
  additionalData = {},
) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      name: error?.name,
    },
    context,
    severity,
    additionalData,
    userAgent: navigator.userAgent,
    url: window.location.href,
    sessionId: getSessionId(),
  };

  // Console logging based on severity
  switch (severity) {
    case ERROR_SEVERITY.CRITICAL:
      console.error('🚨 CRITICAL ERROR:', errorLog);
      break;
    case ERROR_SEVERITY.HIGH:
      console.error('⚠️ HIGH SEVERITY ERROR:', errorLog);
      break;
    case ERROR_SEVERITY.MEDIUM:
      console.warn('⚠️ MEDIUM SEVERITY ERROR:', errorLog);
      break;
    case ERROR_SEVERITY.LOW:
      console.info('ℹ️ LOW SEVERITY ERROR:', errorLog);
      break;
    default:
      console.warn('⚠️ UNKNOWN SEVERITY ERROR:', errorLog);
      break;
  }

  // Store in localStorage for debugging
  storeErrorLog(errorLog);

  // Send to error reporting service in production
  if (process.env.NODE_ENV === 'production') {
    sendErrorToService(errorLog);
  }
};

/**
 * Performance monitoring wrapper
 * @param {string} operationName - Name of the operation being monitored
 * @param {Function} operation - Function to monitor
 * @param {Object} options - Monitoring options
 * @returns {Promise<any>} Result of the operation
 */
export const measurePerformance = async (
  operationName,
  operation,
  options = {},
) => {
  const startTime = performance.now();
  const startMemory = performance.memory?.usedJSHeapSize || 0;

  try {
    const result = await operation();

    const endTime = performance.now();
    const endMemory = performance.memory?.usedJSHeapSize || 0;
    const duration = endTime - startTime;
    const memoryUsed = endMemory - startMemory;

    // Log performance metrics
    logPerformance(operationName, duration, memoryUsed, 'success');

    // Warn if operation is slow
    if (duration > PERFORMANCE_THRESHOLDS.VERY_SLOW_OPERATION) {
      console.warn(
        `🐌 VERY SLOW OPERATION: ${operationName} took ${duration.toFixed(2)}ms`,
      );
      notify(`${operationName} is taking longer than expected`, { type: 'warning' });
    } else if (duration > PERFORMANCE_THRESHOLDS.SLOW_OPERATION) {
      console.warn(
        `🐌 SLOW OPERATION: ${operationName} took ${duration.toFixed(2)}ms`,
      );
    }

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    logPerformance(operationName, duration, 0, 'error');
    logError(error, operationName, ERROR_SEVERITY.HIGH);

    throw error;
  }
};

/**
 * Log performance metrics
 * @param {string} operationName - Name of the operation
 * @param {number} duration - Duration in milliseconds
 * @param {number} memoryUsed - Memory used in bytes
 * @param {string} status - Operation status
 */
const logPerformance = (operationName, duration, memoryUsed, status) => {
  const performanceLog = {
    timestamp: new Date().toISOString(),
    operation: operationName,
    duration: Math.round(duration),
    memoryUsed: Math.round(memoryUsed),
    status,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // Store performance logs
  storePerformanceLog(performanceLog);

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `📊 Performance: ${operationName} - ${duration.toFixed(2)}ms - ${status}`,
    );
  }
};

/**
 * Enhanced async error handler with retry mechanism
 * @param {Function} asyncFunction - Async function to execute
 * @param {Object} options - Error handling options
 * @returns {Promise<any>} Result of the function
 */
export const handleAsyncError = async (asyncFunction, options = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    context = 'Async Operation',
    severity = ERROR_SEVERITY.MEDIUM,
    onError = null,
    fallbackValue = null,
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFunction();
    } catch (error) {
      lastError = error;

      logError(
        error,
        `${context} (Attempt ${attempt}/${maxRetries})`,
        severity,
      );

      if (attempt < maxRetries) {
        // Wait before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * attempt),
        );
        console.log(
          `🔄 Retrying ${context} (Attempt ${attempt + 1}/${maxRetries})`,
        );
      }
    }
  }

  // All retries failed
  if (onError) {
    onError(lastError);
  }

  if (fallbackValue !== null) {
    return fallbackValue;
  }

  throw lastError;
};

/**
 * Safe JSON parsing with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {any} fallback - Fallback value if parsing fails
 * @returns {any} Parsed JSON or fallback value
 */
export const safeJsonParse = (jsonString, fallback = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    logError(error, 'JSON Parse', ERROR_SEVERITY.LOW);
    return fallback;
  }
};

/**
 * Safe localStorage operations with error handling
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {boolean} Success status
 */
export const safeLocalStorageSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    logError(error, 'LocalStorage Set', ERROR_SEVERITY.MEDIUM, { key });

    // Try to clear some space if quota exceeded
    if (error.name === 'QuotaExceededError') {
      clearOldLogs();
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (retryError) {
        logError(retryError, 'LocalStorage Set Retry', ERROR_SEVERITY.HIGH, {
          key,
        });
        return false;
      }
    }

    return false;
  }
};

/**
 * Safe localStorage get with error handling
 * @param {string} key - Storage key
 * @param {any} fallback - Fallback value if retrieval fails
 * @returns {any} Stored value or fallback
 */
export const safeLocalStorageGet = (key, fallback = null) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    logError(error, 'LocalStorage Get', ERROR_SEVERITY.LOW, { key });
    return fallback;
  }
};

/**
 * Enhanced WebSocket error suppression
 * @param {Event} event - WebSocket error event
 * @returns {boolean} Whether to suppress the error
 */
export const suppressWebSocketErrors = (event) => {
  const errorMessage = event.error?.message || event.message || '';

  // Suppress browser extension errors
  const suppressPatterns = [
    'content-script',
    'extension',
    'getThumbnail',
    'chrome-extension',
    'moz-extension',
    'ms-browser-extension',
  ];

  const shouldSuppress = suppressPatterns.some((pattern) =>
    errorMessage.toLowerCase().includes(pattern.toLowerCase()),
  );

  if (shouldSuppress) {
    console.debug('Suppressed WebSocket error:', errorMessage);
    return true;
  }

  return false;
};

/**
 * Initialize global error handlers
 */
export const initializeErrorHandling = () => {
  // Global unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;

    // Suppress browser extension errors
    if (
      error &&
      typeof error === 'string' &&
      (error.includes('content-script') || error.includes('getThumbnail'))
    ) {
      return;
    }

    logError(error, 'Unhandled Promise Rejection', ERROR_SEVERITY.HIGH);
    notify('An unexpected error occurred. Please try again.', { type: 'error' });
  });

  // Global error handler
  window.addEventListener('error', (event) => {
    const error = event.error || event.message;

    // Suppress browser extension errors
    if (
      error &&
      typeof error === 'string' &&
      (error.includes('content-script') || error.includes('getThumbnail'))
    ) {
      return;
    }

    logError(error, 'Global Error', ERROR_SEVERITY.HIGH);
  });

  // WebSocket error suppression
  const originalWebSocket = window.WebSocket;
  window.WebSocket = function (url, protocols) {
    const ws = new originalWebSocket(url, protocols);

    ws.addEventListener('error', (event) => {
      if (!suppressWebSocketErrors(event)) {
        logError(
          event.error || new Error('WebSocket error'),
          'WebSocket',
          ERROR_SEVERITY.MEDIUM,
        );
      }
    });

    return ws;
  };

  console.log('✅ Error handling initialized');
};

/**
 * Get unique session ID
 * @returns {string} Session ID
 */
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

/**
 * Store error log in localStorage
 * @param {Object} errorLog - Error log object
 */
const storeErrorLog = (errorLog) => {
  try {
    const existingLogs =
      safeJsonParse(localStorage.getItem('error_logs'), []) || [];
    if (Array.isArray(existingLogs)) {
      existingLogs.push(errorLog);

      // Keep only last 50 errors
      const trimmedLogs = existingLogs.slice(-50);
      safeLocalStorageSet('error_logs', trimmedLogs);
    }
  } catch (error) {
    console.error('Failed to store error log:', error);
  }
};

/**
 * Store performance log in localStorage
 * @param {Object} performanceLog - Performance log object
 */
const storePerformanceLog = (performanceLog) => {
  try {
    const existingLogs =
      safeJsonParse(localStorage.getItem('performance_logs'), []) || [];
    if (Array.isArray(existingLogs)) {
      existingLogs.push(performanceLog);

      // Keep only last 100 performance logs
      const trimmedLogs = existingLogs.slice(-100);
      safeLocalStorageSet('performance_logs', trimmedLogs);
    }
  } catch (error) {
    console.error('Failed to store performance log:', error);
  }
};

/**
 * Clear old logs to free up space
 */
const clearOldLogs = () => {
  try {
    // Clear old error logs
    const errorLogs = safeJsonParse(localStorage.getItem('error_logs'), []);
    if (errorLogs.length > 25) {
      safeLocalStorageSet('error_logs', errorLogs.slice(-25));
    }

    // Clear old performance logs
    const performanceLogs = safeJsonParse(
      localStorage.getItem('performance_logs'),
      [],
    );
    if (performanceLogs.length > 50) {
      safeLocalStorageSet('performance_logs', performanceLogs.slice(-50));
    }
  } catch (error) {
    console.error('Failed to clear old logs:', error);
  }
};

/**
 * Send error to external service (placeholder for production)
 * @param {Object} errorLog - Error log object
 */
const sendErrorToService = async (errorLog) => {
  try {
    // In production, send to error reporting service like Sentry, LogRocket, etc.
    // For now, just log to console
    console.log('📤 Sending error to service:', errorLog);

    // Example: Send to your error reporting service
    // await fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorLog)
    // });
  } catch (error) {
    console.error('Failed to send error to service:', error);
  }
};

/**
 * Get error statistics
 * @returns {Object} Error statistics
 */
export const getErrorStats = () => {
  try {
    const errorLogs = safeJsonParse(localStorage.getItem('error_logs'), []);
    const performanceLogs = safeJsonParse(
      localStorage.getItem('performance_logs'),
      [],
    );

    const errorCounts = errorLogs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {});

    const avgPerformance =
      performanceLogs.length > 0
        ? performanceLogs.reduce((sum, log) => sum + log.duration, 0) /
          performanceLogs.length
        : 0;

    return {
      totalErrors: errorLogs.length,
      errorCounts,
      totalPerformanceLogs: performanceLogs.length,
      averagePerformance: Math.round(avgPerformance),
      lastError: errorLogs[errorLogs.length - 1]?.timestamp,
    };
  } catch (error) {
    console.error('Failed to get error stats:', error);
    return {};
  }
};

/**
 * Clear all error and performance logs
 */
export const clearAllLogs = () => {
  try {
    localStorage.removeItem('error_logs');
    localStorage.removeItem('performance_logs');
    console.log('✅ All logs cleared');
  } catch (error) {
    console.error('Failed to clear logs:', error);
  }
};
