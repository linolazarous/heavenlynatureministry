import React, { useState, useEffect } from 'react';
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
import { toast } from 'react-toastify';
import '../css/EmailVerification.css';

// Constants
const RESEND_COOLDOWN = 60; // seconds

const EmailVerification = ({ user, onVerified, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [lastSent, setLastSent] = useState(null);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Simulate sending email (mock)
  const handleResend = () => {
    if (countdown > 0 || isLoading) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      setCountdown(RESEND_COOLDOWN);
      const now = new Date().toISOString();
      setLastSent(now);
      toast.success('Verification email sent successfully!');
    }, 1500);
  };

  if (user.emailVerified) {
    return (
      <div className={`email-verification verified ${className}`} role="status">
        <div className="verification-header">
          <h3>
            <FaCheckCircle className="icon verified-icon" />
            Email Verified
          </h3>
        </div>
        <div className="verification-body">
          <p className="verification-message">
            Your email <strong>{user.email}</strong> has been successfully verified!
          </p>
          <div className="verification-badge">
            <FaCheckCircle /> Verified Account
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`email-verification unverified ${className}`} role="alert">
      <div className="verification-header">
        <h3>
          <FaTimesCircle className="icon unverified-icon" />
          Email Verification Required
        </h3>
      </div>

      <div className="verification-body">
        <p className="verification-message">
          Please verify your email <strong>{user.email}</strong> to access all features.
        </p>

        {lastSent && (
          <div className="last-sent-info">
            <FaClock /> Last sent: {new Date(lastSent).toLocaleTimeString()}
          </div>
        )}

        <div className="verification-actions">
          <button
            onClick={handleResend}
            disabled={isLoading || countdown > 0}
            className={`resend-button ${countdown > 0 ? 'cooldown' : ''}`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="icon-spin" /> Sending...
              </>
            ) : (
              <>
                <FaPaperPlane /> {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification Email'}
              </>
            )}
          </button>
        </div>

        <div className="verification-help">
          <h4><FaEnvelope /> Didn't receive the email?</h4>
          <ul>
            <li>Check your spam or junk folder</li>
            <li>Ensure your email address is correct</li>
            <li>Wait a few minutes - emails may be delayed</li>
            <li>Add us to your contacts to prevent filtering</li>
          </ul>
        </div>

        {error && (
          <div className="verification-error" role="alert">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {success && (
          <div className="verification-success" role="status">
            <p>
              <strong>Verification email sent!</strong> Please check your inbox at <strong>{user.email}</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

EmailVerification.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string.isRequired,
    emailVerified: PropTypes.bool.isRequired,
  }).isRequired,
  onVerified: PropTypes.func,
  className: PropTypes.string,
};

EmailVerification.defaultProps = {
  onVerified: null,
  className: '',
};

export default EmailVerification;
