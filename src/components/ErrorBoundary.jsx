import React from 'react';
import PropTypes from 'prop-types';
import { reportError, showErrorFeedback } from '../lib/error-tracking';

/**
 * 🔒 ErrorBoundary
 * A robust error handler for React applications.
 * Catches JavaScript errors in the component tree and displays a fallback UI.
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
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state to trigger fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const componentStack = errorInfo?.componentStack || '';

    this.setState({ errorInfo, componentStack });

    // 🚨 Log and report
    this.reportErrorToService(error, errorInfo);
    this.logErrorToAnalytics(error, errorInfo);

    if (process.env.NODE_ENV === 'development') {
      console.groupCollapsed('🧩 Error Boundary Debug');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', componentStack);
      console.groupEnd();
    }
  }

  /** 🛠️ Report error to tracking service */
  reportErrorToService = async (error, errorInfo) => {
    try {
      this.setState({ isReporting: true });

      const context = {
        componentStack: errorInfo?.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        ...this.props.errorContext,
      };

      const errorId = await reportError(error, context);
      this.setState({ errorId });

      console.info(`✅ Error reported with ID: ${errorId}`);
    } catch (err) {
      console.warn('⚠️ Failed to report error:', err);
    } finally {
      this.setState({ isReporting: false });
    }
  };

  /** 📈 Optional analytics tracking */
  logErrorToAnalytics = (error, errorInfo) => {
    try {
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: error.toString(),
          fatal: true,
        });
      }
      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }
    } catch (err) {
      console.warn('Analytics logging failed:', err);
    }
  };

  /** 🔁 Reset error boundary */
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      componentStack: '',
      showDetails: false,
    });
    this.props.onRetry?.();
  };

  handleReload = () => window.location.reload();

  handleFeedback = () => {
    if (this.state.errorId) showErrorFeedback(this.state.errorId);
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  renderErrorDetails() {
    const { error, errorInfo, componentStack, showDetails } = this.state;
    if (!showDetails) return null;

    return (
      <div style={styles.errorDetails}>
        <h4 style={styles.detailsTitle}>Technical Details</h4>

        {error && (
          <div style={styles.detailSection}>
            <strong>Error:</strong>
            <pre style={styles.pre}>{error.toString()}</pre>
          </div>
        )}

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
            <pre style={styles.pre}>{JSON.stringify(errorInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  renderFallbackUI() {
    const { error, errorId, isReporting } = this.state;
    const FallbackComponent = this.props.fallbackComponent;

    if (FallbackComponent) {
      return (
        <FallbackComponent
          error={error}
          errorId={errorId}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
        />
      );
    }

    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.icon}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h1 style={styles.title}>Something went wrong</h1>
          <p style={styles.message}>
            We’re sorry for the inconvenience. Our team has been notified.
          </p>

          {errorId && (
            <p style={styles.errorId}>
              Error ID: <code>{errorId}</code>
            </p>
          )}

          {isReporting && <p style={styles.reporting}>Reporting error...</p>}

          <div style={styles.actions}>
            <button
              onClick={this.handleRetry}
              style={styles.primaryButton}
              disabled={isReporting}
            >
              Try Again
            </button>
            <button onClick={this.handleReload} style={styles.secondaryButton}>
              Reload Page
            </button>
            {errorId && (
              <button
                onClick={this.handleFeedback}
                style={styles.tertiaryButton}
              >
                Report Issue
              </button>
            )}
          </div>

          {(process.env.NODE_ENV === 'development' ||
            this.props.showDetailsInProduction) && (
            <div style={styles.detailsToggle}>
              <button onClick={this.toggleDetails} style={styles.detailsButton}>
                {this.state.showDetails ? 'Hide' : 'Show'} Technical Details
              </button>
            </div>
          )}

          {this.renderErrorDetails()}
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) return this.renderFallbackUI();
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallbackComponent: PropTypes.elementType,
  onError: PropTypes.func,
  onRetry: PropTypes.func,
  errorContext: PropTypes.object,
  showDetailsInProduction: PropTypes.bool,
};

ErrorBoundary.defaultProps = {
  errorContext: {},
  showDetailsInProduction: false,
};

/* 🎨 Inline styles for isolation and consistency */
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  content: { textAlign: 'center', maxWidth: '500px', width: '100%' },
  icon: { color: '#dc3545', marginBottom: '20px' },
  title: { fontSize: '24px', fontWeight: 600, color: '#212529', margin: '0 0 12px' },
  message: { fontSize: '16px', color: '#6c757d', lineHeight: '1.5', marginBottom: '20px' },
  errorId: { fontSize: '14px', color: '#495057', marginBottom: '20px' },
  reporting: { fontSize: '14px', color: '#6c757d', fontStyle: 'italic', marginBottom: '20px' },
  actions: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' },
  primaryButton: { padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  secondaryButton: { padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  tertiaryButton: { padding: '10px 20px', border: '1px solid #007bff', color: '#007bff', borderRadius: '4px', cursor: 'pointer', background: 'transparent' },
  detailsToggle: { marginBottom: '20px' },
  detailsButton: { padding: '8px 16px', border: '1px solid #dee2e6', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' },
  errorDetails: { textAlign: 'left', background: '#fff', border: '1px solid #dee2e6', borderRadius: '4px', padding: '16px', marginTop: '16px' },
  detailsTitle: { margin: '0 0 12px', fontSize: '16px', fontWeight: 600, color: '#212529' },
  detailSection: { marginBottom: '16px' },
  pre: { background: '#f8f9fa', padding: '12px', borderRadius: '4px', fontSize: '12px', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
};

/** Higher Order Component */
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => (props) => (
  <ErrorBoundary {...errorBoundaryProps}>
    <Component {...props} />
  </ErrorBoundary>
);

/** Custom hook for controlled error handling */
export const useErrorBoundary = () => {
  const [error, setError] = React.useState(null);
  return {
    error: error?.error,
    errorInfo: error?.errorInfo,
    handleError: (error, info) => setError({ error, errorInfo: info }),
    resetError: () => setError(null),
  };
};

export default ErrorBoundary;
