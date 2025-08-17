// WebSocket Error Suppression Utility
// This file suppresses WebSocket connection errors that are not needed for local development

export const suppressWebSocketErrors = () => {
  // Override console.error to filter out WebSocket connection errors
  const originalError = console.error;
  
  console.error = (...args) => {
    const message = args.join(' ');
    
    // Filter out WebSocket connection errors
    if (message.includes('WebSocket connection to') && message.includes('failed')) {
      // Suppress these errors - they're not needed for local development
      return;
    }
    
    // Log all other errors normally
    originalError.apply(console, args);
  };
  
  // Also suppress WebSocket errors in window.onerror
  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (message && message.includes('WebSocket connection to')) {
      return true; // Prevent error from being logged
    }
    
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }
    return false;
  };
};

export default suppressWebSocketErrors;
