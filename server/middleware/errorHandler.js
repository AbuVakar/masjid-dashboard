const { enhancedLogger } = require('../utils/logger');

/**
 * Custom error class for API errors.
 * @extends Error
 */
class AppError extends Error {
  /**
   * Creates an instance of AppError.
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code.
   * @param {string} [code=null] - A custom error code.
   */
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * A wrapper for async route handlers to catch errors and pass them to the error handler.
 * @param {function} fn - The async route handler function.
 * @returns {function} An Express route handler function.
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const errorHandlers = {
  CastError: () => new AppError('Resource not found', 404, 'INVALID_ID'),
  ValidationError: (err) => {
    const message = 'Validation failed';
    const details = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors[key].message,
    }));
    const error = new AppError(message, 400, 'VALIDATION_ERROR');
    error.details = details;
    return error;
  },
  JsonWebTokenError: () => new AppError('Invalid token', 401, 'INVALID_TOKEN'),
  TokenExpiredError: () => new AppError('Token expired', 401, 'TOKEN_EXPIRED'),
  MongoNetworkError: () => new AppError('Database connection failed', 503, 'DATABASE_ERROR'),
  MongoServerSelectionError: () => new AppError('Database connection failed', 503, 'DATABASE_ERROR'),
  ECONNABORTED: () => new AppError('Request timeout', 408, 'REQUEST_TIMEOUT'),
  ETIMEDOUT: () => new AppError('Request timeout', 408, 'REQUEST_TIMEOUT'),
  11000: (err) => {
    const field = Object.keys(err.keyPattern)[0];
    const message = `Duplicate ${field} value`;
    return new AppError(message, 409, 'DUPLICATE_KEY');
  },
  429: () => new AppError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED'),
};

/**
 * Centralized error handling middleware.
 * @param {Error} err - The error object.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  // Log the original error
  enhancedLogger.error('API Error', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
  });

  let error = err;

  // Check for specific error types
  if (errorHandlers[err.name]) {
    error = errorHandlers[err.name](err);
  } else if (errorHandlers[err.code]) {
    error = errorHandlers[err.code](err);
  } else if (errorHandlers[err.status]) {
    error = errorHandlers[err.status](err);
  } else if (!(err instanceof AppError)) {
    // If it's not an AppError and not handled, create a generic one
    error = new AppError('Internal Server Error', 500, 'INTERNAL_SERVER_ERROR');
  }

  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    },
  };

  // Add details if available
  if (error.details) {
    errorResponse.error.details = error.details;
  }

  // Add stack trace only in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    errorResponse.error.stack = error.stack;
  }

  res.status(error.statusCode || 500).json(errorResponse);
};

/**
 * Middleware to handle 404 Not Found errors.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND');
  next(error);
};

/**
 * Sets up global process error handlers for unhandled rejections and uncaught exceptions.
 */
const setupProcessErrorHandlers = () => {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    enhancedLogger.error('Unhandled Promise Rejection', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString(),
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
      stack: error.stack,
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
  setupProcessErrorHandlers,
};
