import DOMPurify from 'dompurify';

/**
 * Comprehensive Input Sanitization Utility
 * Provides XSS prevention and data validation
 */

// Sanitization options for different content types
const SANITIZATION_OPTIONS = {
  // For user input fields (names, addresses, etc.)
  TEXT: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  },
  
  // For rich text content (notes, descriptions)
  RICH_TEXT: {
    ALLOWED_TAGS: ['b', 'i', 'u', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['class'],
    KEEP_CONTENT: true
  },
  
  // For URLs
  URL: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true
  }
};

/**
 * Sanitize text input to prevent XSS
 * @param {string} input - Raw input string
 * @param {string} type - Type of content ('text', 'rich_text', 'url')
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input, type = 'text') => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const options = SANITIZATION_OPTIONS[type.toUpperCase()] || SANITIZATION_OPTIONS.TEXT;
  
  // Use DOMPurify for XSS prevention
  const sanitized = DOMPurify.sanitize(input, options);
  
  // Additional custom sanitization
  return sanitized
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[<>]/g, ''); // Remove any remaining angle brackets
};

/**
 * Sanitize object with nested properties
 * @param {Object} obj - Object to sanitize
 * @param {Object} fieldTypes - Mapping of field names to sanitization types
 * @returns {Object} Sanitized object
 */
export const sanitizeObject = (obj, fieldTypes = {}) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      const sanitizationType = fieldTypes[key] || 'text';
      sanitized[key] = sanitizeInput(value, sanitizationType);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' 
          ? sanitizeInput(item, fieldTypes[key] || 'text')
          : sanitizeObject(item, fieldTypes)
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, fieldTypes);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Sanitize house data specifically
 * @param {Object} houseData - House data object
 * @returns {Object} Sanitized house data
 */
export const sanitizeHouseData = (houseData) => {
  const fieldTypes = {
    number: 'text',
    street: 'text',
    notes: 'rich_text',
    'members.name': 'text',
    'members.fatherName': 'text',
    'members.occupation': 'text',
    'members.mobile': 'text'
  };

  return sanitizeObject(houseData, fieldTypes);
};

/**
 * Sanitize user data specifically
 * @param {Object} userData - User data object
 * @returns {Object} Sanitized user data
 */
export const sanitizeUserData = (userData) => {
  const fieldTypes = {
    username: 'text',
    name: 'text',
    email: 'text',
    mobile: 'text'
  };

  return sanitizeObject(userData, fieldTypes);
};

/**
 * Validate and sanitize email address
 * @param {string} email - Email address
 * @returns {string|null} Sanitized email or null if invalid
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const sanitized = sanitizeInput(email.toLowerCase().trim(), 'text');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(sanitized) ? sanitized : null;
};

/**
 * Validate and sanitize mobile number
 * @param {string} mobile - Mobile number
 * @returns {string|null} Sanitized mobile or null if invalid
 */
export const sanitizeMobile = (mobile) => {
  if (!mobile || typeof mobile !== 'string') {
    return null;
  }

  // Remove all non-digit characters
  const digitsOnly = mobile.replace(/\D/g, '');
  
  // Check if it's a valid mobile number (10-15 digits)
  if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
    return digitsOnly;
  }
  
  return null;
};

/**
 * Validate and sanitize URL
 * @param {string} url - URL string
 * @returns {string|null} Sanitized URL or null if invalid
 */
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const sanitized = sanitizeInput(url.trim(), 'url');
  
  try {
    // Validate URL format
    new URL(sanitized);
    return sanitized;
  } catch {
    return null;
  }
};

const sanitizationUtils = {
  sanitizeInput,
  sanitizeObject,
  sanitizeHouseData,
  sanitizeUserData,
  sanitizeEmail,
  sanitizeMobile,
  sanitizeUrl
};

export default sanitizationUtils;
