const winston = require('winston');

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'masjid-dashboard-api' },
  transports: [
    // Error logs
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Combined logs
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Production logging rules
const sanitizeLogData = (data) => {
  if (typeof data === 'object' && data !== null) {
    const sanitized = { ...data };
    
    // Remove sensitive fields
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'auth', 'authorization',
      'mongodb_uri', 'database_url', 'connection_string'
    ];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '<REDACTED>';
      }
    });
    
    // Sanitize nested objects
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = sanitizeLogData(sanitized[key]);
      }
    });
    
    return sanitized;
  }
  
  return data;
};

// Enhanced logging methods
const enhancedLogger = {
  info: (message, meta = {}) => {
    logger.info(message, sanitizeLogData(meta));
  },
  
  warn: (message, meta = {}) => {
    logger.warn(message, sanitizeLogData(meta));
  },
  
  error: (message, meta = {}) => {
    logger.error(message, sanitizeLogData(meta));
  },
  
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(message, sanitizeLogData(meta));
    }
  },
  
  // Request logging
  logRequest: (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
      };
      
      if (res.statusCode >= 400) {
        enhancedLogger.warn('HTTP Request', logData);
      } else {
        enhancedLogger.info('HTTP Request', logData);
      }
    });
    
    next();
  }
};

module.exports = { logger, enhancedLogger };
