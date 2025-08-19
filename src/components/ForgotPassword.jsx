import React, { useState } from 'react';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { apiService } from '../services/api';
import { useNotify } from '../context/NotificationContext';

const ForgotPassword = ({ onBack, onResetPassword }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { notify } = useNotify();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      notify('Please enter your email address', { type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiService.forgotPassword(email);
      if (response.success) {
        setIsEmailSent(true);
        notify('Password reset instructions sent to your email', {
          type: 'success',
        });
      } else {
        notify(response.message || 'Failed to send reset email', {
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      notify('Failed to send reset email. Please try again.', {
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className='auth-container'>
        <div className='auth-header'>
          <h2>📧 Check Your Email</h2>
          <p className='auth-subtitle'>
            We've sent password reset instructions to <strong>{email}</strong>
          </p>
        </div>

        <div className='auth-form'>
          <div className='success-message'>
            <p>If you don't see the email, check your spam folder.</p>
            <p>You can also try again with a different email address.</p>
          </div>

          <button
            type='button'
            className='auth-submit-btn'
            onClick={() => {
              setIsEmailSent(false);
              setEmail('');
            }}
          >
            🔄 Try Again
          </button>

          <button type='button' className='auth-link-btn' onClick={onBack}>
            <FaArrowLeft /> Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='auth-container'>
      <div className='auth-header'>
        <h2>🔑 Forgot Password</h2>
        <p className='auth-subtitle'>
          Enter your email address and we'll send you instructions to reset your
          password.
        </p>
      </div>

      <form className='auth-form' onSubmit={handleSubmit}>
        <div className='input-group'>
          <label htmlFor='email'>
            <FaEnvelope /> Email Address
          </label>
          <input
            type='email'
            id='email'
            className='auth-input'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Enter your email address'
            disabled={isSubmitting}
            autoComplete='email'
            required
          />
        </div>

        <button
          type='submit'
          className='auth-submit-btn'
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span>🔄 Sending...</span>
          ) : (
            <span>📧 Send Reset Link</span>
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

export default ForgotPassword;
