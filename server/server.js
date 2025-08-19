const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: './config.env' });

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Import database connection and validation
const connectDB = require('./config/db');
const validateEnvironment = require('./config/validateEnv');

// Import error handling
const {
  errorHandler,
  notFoundHandler,
  setupProcessErrorHandlers,
} = require('./middleware/errorHandler');

// Import logging
const { enhancedLogger } = require('./utils/logger');

// Import CSRF protection
const { csrfToken, validateCSRF, getCSRFToken } = require('./middleware/csrf');

// Import routes
const housesRoutes = require('./routes/houses');
const resourcesRoutes = require('./routes/resources');
const usersRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

// Initialize express app
const app = express();

// Validate environment variables
validateEnvironment();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }),
);

// Rate limiting with different limits for different endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs for auth (increased for testing)
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Skip rate limiting in test environment
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/', generalLimiter);
  app.use('/api/users/login', authLimiter);
  app.use('/api/users/register', authLimiter);
}

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CSRF protection middleware
// We will not apply CSRF to GET, HEAD, OPTIONS, TRACE requests.
// And we will skip it in test environment and development for easier testing
if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development') {
  app.use(csrfToken);
  app.use(validateCSRF);
}

// Enhanced request logging
app.use(enhancedLogger.logRequest);

// Basic logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CSRF token endpoint
app.get('/api/csrf-token', getCSRFToken);

// API Routes
app.use('/api/houses', housesRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/prayer-times', require('./routes/prayerTimes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Masjid Dashboard API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Masjid Dashboard API',
    version: '1.0.0',
    endpoints: {
      houses: '/api/houses',
      resources: '/api/resources',
      health: '/api/health',
    },
  });
});

// 404 handler - must be last
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);

// Setup process error handlers
setupProcessErrorHandlers();

// Start server
const PORT = process.env.PORT || 5000;

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, async () => {
    await connectDB();
    enhancedLogger.info('Server started', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      apiUrl: `http://localhost:${PORT}`,
      corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    });
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  enhancedLogger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    enhancedLogger.info('Process terminated');
  });
});

module.exports = app;
