const crypto = require('crypto');

/**
 * Custom CSRF Protection Middleware
 * Implements CSRF token generation and validation
 */

// Store for CSRF tokens (in production, use Redis or database)
const csrfTokens = new Map();

/**
 * Generate CSRF token
 * @param {string} sessionId - Session identifier
 * @returns {string} CSRF token
 */
const generateCSRFToken = (sessionId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now();

  // Store token with timestamp for expiration
  csrfTokens.set(sessionId, {
    token,
    timestamp,
    expiresAt: timestamp + 15 * 60 * 1000, // 15 minutes
  });

  return token;
};

/**
 * Validate CSRF token
 * @param {string} sessionId - Session identifier
 * @param {string} token - CSRF token to validate
 * @returns {boolean} True if valid
 */
const validateCSRFToken = (sessionId, token) => {
  const stored = csrfTokens.get(sessionId);

  if (!stored) {
    return false;
  }

  // Check if token is expired
  if (Date.now() > stored.expiresAt) {
    csrfTokens.delete(sessionId);
    return false;
  }

  // Check if token matches
  if (stored.token !== token) {
    return false;
  }

  return true;
};

/**
 * Clean up expired tokens
 */
const cleanupExpiredTokens = () => {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now > data.expiresAt) {
      csrfTokens.delete(sessionId);
    }
  }
};

// Clean up expired tokens every 5 minutes (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  setInterval(cleanupExpiredTokens, 5 * 60 * 1000);
}

/**
 * CSRF middleware for generating tokens
 */
const csrfToken = (req, res, next) => {
  // Skip CSRF for GET requests and static files
  if (req.method === 'GET' || req.path.startsWith('/uploads/')) {
    return next();
  }

  // Skip CSRF in test environment
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  // Generate session ID from user agent and IP
  const sessionId = crypto
    .createHash('sha256')
    .update(`${req.ip}-${req.get('User-Agent')}`)
    .digest('hex');

  // Generate CSRF token
  const token = generateCSRFToken(sessionId);

  // Add token to response headers
  res.setHeader('X-CSRF-Token', token);

  // Add token to response body for forms
  if (req.path.includes('/api/')) {
    res.locals.csrfToken = token;
  }

  next();
};

/**
 * CSRF validation middleware
 */
const validateCSRF = (req, res, next) => {
  // Skip CSRF for GET requests and static files
  if (req.method === 'GET' || req.path.startsWith('/uploads/')) {
    return next();
  }

  // Skip CSRF for API health checks
  if (req.path === '/api/health') {
    return next();
  }

  // Skip CSRF in test environment
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  // Generate session ID
  const sessionId = crypto
    .createHash('sha256')
    .update(`${req.ip}-${req.get('User-Agent')}`)
    .digest('hex');

  // Get token from headers or body
  const token =
    req.headers['x-csrf-token'] || req.body._csrf || req.query._csrf;

  if (!token) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'CSRF token missing',
        code: 'CSRF_TOKEN_MISSING',
      },
    });
  }

  if (!validateCSRFToken(sessionId, token)) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Invalid CSRF token',
        code: 'CSRF_TOKEN_INVALID',
      },
    });
  }

  // Remove token from body to prevent it from being saved
  delete req.body._csrf;

  next();
};

/**
 * CSRF token endpoint for frontend
 */
const getCSRFToken = (req, res) => {
  const sessionId = crypto
    .createHash('sha256')
    .update(`${req.ip}-${req.get('User-Agent')}`)
    .digest('hex');

  const token = generateCSRFToken(sessionId);

  res.json({
    success: true,
    data: {
      token,
      expiresIn: 15 * 60 * 1000, // 15 minutes
    },
  });
};

module.exports = {
  csrfToken,
  validateCSRF,
  getCSRFToken,
  generateCSRFToken,
  validateCSRFToken,
};
