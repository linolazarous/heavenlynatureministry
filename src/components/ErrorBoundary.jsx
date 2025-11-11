// ✅ src/components/ErrorBoundary.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { reportError, showErrorFeedback } from '../lib/error-tracking';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      isReporting: false,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  async componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    await this.reportErrorToService(error, errorInfo);
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'exception', { description: error.toString(), fatal: true });
    }
  }

  reportErrorToService = async (error, errorInfo) => {
    try {
      this.setState({ isReporting: true });
      const errorId = await reportError(error, {
        componentStack: errorInfo?.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        ...this.props.errorContext,
      });
      this.setState({ errorId });
    } catch {
      // silent fail to avoid render errors
    } finally {
      this.setState({ isReporting: false });
    }
  };

  handleRetry = () =>
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      showDetails: false,
    });

  handleReload = () => window.location.reload();
  handleFeedback = () => this.state.errorId && showErrorFeedback(this.state.errorId);

  renderFallbackUI() {
    const { error, errorId, isReporting, showDetails, errorInfo } = this.state;

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>⚠️</div>
          <h2 style={styles.title}>Something went wrong</h2>
          <p style={styles.subtitle}>Our team has been notified.</p>
          {errorId && <p style={styles.errorId}>Error ID: {errorId}</p>}

          <div style={styles.buttons}>
            <button style={styles.primary} onClick={this.handleRetry}>Try Again</button>
            <button style={styles.secondary} onClick={this.handleReload}>Reload</button>
            {errorId && (
              <button style={styles.link} onClick={this.handleFeedback}>
                Report Issue
              </button>
            )}
          </div>

          {process.env.NODE_ENV === 'development' && (
            <button
              style={styles.toggle}
              onClick={() => this.setState({ showDetails: !showDetails })}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          )}

          {showDetails && (
            <pre style={styles.details}>
              {error?.stack || JSON.stringify(errorInfo, null, 2)}
            </pre>
          )}

          {isReporting && <p style={styles.loading}>Reporting error...</p>}
        </div>
      </div>
    );
  }

  render() {
    return this.state.hasError ? this.renderFallbackUI() : this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  errorContext: PropTypes.object,
};

ErrorBoundary.defaultProps = {
  errorContext: {},
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    background: '#f8f9fa',
  },
  card: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '480px',
    width: '100%',
  },
  icon: { fontSize: '2rem', marginBottom: '1rem' },
  title: { fontSize: '1.5rem', fontWeight: '600' },
  subtitle: { color: '#6c757d', marginBottom: '1rem' },
  buttons: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  primary: { background: '#007bff', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' },
  secondary: { background: '#6c757d', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' },
  link: { background: 'transparent', color: '#007bff', border: 'none', padding: '10px 16px', cursor: 'pointer' },
  toggle: { marginTop: '1rem', background: 'transparent', border: 'none', color: '#555', cursor: 'pointer' },
  details: { textAlign: 'left', marginTop: '1rem', fontSize: '12px', background: '#f1f3f5', padding: '1rem', borderRadius: '6px', overflowX: 'auto' },
  loading: { color: '#6c757d', fontSize: '0.9rem', marginTop: '1rem' },
  errorId: { fontSize: '0.9rem', color: '#495057', marginBottom: '1rem' },
};

export default ErrorBoundary;
