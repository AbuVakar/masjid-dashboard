import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large',
  };

  return (
    <div
      className="loading-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className={`loading-spinner ${sizeClasses[size]}`}
        style={{
          width: size === 'small' ? '20px' : size === 'large' ? '40px' : '30px',
          height:
            size === 'small' ? '20px' : size === 'large' ? '40px' : '30px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #0f5132',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '10px',
        }}
      ></div>
      {text && (
        <p
          style={{
            margin: '0',
            color: '#666',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          {text}
        </p>
      )}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
