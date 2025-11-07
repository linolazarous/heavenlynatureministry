import React from 'react';
import PropTypes from 'prop-types';
import { reportError, showErrorFeedback } from '../lib/error-tracking';

/**
 * Production-ready Error Boundary component
 * Catches JavaScript errors in child component tree and displays fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      componentStack: '',
      isReporting: false,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: error
    };
  }

  componentDidCatch(error, errorInfo) {
    // Extract component stack from errorInfo
    const componentStack = errorInfo?.componentStack || '';
    
    this.setState({
      errorInfo: errorInfo,
      componentStack: componentStack
    });

    // Report to error tracking service
    this.reportErrorToService(error, errorInfo);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error);
      console.error('Error info:', errorInfo);
      console.error('Component stack:', componentStack);
    }

    // Optional: Log to analytics
    this.logErrorToAnalytics(error, errorInfo);
  }

  reportErrorToService = async (error, errorInfo) => {
    try {
      this.setState({ isReporting: true });
      
      const context = {
        componentStack: errorInfo?.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        ...this.props.errorContext
      };

      const errorId = reportError(error, context);
      
      this.setState({ errorId });
      
      console.log(`Error reported with ID: ${errorId}`);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    } finally {
      this.setState({ isReporting: false });
    }
  };

  logErrorToAnalytics = (error, errorInfo) => {
    // Integrate with your analytics service
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: true
      });
    }
    
    // Custom analytics logging
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      componentStack: '',
      showDetails: false
    });
    
    // Call retry callback if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleFeedback = () => {
    if (this.state.errorId) {
      showErrorFeedback(this.state.errorId);
    }
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  renderErrorDetails() {
    const { error, errorInfo, componentStack } = this.state;
    
    if (!this.state.showDetails) return null;

    return (
      <div className="error-details" style={styles.errorDetails}>
        <h4 style={styles.detailsTitle}>Error Details</h4>
        
        <div style={styles.detailSection}>
          <strong>Error Message:</strong>
          <pre style={styles.pre}>{error?.toString()}</pre>
        </div>

        {error?.stack && (
          <div style={styles.detailSection}>
            <strong>Stack Trace:</strong>
            <pre style={styles.pre}>{error.stack}</pre>
          </div>
        )}

        {componentStack && (
          <div style={styles.detailSection}>
            <strong>Component Stack:</strong>
            <pre style={styles.pre}>{componentStack}</pre>
          </div>
        )}

        {errorInfo && (
          <div style={styles.detailSection}>
            <strong>Error Info:</strong>
            <pre style={styles.pre}>
              {JSON.stringify(errorInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      const FallbackComponent = this.props.fallbackComponent;
      
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            errorId={this.state.errorId}
            onRetry={this.handleRetry}
            onReload={this.handleReload}
          />
        );
      }

      return (
        <div className="error-boundary" style={styles.container}>
          <div style={styles.content}>
            <div style={styles.icon}>
              {/* SVG Alert Icon */}
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            
            <h1 style={styles.title}>Something went wrong</h1>
            
            <p style={styles.message}>
              We're sorry for the inconvenience. Our team has been notified and is working to fix the issue.
            </p>

            {this.state.errorId && (
              <p style={styles.errorId}>
                Error ID: <code>{this.state.errorId}</code>
              </p>
            )}

            {this.state.isReporting && (
              <p style={styles.reporting}>
                Reporting error...
              </p>
            )}

            <div style={styles.actions}>
              <button
                onClick={this.handleRetry}
                style={styles.primaryButton}
                disabled={this.state.isReporting}
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                style={styles.secondaryButton}
              >
                Reload Page
              </button>

              {this.state.errorId && (
                <button
                  onClick={this.handleFeedback}
                  style={styles.tertiaryButton}
                >
                  Report Issue
                </button>
              )}
            </div>

            {/* Error details toggle - only show in development or if explicitly enabled */}
            {(process.env.NODE_ENV === 'development' || this.props.showDetailsInProduction) && (
              <div style={styles.detailsToggle}>
                <button
                  onClick={this.toggleDetails}
                  style={styles.detailsButton}
                >
                  {this.state.showDetails ? 'Hide' : 'Show'} Technical Details
                </button>
              </div>
            )}

            {this.renderErrorDetails()}
          </div>
        </div>
      );
    }

    // Render children normally when there's no error
    return this.props.children;
  }
}

// PropTypes for better development experience
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallbackComponent: PropTypes.elementType,
  onError: PropTypes.func,
  onRetry: PropTypes.func,
  errorContext: PropTypes.object,
  showDetailsInProduction: PropTypes.bool
};

// Default props
ErrorBoundary.defaultProps = {
  errorContext: {},
  showDetailsInProduction: false
};

// Inline styles for better isolation
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  content: {
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%'
  },
  icon: {
    color: '#dc3545',
    marginBottom: '20px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#212529',
    margin: '0 0 12px 0'
  },
  message: {
    fontSize: '16px',
    color: '#6c757d',
    lineHeight: '1.5',
    margin: '0 0 20px 0'
  },
  errorId: {
    fontSize: '14px',
    color: '#495057',
    margin: '0 0 20px 0'
  },
  reporting: {
    fontSize: '14px',
    color: '#6c757d',
    fontStyle: 'italic',
    margin: '0 0 20px 0'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '20px'
  },
  primaryButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  secondaryButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  tertiaryButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: '#007bff',
    border: '1px solid #007bff',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  detailsToggle: {
    marginBottom: '20px'
  },
  detailsButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#6c757d',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  errorDetails: {
    textAlign: 'left',
    backgroundColor: 'white',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    padding: '16px',
    marginTop: '16px'
  },
  detailsTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#212529'
  },
  detailSection: {
    marginBottom: '16px'
  },
  pre: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    borderRadius: '4px',
    fontSize: '12px',
    overflow: 'auto',
    margin: '8px 0 0 0',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }
};

// Higher Order Component for easy usage
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for manual error boundary control
export const useErrorBoundary = () => {
  const [error, setError] = React.useState(null);

  const handleError = React.useCallback((error, errorInfo) => {
    setError({ error, errorInfo });
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error: error?.error,
    errorInfo: error?.errorInfo,
    handleError,
    resetError
  };
};

export default ErrorBoundary;