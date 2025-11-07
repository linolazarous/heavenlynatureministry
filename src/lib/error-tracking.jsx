/**
 * Comprehensive error tracking and monitoring setup
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { Integrations } from '@sentry/react';

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

    // Log to Sentry
    Sentry.withScope(scope => {
      scope.setExtras(errorInfo);
      Sentry.captureException(error);
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
          {process.env.NODE_ENV === 'development' && (
            <details>
              <summary>Error Details (Development)</summary>
              <pre>{this.state.error?.toString()}</pre>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </details>
          )}
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize error tracking
export const initErrorTracking = () => {
  // Only initialize in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('Error tracking disabled in development');
    return;
  }

  if (!process.env.REACT_APP_SENTRY_DSN) {
    console.warn('Sentry DSN not configured');
    return;
  }

  try {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      integrations: [
        new BrowserTracing({
          tracingOrigins: [
            'localhost',
            'heavenlynatureministry.netlify.app',
            'heavenlynatureministry.com'
          ],
          routingInstrumentation: Sentry.reactRouterV6Instrumentation,
        }),
        new Integrations.Breadcrumbs({
          console: true,
          dom: true,
          fetch: true,
          history: true,
          sentry: true,
          xhr: true,
        })
      ],
      
      // Set traces sample rate
      tracesSampleRate: parseFloat(process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE) || 0.1,
      
      // Set profiles sample rate
      profilesSampleRate: parseFloat(process.env.REACT_APP_SENTRY_PROFILES_SAMPLE_RATE) || 0.1,

      // Environment configuration
      environment: process.env.NODE_ENV,
      release: process.env.REACT_APP_VERSION || '1.0.0',
      
      // Before send callback to filter sensitive data
      beforeSend(event) {
        // Filter out sensitive information
        if (event.request) {
          // Remove sensitive headers
          if (event.request.headers) {
            const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
            sensitiveHeaders.forEach(header => {
              delete event.request.headers[header];
            });
          }

          // Filter URL parameters
          if (event.request.url) {
            event.request.url = event.request.url.replace(
              /(password|token|secret|key)=[^&]+/g, 
              '$1=***'
            );
          }
        }

        // Filter breadcrumbs
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.filter(breadcrumb => {
            // Remove breadcrumbs containing sensitive data
            const sensitiveMessages = ['password', 'token', 'secret'];
            return !sensitiveMessages.some(sensitive => 
              breadcrumb.message?.toLowerCase().includes(sensitive)
            );
          });
        }

        return event;
      },

      // Ignore specific errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Loading chunk',
        'NetworkError',
        /^Canceled$/,
      ],

      // Deny URLs (browser extensions, etc.)
      denyUrls: [
        /extensions\//i,
        /^chrome:\/\//i,
        /^chrome-extension:\/\//i,
      ],
    });

    console.log('Error tracking initialized successfully');
  } catch (error) {
    console.error('Failed to initialize error tracking:', error);
  }
};

// Custom error reporting function
export const reportError = (error, context = {}) => {
  const errorId = Sentry.captureException(error, {
    contexts: {
      custom: context
    }
  });

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error reported:', error, context);
  }

  return errorId;
};

// User feedback component
export const showErrorFeedback = (errorId) => {
  Sentry.showReportDialog({
    eventId: errorId,
    title: 'Sorry for the inconvenience!',
    subtitle: 'Our team has been notified.',
    subtitle2: 'If you\'d like to help, tell us what happened below.',
    labelName: 'Name',
    labelEmail: 'Email',
    labelComments: 'What happened?',
    labelClose: 'Close',
    labelSubmit: 'Submit',
    errorGeneric: 'An unknown error occurred while submitting your report. Please try again.',
    errorFormEntry: 'Some fields were invalid. Please correct the errors and try again.',
    successMessage: 'Your feedback has been sent. Thank you!',
  });
};

// Performance monitoring
export const startTransaction = (name, op = 'navigation') => {
  return Sentry.startTransaction({
    name,
    op,
  });
};

export default {
  initErrorTracking,
  ErrorBoundary,
  reportError,
  showErrorFeedback,
  startTransaction
};