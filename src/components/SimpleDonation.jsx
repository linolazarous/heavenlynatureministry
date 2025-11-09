import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { loadStripe } from '@stripe/stripe-js';
import { 
  FaDonate, 
  FaSpinner, 
  FaLock,
  FaHandHoldingHeart,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import './SimpleDonation.css';

// Constants
const PRESET_AMOUNTS = [25, 50, 100, 250, 500];
const DEFAULT_AMOUNT = 50;
const MIN_DONATION = 5;
const MAX_DONATION = 10000;

// Error messages
const ERROR_MESSAGES = {
  STRIPE_NOT_LOADED: 'Payment system is initializing. Please wait...',
  SESSION_FAILED: 'Failed to create payment session. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_AMOUNT: `Please enter an amount between $${MIN_DONATION} and $${MAX_DONATION}`
};

// Custom hook for donation management
const useDonationManager = () => {
  const [state, setState] = useState({
    amount: DEFAULT_AMOUNT,
    customAmount: '',
    isLoading: false,
    error: null,
    success: false,
    stripe: null,
    isStripeLoading: true
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Initialize Stripe
  useEffect(() => {
    let isMounted = true;

    const initializeStripe = async () => {
      try {
        const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
        
        if (!stripeKey) {
          throw new Error('Stripe publishable key not configured');
        }

        const stripe = await loadStripe(stripeKey);
        if (isMounted) {
          if (stripe) {
            updateState({ stripe, isStripeLoading: false });
          } else {
            updateState({ 
              error: ERROR_MESSAGES.STRIPE_NOT_LOADED,
              isStripeLoading: false 
            });
          }
        }
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
        if (isMounted) {
          updateState({ 
            error: ERROR_MESSAGES.STRIPE_NOT_LOADED,
            isStripeLoading: false 
          });
        }
      }
    };

    initializeStripe();

    return () => {
      isMounted = false;
    };
  }, [updateState]);

  const handleDonation = useCallback(async (amount) => {
    if (!state.stripe) {
      updateState({ error: ERROR_MESSAGES.STRIPE_NOT_LOADED });
      return;
    }

    // Validate amount
    const numericAmount = parseInt(amount);
    if (isNaN(numericAmount) || numericAmount < MIN_DONATION || numericAmount > MAX_DONATION) {
      updateState({ error: ERROR_MESSAGES.INVALID_AMOUNT });
      return;
    }

    updateState({ isLoading: true, error: null, success: false });

    try {
      // Use environment variable for the API endpoint or fallback
      const apiEndpoint = process.env.REACT_APP_DONATION_API || '/.netlify/functions/create-checkout-session';
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: Math.round(numericAmount * 100), // Convert to cents
          currency: 'usd',
          successUrl: `${window.location.origin}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/donate`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const { sessionId, error: sessionError } = await response.json();
      
      if (sessionError) {
        throw new Error(sessionError);
      }

      if (!sessionId) {
        throw new Error(ERROR_MESSAGES.SESSION_FAILED);
      }

      // Redirect to Stripe Checkout
      const { error: stripeError } = await state.stripe.redirectToCheckout({ 
        sessionId 
      });

      if (stripeError) {
        throw stripeError;
      }

    } catch (err) {
      console.error('Donation failed:', err);
      const errorMessage = err.message || ERROR_MESSAGES.SESSION_FAILED;
      updateState({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      updateState({ isLoading: false });
    }
  }, [state.stripe, updateState]);

  return {
    ...state,
    handleDonation,
    updateState
  };
};

const SimpleDonation = ({ 
  title = "Support Our Ministry",
  description = "Your generous gift helps us continue our mission and reach more people with God's word.",
  className = "",
  onDonationStart,
  onDonationSuccess,
  onDonationError,
  showImpactInfo = true
}) => {
  const {
    amount,
    customAmount,
    isLoading,
    error,
    success,
    stripe,
    isStripeLoading,
    handleDonation,
    updateState
  } = useDonationManager();

  // Memoized preset amounts
  const presetButtons = useMemo(() => 
    PRESET_AMOUNTS.map(presetAmount => (
      <button
        key={presetAmount}
        type="button"
        className={`donation-amount-btn ${
          amount === presetAmount && !customAmount ? 'active' : ''
        }`}
        onClick={() => {
          updateState({ 
            amount: presetAmount, 
            customAmount: '',
            error: null 
          });
        }}
        disabled={isLoading || isStripeLoading}
        aria-pressed={amount === presetAmount && !customAmount}
      >
        ${presetAmount}
      </button>
    )), [amount, customAmount, isLoading, isStripeLoading, updateState]
  );

  const handleCustomAmountChange = useCallback((e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
    const numericValue = value === '' ? '' : parseInt(value) || 0;
    
    updateState({ 
      customAmount: value,
      error: null 
    });

    if (numericValue >= MIN_DONATION && numericValue <= MAX_DONATION) {
      updateState({ amount: numericValue });
    }
  }, [updateState]);

  const handleCustomAmountBlur = useCallback(() => {
    if (customAmount) {
      const numericValue = parseInt(customAmount) || 0;
      if (numericValue < MIN_DONATION || numericValue > MAX_DONATION) {
        updateState({ error: ERROR_MESSAGES.INVALID_AMOUNT });
      } else {
        updateState({ amount: numericValue });
      }
    }
  }, [customAmount, updateState]);

  const handleDonateClick = useCallback(async () => {
    const donationAmount = customAmount ? parseInt(customAmount) || 0 : amount;
    
    if (onDonationStart) {
      onDonationStart(donationAmount);
    }

    await handleDonation(donationAmount);
  }, [amount, customAmount, handleDonation, onDonationStart]);

  const currentAmount = customAmount ? parseInt(customAmount) || 0 : amount;
  const isAmountValid = currentAmount >= MIN_DONATION && currentAmount <= MAX_DONATION;
  const isStripeReady = Boolean(stripe) && !isStripeLoading;

  return (
    <div className={`simple-donation ${className}`}>
      <div className="donation-header">
        <div className="header-icon-container">
          <FaHandHoldingHeart className="header-icon" />
        </div>
        <h3 className="donation-title">{title}</h3>
        <p className="donation-description">{description}</p>
      </div>

      <div className="donation-content">
        {/* Preset Amounts */}
        <div className="amount-selection">
          <label className="amount-label">Select Amount (USD)</label>
          <div 
            className="preset-amounts"
            role="group"
            aria-label="Donation amount options"
          >
            {presetButtons}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="custom-amount-section">
          <label htmlFor="custom-amount" className="amount-label">
            Or Enter Custom Amount
          </label>
          <div className="custom-amount-input">
            <span className="currency-symbol">$</span>
            <input
              type="text"
              id="custom-amount"
              value={customAmount ? `$${customAmount}` : ''}
              onChange={handleCustomAmountChange}
              onBlur={handleCustomAmountBlur}
              placeholder={`$${MIN_DONATION}+`}
              disabled={isLoading || isStripeLoading}
              aria-describedby="amount-help"
            />
          </div>
          <div id="amount-help" className="amount-help">
            Amount between ${MIN_DONATION} and ${MAX_DONATION}
          </div>
        </div>

        {/* Selected Amount Display */}
        {(currentAmount > 0 && isAmountValid) && (
          <div className="selected-amount">
            <FaCheckCircle className="amount-check" />
            <span>Donation Amount: <strong>${currentAmount}</strong></span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="donation-error" role="alert">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        {/* Donate Button */}
        <button
          className={`donate-button ${!isAmountValid || !isStripeReady ? 'disabled' : ''}`}
          onClick={handleDonateClick}
          disabled={isLoading || !isAmountValid || !isStripeReady}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <FaSpinner className="spinner" aria-hidden="true" />
              Processing...
            </>
          ) : (
            <>
              <FaLock aria-hidden="true" />
              Donate ${currentAmount}
            </>
          )}
        </button>

        {/* Security Notice */}
        <div className="security-notice">
          <FaLock aria-hidden="true" />
          <span>Secure payment processed by Stripe</span>
        </div>

        {/* Loading State for Stripe */}
        {isStripeLoading && (
          <div className="stripe-loading">
            <FaSpinner className="spinner" aria-hidden="true" />
            <span>Initializing secure payment system...</span>
          </div>
        )}
      </div>

      {/* Additional Info */}
      {showImpactInfo && (
        <div className="donation-info">
          <details className="impact-details">
            <summary className="impact-summary">
              <FaInfoCircle aria-hidden="true" />
              How your donation helps
            </summary>
            <div className="impact-content">
              <ul className="impact-list">
                <li>📚 Supports children's education and feeding programs</li>
                <li>🤝 Funds community outreach and evangelism efforts</li>
                <li>🏛️ Maintains ministry facilities and resources</li>
                <li>💝 Provides pastoral care and counseling services</li>
                <li>🌍 Expands our mission to reach more communities</li>
              </ul>
              <div className="impact-note">
                <em>Every dollar makes a difference in spreading God's love.</em>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

SimpleDonation.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  className: PropTypes.string,
  onDonationStart: PropTypes.func,
  onDonationSuccess: PropTypes.func,
  onDonationError: PropTypes.func,
  showImpactInfo: PropTypes.bool
};

SimpleDonation.defaultProps = {
  title: "Support Our Ministry",
  description: "Your generous gift helps us continue our mission and reach more people with God's word.",
  className: "",
  showImpactInfo: true
};

export default SimpleDonation;
