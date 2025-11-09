/**
 * Comprehensive error tracking and monitoring setup
 */
// Error boundary for React components
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log to console
    console.error('Error caught by boundary:', error, errorInfo);
    
    // You can add custom error reporting here
    // For example, send to your own API
    this.reportToCustomService(error, errorInfo);
  }

  reportToCustomService = async (error, errorInfo) => {
    try {
      // Example: Send error to your custom logging service
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/log-error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: error?.toString(),
            stack: error?.stack,
            componentStack: errorInfo?.componentStack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          }),
        });
      }
    } catch (reportError) {
      console.warn('Failed to report error:', reportError);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <div className="error-content">
            <h2>Something went wrong</h2>
            <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <div className="error-stack">
                  <strong>Error:</strong>
                  <pre>{this.state.error?.toString()}</pre>
                </div>
                <div className="error-stack">
                  <strong>Component Stack:</strong>
                  <pre>{this.state.errorInfo?.componentStack}</pre>
                </div>
              </details>
            )}
            
            <div className="error-actions">
              <button 
                className="reload-btn"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
              <button 
                className="home-btn"
                onClick={() => window.location.href = '/'}
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize error tracking
export const initErrorTracking = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Error tracking initialized in development mode');
    return;
  }

  console.log('Error tracking initialized in production mode');
  
  // You can add custom error tracking initialization here
  // For example, initialize your own error logging service
};

// Custom error reporting function
export const reportError = (error, context = {}) => {
  const errorId = Math.random().toString(36).substr(2, 9);
  
  console.error('Error reported:', {
    errorId,
    error: error?.toString(),
    stack: error?.stack,
    context,
    timestamp: new Date().toISOString(),
    url: window.location.href,
  });

  // Send to custom logging service in production
  if (process.env.NODE_ENV === 'production') {
    this.sendToLoggingService({
      errorId,
      error: error?.toString(),
      stack: error?.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  }

  return errorId;
};

// Send error to custom logging service
export const sendToLoggingService = async (errorData) => {
  try {
    const response = await fetch('/api/log-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Failed to send error to logging service:', error);
    return null;
  }
};

// User feedback component
export const showErrorFeedback = (errorId) => {
  // Simple feedback mechanism - you can enhance this
  const userFeedback = prompt(
    `We encountered an error (ID: ${errorId}). Would you like to tell us what happened?`,
    ''
  );
  
  if (userFeedback) {
    // Send feedback to your API
    fetch('/api/error-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        errorId,
        feedback: userFeedback,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.warn);
  }
};

// Performance monitoring (simplified)
export const startTransaction = (name, op = 'navigation') => {
  const startTime = performance.now();
  const transactionId = Math.random().toString(36).substr(2, 9);
  
  console.log(`Transaction started: ${name} (${op})`, { transactionId });
  
  return {
    id: transactionId,
    name,
    op,
    startTime,
    finish: () => {
      const duration = performance.now() - startTime;
      console.log(`Transaction finished: ${name} - ${duration.toFixed(2)}ms`, { transactionId });
      
      // Log performance data in production
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionId,
            name,
            op,
            duration,
            timestamp: new Date().toISOString(),
          }),
        }).catch(console.warn);
      }
    },
    setTag: (key, value) => {
      console.log(`Transaction tag set: ${key}=${value}`, { transactionId });
    },
    setData: (key, value) => {
      console.log(`Transaction data set: ${key}`, { transactionId, value });
    },
  };
};

// Global error handler
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    reportError(event.reason, {
      type: 'unhandledrejection',
      promise: event.promise.toString(),
    });
    
    // Prevent browser's default error handling
    event.preventDefault();
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    
    reportError(event.error, {
      type: 'uncaught',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  console.log('Global error handling setup complete');
};

// Error tracking utilities
export const ErrorTracking = {
  initErrorTracking,
  ErrorBoundary,
  reportError,
  showErrorFeedback,
  startTransaction,
  setupGlobalErrorHandling,
  sendToLoggingService,
};

export default ErrorTracking;
