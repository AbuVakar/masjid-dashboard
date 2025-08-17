import React from 'react';
import { toast } from 'react-toastify';
import { logError } from '../utils/errorHandler';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error with context
    logError(error, 'ErrorBoundary', 'high', {
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount
    });

    this.setState({
      error,
      errorInfo
    });

    // Show user-friendly notification
    toast.error('Something went wrong. Please try refreshing the page.');
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            
            <h2>Something went wrong</h2>
            <p>We're sorry, but this component encountered an error. Please try again.</p>
            
            <div className="error-actions">
              <button 
                className="btn-retry" 
                onClick={this.handleRetry}
                disabled={this.state.retryCount >= 3}
              >
                Try Again
              </button>
              
              <button 
                className="btn-reset" 
                onClick={this.handleReset}
              >
                Reset
              </button>
              
              <button 
                className="btn-home" 
                onClick={() => window.location.href = '/'}
              >
                Go Home
              </button>
            </div>

            {this.state.retryCount >= 3 && (
              <div className="error-warning">
                <p>Multiple retries failed. Please refresh the page or contact support.</p>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <div className="error-stack">
                  <h4>Error:</h4>
                  <pre>{this.state.error.toString()}</pre>
                  
                  {this.state.errorInfo && (
                    <>
                      <h4>Component Stack:</h4>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
