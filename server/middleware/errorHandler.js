const { enhancedLogger } = require('../utils/logger');

// Custom error class for API errors
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Async handler wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error with context
  enhancedLogger.error('API Error', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404, 'INVALID_ID');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `Duplicate ${field} value`;
    error = new AppError(message, 409, 'DUPLICATE_KEY');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = 'Validation failed';
    const details = Object.keys(err.errors).map(key => ({
      field: key,
      message: err.errors[key].message
    }));
    error = new AppError(message, 400, 'VALIDATION_ERROR');
    error.details = details;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401, 'TOKEN_EXPIRED');
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Too many requests';
    error = new AppError(message, 429, 'RATE_LIMIT_EXCEEDED');
  }

  // Network timeout errors
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    const message = 'Request timeout';
    error = new AppError(message, 408, 'REQUEST_TIMEOUT');
  }

  // Database connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
    const message = 'Database connection failed';
    error = new AppError(message, 503, 'DATABASE_ERROR');
  }

  // Default error
  if (!error.statusCode) {
    error.statusCode = 500;
    error.code = 'INTERNAL_SERVER_ERROR';
  }

  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'Internal Server Error',
      timestamp: new Date().toISOString(),
      requestId: req.id || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  };

  // Add details if available
  if (error.details) {
    errorResponse.error.details = error.details;
  }

  // Add stack trace only in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    errorResponse.error.stack = error.stack;
  }

  // Send error response
  res.status(error.statusCode).json(errorResponse);
};

// 404 handler
const notFoundHandler = (req, res) => {
  enhancedLogger.warn('Route not found', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress
  });

  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'Route not found',
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      requestId: req.id || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  });
};

// Process error handlers
const setupProcessErrorHandlers = () => {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    enhancedLogger.error('Unhandled Promise Rejection', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString()
    });
    
    // Don't exit in development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    enhancedLogger.error('Uncaught Exception', {
      message: error.message,
      stack: error.stack
    });
    
    // Exit process in all environments for uncaught exceptions
    process.exit(1);
  });

  // Handle SIGTERM for graceful shutdown
  process.on('SIGTERM', () => {
    enhancedLogger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  // Handle SIGINT for graceful shutdown
  process.on('SIGINT', () => {
    enhancedLogger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
};

module.exports = {
  AppError,
  asyncHandler,
  errorHandler,
  notFoundHandler,
  setupProcessErrorHandlers
};
