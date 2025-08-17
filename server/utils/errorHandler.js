/**
 * Standardized Error Handling for Backend API
 * Provides consistent error responses and logging
 */

// Error response helper
const sendError = (res, status, message, details = null) => {
  const errorResponse = {
    error: {
      message,
      details,
      timestamp: new Date().toISOString(),
      status
    }
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && details?.stack) {
    errorResponse.error.stack = details.stack;
  }

  res.status(status).json(errorResponse);
};

// Success response helper
const sendSuccess = (res, data, message = 'Success') => {
  res.json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// Common error responses
const errorResponses = {
  notFound: (res, resource = 'Resource') => {
    sendError(res, 404, `${resource} not found`);
  },

  badRequest: (res, message = 'Invalid request data') => {
    sendError(res, 400, message);
  },

  unauthorized: (res, message = 'Authentication required') => {
    sendError(res, 401, message);
  },

  forbidden: (res, message = 'Access denied') => {
    sendError(res, 403, message);
  },

  conflict: (res, message = 'Resource conflict') => {
    sendError(res, 409, message);
  },

  validationError: (res, errors) => {
    sendError(res, 400, 'Validation failed', { validationErrors: errors });
  },

  serverError: (res, error = null) => {
    console.error('Server Error:', error);
    sendError(res, 500, 'Internal server error', error ? { message: error.message } : null);
  },

  databaseError: (res, error) => {
    console.error('Database Error:', error);
    sendError(res, 500, 'Database operation failed', { message: error.message });
  }
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error handler
const handleValidationError = (error) => {
  const errors = {};
  
  if (error.name === 'ValidationError') {
    Object.keys(error.errors).forEach(key => {
      errors[key] = error.errors[key].message;
    });
  }
  
  return errors;
};

// MongoDB error handler
const handleMongoError = (error) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return `Duplicate ${field} value`;
  }
  
  return error.message;
};

module.exports = {
  sendError,
  sendSuccess,
  errorResponses,
  asyncHandler,
  handleValidationError,
  handleMongoError
};
