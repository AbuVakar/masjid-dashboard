import React from 'react';
import { FaExclamationTriangle, FaRedo, FaHome } from 'react-icons/fa';

const ErrorFallback = ({
  error,
  resetErrorBoundary,
  componentName = 'Component',
}) => {
  return (
    <div className='error-fallback'>
      <div className='error-fallback-content'>
        <div className='error-icon'>
          <FaExclamationTriangle />
        </div>

        <h3>Something went wrong in {componentName}</h3>
        <p>
          We're sorry, but this component encountered an error. Please try
          again.
        </p>

        <div className='error-actions'>
          <button className='btn-retry' onClick={resetErrorBoundary}>
            <FaRedo /> Try Again
          </button>

          <button
            className='btn-home'
            onClick={() => (window.location.href = '/')}
          >
            <FaHome /> Go Home
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className='error-details'>
            <summary>Error Details (Development)</summary>
            <pre>{error?.toString()}</pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;
