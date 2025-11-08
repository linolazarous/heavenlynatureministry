import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaPaperPlane,
  FaSpinner,
  FaExclamationTriangle,
  FaEnvelope,
  FaClock
} from 'react-icons/fa';
import { sendVerificationEmail, checkVerificationStatus } from '../../services/userService';
import useInterval from '../../hooks/useInterval';
import { toast } from 'react-toastify';
import './EmailVerification.css';

// Constants
const VERIFICATION_CHECK_INTERVAL = 30000; // 30 seconds
const RESEND_COOLDOWN = 60; // 60 seconds
const MAX_RETRY_ATTEMPTS = 3;

// Error messages
const ERROR_MESSAGES = {
  SEND_FAILED: 'Failed to send verification email. Please try again.',
  CHECK_FAILED: 'Unable to check verification status.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
};

const SUCCESS_MESSAGES = {
  EMAIL_SENT: 'Verification email sent successfully!',
  VERIFIED: 'Email verified successfully!',
};

// Custom hook for verification state
const useVerificationState = (user, onVerified) => {
  const [state, setState] = useState({
    isLoading: false,
    error: null,
    success: false,
    countdown: 0,
    isChecking: false,
    retryCount: 0,
    lastSent: null,
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  return { ...state, updateState };
};

const EmailVerification = ({ user, onVerified }) => {
  const {
    isLoading,
    error,
    success,
    countdown,
    isChecking,
    retryCount,
    lastSent,
    updateState,
  } = useVerificationState(user, onVerified);

  // Check verification status with retry logic
  const checkVerification = useCallback(async () => {
    if (user.emailVerified || isChecking) return;

    updateState({ isChecking: true });

    try {
      const updatedUser = await checkVerificationStatus(user.id);
      
      if (updatedUser.emailVerified) {
        if (onVerified) {
          onVerified(updatedUser);
        }
        toast.success(SUCCESS_MESSAGES.VERIFIED);
      }
    } catch (err) {
      console.error('Verification check failed:', err);
      
      // Only show error after multiple failures
      if (retryCount >= MAX_RETRY_ATTEMPTS - 1) {
        updateState({ 
          error: ERROR_MESSAGES.CHECK_FAILED,
          retryCount: 0,
        });
      } else {
        updateState(prev => ({ 
          ...prev, 
          retryCount: prev.retryCount + 1 
        }));
      }
    } finally {
      updateState({ isChecking: false });
    }
  }, [user.id, user.emailVerified, isChecking, retryCount, onVerified, updateState]);

  // Periodic verification check
  useInterval(() => {
    if (!user.emailVerified && !isChecking) {
      checkVerification();
    }
  }, VERIFICATION_CHECK_INTERVAL);

  // Handle resend verification email
  const handleResend = useCallback(async () => {
    if (countdown > 0 || isLoading) return;

    updateState({ 
      isLoading: true, 
      error: null, 
      success: false,
      retryCount: 0,
    });

    try {
      await sendVerificationEmail(user.id);
      
      updateState({ 
        success: true,
        countdown: RESEND_COOLDOWN,
        lastSent: new Date().toISOString(),
      });
      
      toast.success(SUCCESS_MESSAGES.EMAIL_SENT);
    } catch (err) {
      console.error('Failed to send verification email:', err);
      
      const errorMessage = err.response?.data?.message || ERROR_MESSAGES.SEND_FAILED;
      updateState({ error: errorMessage });
      
      toast.error(errorMessage);
    } finally {
      updateState({ isLoading: false });
    }
  }, [countdown, isLoading, user.id, updateState]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      updateState(prev => ({ 
        ...prev, 
        countdown: prev.countdown - 1 
      }));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, updateState]);

  // Auto-check verification when component mounts
  useEffect(() => {
    if (!user.emailVerified) {
      const timeoutId = setTimeout(checkVerification, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [user.emailVerified, checkVerification]);

  if (user.emailVerified) {
    return (
      <div className="email-verification verified" role="status">
        <div className="verification-header">
          <h3>
            <FaCheckCircle className="icon verified-icon" aria-hidden="true" />
            Email Verified
          </h3>
        </div>
        <div className="verification-body">
          <p className="verification-message">
            Your email address <strong>{user.email}</strong> has been successfully verified.
            Thank you for completing this important step!
          </p>
          <div className="verification-badge">
            <FaCheckCircle />
            Verified Account
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="email-verification unverified" role="alert">
      <div className="verification-header">
        <h3>
          <FaTimesCircle className="icon unverified-icon" aria-hidden="true" />
          Email Verification Required
        </h3>
      </div>
      
      <div className="verification-body">
        <p className="verification-message">
          Please verify your email address <strong>{user.email}</strong> to access all features 
          and ensure you receive important notifications.
        </p>

        {/* Last sent info */}
        {lastSent && (
          <div className="last-sent-info">
            <FaClock aria-hidden="true" />
            Last sent: {new Date(lastSent).toLocaleTimeString()}
          </div>
        )}

        {/* Action buttons */}
        <div className="verification-actions">
          <button
            onClick={handleResend}
            disabled={isLoading || countdown > 0}
            className={`resend-button ${countdown > 0 ? 'cooldown' : ''}`}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner className="icon-spin" aria-hidden="true" />
                Sending...
              </>
            ) : (
              <>
                <FaPaperPlane aria-hidden="true" />
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification Email'}
              </>
            )}
          </button>
        </div>

        {/* Help information */}
        <div className="verification-help">
          <h4>
            <FaEnvelope aria-hidden="true" />
            Didn't receive the email?
          </h4>
          <ul>
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email address</li>
            <li>Wait a few minutes - emails may be delayed</li>
            <li>Add us to your contacts to prevent filtering</li>
            <li>Contact support if you continue having issues</li>
          </ul>
        </div>

        {/* Auto-check status */}
        {isChecking && (
          <div className="checking-status">
            <FaSpinner className="icon-spin" aria-hidden="true" />
            Checking verification status...
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="verification-error" role="alert">
          <FaExclamationTriangle aria-hidden="true" />
          {error}
          {retryCount > 0 && (
            <span className="retry-count">(Retry {retryCount}/{MAX_RETRY_ATTEMPTS})</span>
          )}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="verification-success" role="status">
          <p>
            <strong>Verification email sent!</strong> Please check your inbox at <strong>{user.email}</strong>.
          </p>
          <p>
            The verification link will expire in 24 hours for security reasons.
          </p>
        </div>
      )}
    </div>
  );
};

EmailVerification.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    emailVerified: PropTypes.bool.isRequired,
  }).isRequired,
  onVerified: PropTypes.func,
};

export default EmailVerification;
