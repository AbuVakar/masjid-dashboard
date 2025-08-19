import React, { useState, useEffect } from 'react';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { apiService } from '../services/api';
import { useNotify } from '../context/NotificationContext';

const ResetPassword = ({ token, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const { notify } = useNotify();

  // Validate password strength
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) {
      errors.push(`At least ${minLength} characters`);
    }
    if (!hasUpperCase) errors.push('One uppercase letter');
    if (!hasLowerCase) errors.push('One lowercase letter');
    if (!hasNumbers) errors.push('One number');
    if (!hasSpecialChar) errors.push('One special character');

    return errors;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field-specific error
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    const passwordErrors = validatePassword(formData.newPassword);
    const newErrors = {};

    if (passwordErrors.length > 0) {
      newErrors.newPassword = `Password must contain: ${passwordErrors.join(', ')}`;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiService.resetPassword(
        token,
        formData.newPassword,
      );
      if (response.success) {
        setIsSuccess(true);
        notify(
          'Password reset successfully! You can now login with your new password.',
          {
            type: 'success',
          },
        );
      } else {
        notify(response.message || 'Failed to reset password', {
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      notify('Failed to reset password. Please try again.', {
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className='auth-container'>
        <div className='auth-header'>
          <h2>✅ Password Reset Successfully</h2>
          <p className='auth-subtitle'>
            Your password has been reset successfully. You can now login with
            your new password.
          </p>
        </div>

        <div className='auth-form'>
          <div className='success-message'>
            <p>🎉 Your password has been updated successfully!</p>
            <p>You can now use your new password to login to your account.</p>
          </div>

          <button type='button' className='auth-submit-btn' onClick={onSuccess}>
            🔐 Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='auth-container'>
      <div className='auth-header'>
        <h2>🔑 Reset Your Password</h2>
        <p className='auth-subtitle'>
          Enter your new password below. Make sure it's strong and secure.
        </p>
      </div>

      <form className='auth-form' onSubmit={handleSubmit}>
        <div className='input-group'>
          <label htmlFor='newPassword'>
            <FaLock /> New Password
          </label>
          <div className='password-input-container'>
            <input
              type={showPassword ? 'text' : 'password'}
              id='newPassword'
              className={`auth-input ${errors.newPassword ? 'error' : ''}`}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              placeholder='Enter your new password'
              disabled={isSubmitting}
              autoComplete='new-password'
              required
            />
            <button
              type='button'
              className='password-toggle'
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.newPassword && (
            <div className='error-message'>{errors.newPassword}</div>
          )}
        </div>

        <div className='input-group'>
          <label htmlFor='confirmPassword'>
            <FaLock /> Confirm New Password
          </label>
          <div className='password-input-container'>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id='confirmPassword'
              className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange('confirmPassword', e.target.value)
              }
              placeholder='Confirm your new password'
              disabled={isSubmitting}
              autoComplete='new-password'
              required
            />
            <button
              type='button'
              className='password-toggle'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isSubmitting}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.confirmPassword && (
            <div className='error-message'>{errors.confirmPassword}</div>
          )}
        </div>

        <button
          type='submit'
          className='auth-submit-btn'
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span>🔄 Resetting Password...</span>
          ) : (
            <span>🔐 Reset Password</span>
          )}
        </button>

        <button
          type='button'
          className='auth-link-btn'
          onClick={onBack}
          disabled={isSubmitting}
        >
          <FaArrowLeft /> Back to Login
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
