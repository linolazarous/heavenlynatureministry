import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaRedo,
  FaTimes,
  FaCopy,
  FaExpand
} from 'react-icons/fa';
import '../css/ErrorMessage.css';

// Error severity types and configurations
const SEVERITY_CONFIG = {
  error: {
    icon: FaExclamationCircle,
    className: 'error',
    ariaRole: 'alert',
    defaultTitle: 'Error',
  },
  warning: {
    icon: FaExclamationTriangle,
    className: 'warning',
    ariaRole: 'alert',
    defaultTitle: 'Warning',
  },
  info: {
    icon: FaInfoCircle,
    className: 'info',
    ariaRole: 'status',
    defaultTitle: 'Information',
  },
  success: {
    icon: FaCheckCircle,
    className: 'success',
    ariaRole: 'status',
    defaultTitle: 'Success',
  },
};

// Custom hook for error message actions
const useErrorMessage = (onRetry, onDismiss) => {
  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry();
    }
  }, [onRetry]);

  const handleDismiss = useCallback(() => {
    if (onDismiss) {
      onDismiss();
    }
  }, [onDismiss]);

  const handleCopyError = useCallback(async (message) => {
    try {
      await navigator.clipboard.writeText(
        typeof message === 'string' ? message : JSON.stringify(message, null, 2)
      );
      // You could show a toast here: toast.success('Error details copied to clipboard');
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  }, []);

  return {
    handleRetry,
    handleDismiss,
    handleCopyError,
  };
};

const ErrorMessage = ({
  message,
  onRetry,
  onDismiss,
  severity = 'error',
  className = '',
  retryText = 'Try Again',
  dismissText = 'Dismiss',
  showIcon = true,
  showExpand = false,
  isExpanded = false,
  onExpand,
  title,
  autoDismiss = false,
  dismissAfter = 5000,
  showCopyButton = false,
  ...props
}) => {
  const {
    handleRetry,
    handleDismiss,
    handleCopyError,
  } = useErrorMessage(onRetry, onDismiss);

  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.error;
  const IconComponent = config.icon;

  // Auto-dismiss effect
  React.useEffect(() => {
    if (autoDismiss && onDismiss && severity !== 'error') {
      const timer = setTimeout(handleDismiss, dismissAfter);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss, severity, dismissAfter, handleDismiss]);

  // Render message content
  const renderMessage = () => {
    if (typeof message === 'string') {
      return <p>{message}</p>;
    }
    
    if (React.isValidElement(message)) {
      return message;
    }
    
    if (typeof message === 'object') {
      return (
        <pre className="error-object">
          {JSON.stringify(message, null, 2)}
        </pre>
      );
    }
    
    return <div className="message-body">{message}</div>;
  };

  return (
    <div
      className={`error-message ${config.className} ${className} ${
        isExpanded ? 'expanded' : ''
      }`}
      role={config.ariaRole}
      aria-live={severity === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      {...props}
    >
      <div className="message-header">
        {showIcon && (
          <div className="icon-container" aria-hidden="true">
            <IconComponent className="icon" />
          </div>
        )}
        
        <div className="text-content">
          <h4 className="message-title">
            {title || config.defaultTitle}
          </h4>
          {renderMessage()}
        </div>

        {/* Action buttons */}
        <div className="action-buttons">
          {showCopyButton && (
            <button
              onClick={() => handleCopyError(message)}
              className="action-button copy-button"
              aria-label="Copy error details"
              title="Copy error details"
            >
              <FaCopy className="button-icon" />
            </button>
          )}
          
          {showExpand && onExpand && (
            <button
              onClick={onExpand}
              className="action-button expand-button"
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <FaExpand className="button-icon" />
            </button>
          )}
          
          {onRetry && (
            <button
              onClick={handleRetry}
              className="action-button retry-button"
              aria-label={retryText}
            >
              <FaRedo className="button-icon" />
              {retryText}
            </button>
          )}
          
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className="action-button dismiss-button"
              aria-label={dismissText}
            >
              <FaTimes className="button-icon" />
              {dismissText}
            </button>
          )}
        </div>
      </div>

      {/* Expanded content for objects */}
      {isExpanded && typeof message === 'object' && !React.isValidElement(message) && (
        <div className="expanded-content">
          <pre className="error-details">
            {JSON.stringify(message, null, 2)}
          </pre>
        </div>
      )}

      {/* Auto-dismiss progress bar */}
      {autoDismiss && onDismiss && severity !== 'error' && (
        <div className="auto-dismiss-progress">
          <div 
            className="progress-bar" 
            style={{ 
              animationDuration: `${dismissAfter}ms` 
            }} 
          />
        </div>
      )}
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
    PropTypes.object,
  ]).isRequired,
  onRetry: PropTypes.func,
  onDismiss: PropTypes.func,
  severity: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
  className: PropTypes.string,
  retryText: PropTypes.string,
  dismissText: PropTypes.string,
  showIcon: PropTypes.bool,
  showExpand: PropTypes.bool,
  isExpanded: PropTypes.bool,
  onExpand: PropTypes.func,
  title: PropTypes.string,
  autoDismiss: PropTypes.bool,
  dismissAfter: PropTypes.number,
  showCopyButton: PropTypes.bool,
};

ErrorMessage.defaultProps = {
  dismissAfter: 5000,
  showCopyButton: process.env.NODE_ENV === 'development',
};

export default ErrorMessage;
