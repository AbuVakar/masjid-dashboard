import React, { useState, useEffect, useCallback } from 'react';
import { useNotify } from '../context/NotificationContext';
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaLock,
  FaMobile,
  FaEnvelope,
} from 'react-icons/fa';
import {
  validateLoginCredentials,
  validateRegistrationData,
  displayValidationErrors,
  authRateLimiter,
} from '../utils/validation';
import {
  logError,
  measurePerformance,
  ERROR_SEVERITY,
} from '../utils/errorHandler';

// Demo user credentials for testing (removed for security)

// Admin credentials with proper password format (for reference)
// const ADMIN_CREDENTIALS = {
//   username: 'admin',
//   password: 'admin123',
//   mobile: '9876543210',
//   email: 'admin@masjid.com'
// };

const UserAuth = ({ onLogin, onRegister, onGuestMode, loading = false }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notify } = useNotify();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    email: '',
  });

  // Clear form data when component mounts and when switching modes
  useEffect(() => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      mobile: '',
      email: '',
    });
    setErrors({});
    // Ensure password is hidden
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [isLogin]);

  // Clear form on mount and ensure password is hidden
  useEffect(() => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      mobile: '',
      email: '',
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  // Force password visibility to false on every render
  useEffect(() => {
    if (showPassword) {
      setShowPassword(false);
    }
  });

  // Clear errors when switching modes
  useEffect(() => {
    setErrors({});
  }, [isLogin]);

  // Handle input changes with validation
  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear field-specific error
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
    },
    [errors],
  );

  // Validate form data
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (isLogin) {
      const validation = validateLoginCredentials(formData);
      if (!validation.isValid) {
        validation.errors.forEach((error) => {
          if (error.includes('Username')) newErrors.username = error;
          if (error.includes('Password')) newErrors.password = error;
        });
      }
    } else {
      const validation = validateRegistrationData(formData);
      if (!validation.isValid) {
        validation.errors.forEach((error) => {
          if (error.includes('Username')) newErrors.username = error;
          if (error.includes('Password')) newErrors.password = error;
          if (error.includes('confirm')) newErrors.confirmPassword = error;
          if (error.includes('Mobile')) newErrors.mobile = error;
          if (error.includes('Email')) newErrors.email = error;
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [isLogin, formData]);

  // Handle form submission with security measures
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (isSubmitting) return; // Prevent double submission

      // Clear any existing error messages
      setErrors({});

      // Rate limiting check
      const userIdentifier = formData.username || 'anonymous';
      if (!authRateLimiter.isAllowed(userIdentifier)) {
        notify('Too many attempts. Please wait 15 minutes before trying again.', { type: 'error' });
        return;
      }

      // Validate form
      if (!validateForm()) {
        displayValidationErrors(Object.values(errors).filter(Boolean));
        return;
      }

      setIsSubmitting(true);

      try {
        await measurePerformance(
          isLogin ? 'User Login' : 'User Registration',
          async () => {
            if (isLogin) {
              const success = await handleLogin();
              if (success) {
                // Clear form on successful login
                setFormData({
                  username: '',
                  password: '',
                  confirmPassword: '',
                  mobile: '',
                  email: '',
                });
              }
            } else {
              await handleRegister();
            }
          },
          { context: isLogin ? 'Login' : 'Registration' },
        );
      } catch (error) {
        logError(error, 'Authentication', ERROR_SEVERITY.HIGH);
        notify('Authentication failed. Please try again.', { type: 'error' });
      } finally {
        setIsSubmitting(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [isLogin, isSubmitting, formData, errors, validateForm, notify],
  );

  // Handle login with enhanced security
  const handleLogin = useCallback(async () => {
    const sanitizedData = {
      username: formData.username.trim(),
      password: formData.password,
    };

    // Real backend login for all users including admin and demo
    try {
      const success = await onLogin(sanitizedData);
      if (success) {
        authRateLimiter.reset(sanitizedData.username);
        // Don't show success notify here as it will be handled by the parent component
        return true;
      } else {
        notify('Invalid credentials. Please try again.', { type: 'error' });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      notify(error.message || 'Login failed. Please try again.', { type: 'error' });
      return false;
    }
  }, [formData, onLogin, notify]);

  // Handle registration with enhanced security
  const handleRegister = useCallback(async () => {
    const sanitizedData = {
      username: formData.username.trim(),
      password: formData.password,
      mobile: formData.mobile.trim(),
      email: formData.email.trim(),
    };

    try {
      await onRegister(sanitizedData);
      authRateLimiter.reset(sanitizedData.username);
      notify('Registration successful!', { type: 'success' });
    } catch (error) {
      throw new Error('Registration failed. Please try again.');
    }
  }, [formData, onRegister, notify]);

  // Handle guest mode
  const handleGuestMode = useCallback(async () => {
    try {
      await measurePerformance('Guest Mode Access', async () => {
        await onGuestMode();
      });
      notify('Entering guest mode', { type: 'info' });
    } catch (error) {
      logError(error, 'Guest Mode', ERROR_SEVERITY.MEDIUM);
      notify('Failed to enter guest mode', { type: 'error' });
    }
  }, [onGuestMode, notify]);

  // Get input class name based on validation state
  const getInputClassName = useCallback(
    (field) => {
      const baseClass = 'auth-input';
      if (errors[field]) return `${baseClass} error`;
      if (formData[field]) return `${baseClass} valid`;
      return baseClass;
    },
    [errors, formData],
  );

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>🕌 Silsila-ul-Ahwaal</h2>
        <p className="auth-subtitle">
          {isLogin
            ? 'Welcome back! Please sign in to continue.'
            : 'Create your account to get started.'}
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {/* Username Field */}
        <div className="input-group">
          <label htmlFor="username">
            <FaUser /> Username
          </label>
          <input
            type="text"
            id="username"
            className={getInputClassName('username')}
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="Enter your username"
            disabled={isSubmitting || loading}
            autoComplete="username"
            required
          />
          {errors.username && (
            <div className="error-message">{errors.username}</div>
          )}
        </div>

        {/* Password Field */}
        <div className="input-group">
          <label htmlFor="password">
            <FaLock /> Password
          </label>
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className={getInputClassName('password')}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter your password"
              disabled={isSubmitting || loading}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting || loading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && (
            <div className="error-message">{errors.password}</div>
          )}
        </div>

        {/* Confirm Password Field (Registration only) */}
        {!isLogin && (
          <div className="input-group">
            <label htmlFor="confirmPassword">
              <FaLock /> Confirm Password
            </label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                className={getInputClassName('confirmPassword')}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange('confirmPassword', e.target.value)
                }
                placeholder="Confirm your password"
                disabled={isSubmitting || loading}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSubmitting || loading}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </div>
        )}

        {/* Mobile Field (Registration only) */}
        {!isLogin && (
          <div className="input-group">
            <label htmlFor="mobile">
              <FaMobile /> Mobile Number
            </label>
            <input
              type="tel"
              id="mobile"
              className={getInputClassName('mobile')}
              value={formData.mobile}
              onChange={(e) => handleInputChange('mobile', e.target.value)}
              placeholder="Enter your mobile number"
              disabled={isSubmitting || loading}
              autoComplete="tel"
            />
            {errors.mobile && (
              <div className="error-message">{errors.mobile}</div>
            )}
          </div>
        )}

        {/* Email Field (Registration only) */}
        {!isLogin && (
          <div className="input-group">
            <label htmlFor="email">
              <FaEnvelope /> Email Address
            </label>
            <input
              type="email"
              id="email"
              className={getInputClassName('email')}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email address"
              disabled={isSubmitting || loading}
              autoComplete="email"
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="auth-submit-btn"
          disabled={isSubmitting || loading}
        >
          {isSubmitting ? (
            <span>🔄 {isLogin ? 'Signing In...' : 'Creating Account...'}</span>
          ) : (
            <span>{isLogin ? '🔐 Sign In' : '📝 Create Account'}</span>
          )}
        </button>

        {/* Forgot Password Link (Login mode only) */}
        {isLogin && (
          <div className="auth-links">
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => {
                notify(
                  'Forgot password feature coming soon! Please contact admin.',
                  { type: 'info' }
                );
              }}
            >
              🔑 Forgot Password?
            </button>
          </div>
        )}
      </form>

      {/* Mode Toggle */}
      <div className="auth-mode-toggle">
        <button
          type="button"
          className="mode-toggle-btn"
          onClick={() => setIsLogin(!isLogin)}
          disabled={isSubmitting || loading}
        >
          {isLogin
            ? '📝 Need an account? Sign up'
            : '🔐 Already have an account? Sign in'}
        </button>
      </div>

      {/* Guest Mode */}
      <div className="auth-guest-section">
        <button
          type="button"
          className="guest-mode-btn"
          onClick={handleGuestMode}
          disabled={isSubmitting || loading}
        >
          👤 Continue as Guest
        </button>
      </div>
    </div>
  );
};

export default UserAuth;
