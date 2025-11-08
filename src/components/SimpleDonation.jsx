import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { loadStripe } from '@stripe/stripe-js';
import { 
  FaDonate, 
  FaSpinner, 
  FaLock,
  FaHandHoldingHeart,
  FaCheckCircle,
  FaExclamationTriangle
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
    stripe: null
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Initialize Stripe
  React.useEffect(() => {
    let isMounted = true;

    const initializeStripe = async () => {
      try {
        const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
        if (isMounted && stripe) {
          updateState({ stripe });
        }
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
        if (isMounted) {
          updateState({ error: ERROR_MESSAGES.STRIPE_NOT_LOADED });
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
    if (amount < MIN_DONATION || amount > MAX_DONATION) {
      updateState({ error: ERROR_MESSAGES.INVALID_AMOUNT });
      return;
    }

    updateState({ isLoading: true, error: null, success: false });

    try {
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          successUrl: `${window.location.origin}/donation-success`,
          cancelUrl: `${window.location.origin}/donate`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
  description = "Your generous gift helps us continue our mission",
  className = "",
  onDonationStart,
  onDonationSuccess,
  onDonationError
}) => {
  const {
    amount,
    customAmount,
    isLoading,
    error,
    success,
    stripe,
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
        disabled={isLoading}
        aria-pressed={amount === presetAmount && !customAmount}
      >
        ${presetAmount}
      </button>
    )), [amount, customAmount, isLoading, updateState]
  );

  const handleCustomAmountChange = useCallback((e) => {
    const value = e.target.value;
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
  const isStripeReady = Boolean(stripe);

  return (
    <div className={`simple-donation ${className}`}>
      <div className="donation-header">
        <h3>
          <FaHandHoldingHeart className="header-icon" />
          {title}
        </h3>
        <p>{description}</p>
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
              type="number"
              id="custom-amount"
              value={customAmount}
              onChange={handleCustomAmountChange}
              onBlur={handleCustomAmountBlur}
              placeholder="Other amount"
              min={MIN_DONATION}
              max={MAX_DONATION}
              step="1"
              disabled={isLoading}
              aria-describedby="amount-help"
            />
          </div>
          <div id="amount-help" className="amount-help">
            Minimum: ${MIN_DONATION} • Maximum: ${MAX_DONATION}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="donation-error" role="alert">
            <FaExclamationTriangle />
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="donation-success" role="status">
            <FaCheckCircle />
            Thank you for your donation!
          </div>
        )}

        {/* Donate Button */}
        <button
          className="donate-button"
          onClick={handleDonateClick}
          disabled={isLoading || !isAmountValid || !isStripeReady}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <FaSpinner className="spinner" />
              Processing...
            </>
          ) : (
            <>
              <FaLock />
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
        {!isStripeReady && !error && (
          <div className="stripe-loading">
            <FaSpinner className="spinner" />
            <span>Initializing payment system...</span>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="donation-info">
        <details>
          <summary>How your donation helps</summary>
          <ul>
            <li>Supports children's education and feeding programs</li>
            <li>Funds community outreach and evangelism</li>
            <li>Maintains ministry facilities and resources</li>
            <li>Provides pastoral care and counseling</li>
          </ul>
        </details>
      </div>
    </div>
  );
};

SimpleDonation.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  className: PropTypes.string,
  onDonationStart: PropTypes.func,
  onDonationSuccess: PropTypes.func,
  onDonationError: PropTypes.func
};

SimpleDonation.defaultProps = {
  title: "Support Our Ministry",
  description: "Your generous gift helps us continue our mission",
  className: ""
};

export default SimpleDonation;
