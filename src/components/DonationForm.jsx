import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { 
  FaLock, 
  FaDonate, 
  FaSpinner, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaHandHoldingHeart
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../css/DonationForm.css';

// Error boundaries and constants
const ERROR_MESSAGES = {
  PAYMENT_FAILED: 'Payment failed. Please try again or use a different payment method.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  INVALID_AMOUNT: 'Please enter a valid donation amount ($5 minimum).',
  STRIPE_NOT_LOADED: 'Payment system is initializing. Please wait...',
  SERVER_ERROR: 'Server error. Please try again later.',
};

const PRESET_AMOUNTS = [25, 50, 100, 250, 500];
const MIN_DONATION_AMOUNT = 5;
const MAX_DONATION_AMOUNT = 10000;

// Initialize Stripe with error handling
let stripePromise;
try {
  stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY, {
    locale: 'en',
  });
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
}

// Custom hook for donation form state
const useDonationForm = () => {
  const [state, setState] = useState({
    amount: 25,
    donationType: 'one-time',
    name: '',
    email: '',
    message: '',
    isLoading: false,
    error: null,
    clientSecret: null,
    isProcessing: false,
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  return { ...state, updateState };
};

// Payment intent hook for Render deployment
const usePaymentIntent = (amount, donationType, name, email) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const createPaymentIntent = async () => {
      if (amount < MIN_DONATION_AMOUNT) {
        setClientSecret(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Updated for Render deployment - use your backend API endpoint
        const apiUrl = process.env.REACT_APP_API_URL || '/api';
        const response = await fetch(`${apiUrl}/donations/create-payment-intent`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            donationType,
            donorName: name.trim(),
            donorEmail: email.trim().toLowerCase(),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (isMounted && data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        console.error('Payment intent creation failed:', err);
        if (isMounted) {
          setError(err.message || ERROR_MESSAGES.SERVER_ERROR);
          setClientSecret(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Debounce payment intent creation
    const timeoutId = setTimeout(createPaymentIntent, 500);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [amount, donationType, name, email]);

  return { clientSecret, loading, error };
};

const CheckoutForm = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  const {
    amount,
    donationType,
    name,
    email,
    message,
    isLoading,
    error,
    updateState,
  } = useDonationForm();

  const { clientSecret, loading: intentLoading } = usePaymentIntent(
    amount, 
    donationType, 
    name, 
    email
  );

  // Validation
  const validateForm = useCallback(() => {
    if (!name.trim()) {
      return 'Please enter your full name';
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return 'Please enter a valid email address';
    }
    if (amount < MIN_DONATION_AMOUNT || amount > MAX_DONATION_AMOUNT) {
      return ERROR_MESSAGES.INVALID_AMOUNT;
    }
    if (!stripe || !elements) {
      return ERROR_MESSAGES.STRIPE_NOT_LOADED;
    }
    return null;
  }, [name, email, amount, stripe, elements]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      updateState({ error: validationError });
      toast.error(validationError);
      return;
    }

    updateState({ isLoading: true, error: null });

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
          },
        },
        receipt_email: email.trim().toLowerCase(),
      });

      if (stripeError) {
        throw stripeError;
      }

      if (paymentIntent.status === 'succeeded') {
        // Record donation in your database
        try {
          const apiUrl = process.env.REACT_APP_API_URL || '/api';
          await fetch(`${apiUrl}/donations/record`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              amount,
              donationType,
              donorName: name.trim(),
              donorEmail: email.trim().toLowerCase(),
              message: message.trim(),
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (dbError) {
          console.error('Failed to record donation:', dbError);
          // Don't fail the payment if recording fails
        }

        // Analytics tracking
        if (window.gtag) {
          window.gtag('event', 'donation', {
            event_category: 'donation',
            event_label: donationType,
            value: amount,
            currency: 'USD',
            transaction_id: paymentIntent.id,
          });
        }

        // Success handling
        toast.success(`Thank you for your $${amount} donation! God bless you!`);
        
        if (onSuccess) {
          onSuccess(paymentIntent, { amount, donationType, name, email, message });
        } else {
          navigate('/donation-success', {
            state: {
              amount,
              donationType,
              donorName: name,
              donorEmail: email,
              receiptUrl: paymentIntent.receipt_url,
              transactionId: paymentIntent.id,
              timestamp: new Date().toISOString(),
            },
            replace: true,
          });
        }
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      const errorMessage = err.message?.includes('card_declined') 
        ? 'Your card was declined. Please try a different card.'
        : err.message || ERROR_MESSAGES.PAYMENT_FAILED;
      
      updateState({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      updateState({ isLoading: false });
    }
  };

  const handleAmountChange = useCallback((newAmount) => {
    const validAmount = Math.max(MIN_DONATION_AMOUNT, Math.min(MAX_DONATION_AMOUNT, newAmount));
    updateState({ amount: validAmount, error: null });
  }, [updateState]);

  const handlePresetAmount = useCallback((presetAmount) => {
    handleAmountChange(presetAmount);
  }, [handleAmountChange]);

  const isSubmitDisabled = !stripe || isLoading || intentLoading || !clientSecret;

  return (
    <div className="donation-form-container">
      <div className="donation-header">
        <div className="header-icon">
          <FaHandHoldingHeart />
        </div>
        <h2>Support Heavenly Nature Ministry</h2>
        <p>Your generous gift helps spread God's word and support our mission in South Sudan</p>
      </div>

      <form onSubmit={handleSubmit} className="donation-form" noValidate>
        {/* Donation Type */}
        <div className="form-group">
          <label htmlFor="donation-type" className="form-label">Donation Type</label>
          <div className="donation-type-toggle" role="group" aria-labelledby="donation-type">
            <button
              type="button"
              className={`type-option ${donationType === 'one-time' ? 'active' : ''}`}
              onClick={() => updateState({ donationType: 'one-time', error: null })}
            >
              One-Time Gift
            </button>
            <button
              type="button"
              className={`type-option ${donationType === 'monthly' ? 'active' : ''}`}
              onClick={() => updateState({ donationType: 'monthly', error: null })}
            >
              Monthly Support
            </button>
          </div>
        </div>

        {/* Amount Selection */}
        <div className="form-group">
          <label htmlFor="donation-amount" className="form-label">Donation Amount (USD)</label>
          <div className="amount-buttons" role="group" aria-labelledby="donation-amount">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                type="button"
                key={amt}
                className={`amount-option ${amount === amt ? 'active' : ''}`}
                onClick={() => handlePresetAmount(amt)}
                aria-pressed={amount === amt}
              >
                ${amt}
              </button>
            ))}
          </div>
          <div className="custom-amount">
            <span className="currency-symbol">$</span>
            <input
              type="number"
              id="custom-amount-input"
              min={MIN_DONATION_AMOUNT}
              max={MAX_DONATION_AMOUNT}
              step="1"
              value={amount}
              onChange={(e) => handleAmountChange(parseInt(e.target.value) || MIN_DONATION_AMOUNT)}
              onBlur={(e) => {
                const value = parseInt(e.target.value) || MIN_DONATION_AMOUNT;
                handleAmountChange(value);
              }}
              placeholder="Other amount"
              aria-label="Custom donation amount"
            />
          </div>
          <div className="amount-info">
            Minimum donation: ${MIN_DONATION_AMOUNT}
          </div>
        </div>

        {/* Personal Information */}
        <div className="form-group">
          <label htmlFor="donor-name" className="form-label">Full Name *</label>
          <input
            id="donor-name"
            type="text"
            value={name}
            onChange={(e) => updateState({ name: e.target.value, error: null })}
            required
            aria-required="true"
            placeholder="Enter your full name"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="donor-email" className="form-label">Email Address *</label>
          <input
            id="donor-email"
            type="email"
            value={email}
            onChange={(e) => updateState({ email: e.target.value, error: null })}
            required
            aria-required="true"
            placeholder="Enter your email address"
            className="form-input"
          />
        </div>

        {/* Optional Message */}
        <div className="form-group">
          <label htmlFor="donor-message" className="form-label">
            Optional Message or Prayer Request
          </label>
          <textarea
            id="donor-message"
            value={message}
            onChange={(e) => updateState({ message: e.target.value })}
            placeholder="Share a message or prayer request with us..."
            rows="3"
            className="form-textarea"
          />
        </div>

        {/* Payment Details */}
        <div className="form-group">
          <label htmlFor="card-element" className="form-label">Payment Details *</label>
          <div className="card-element-container">
            <CardElement
              id="card-element"
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                    padding: '12px 14px',
                  },
                  invalid: {
                    color: '#e74c3c',
                    iconColor: '#e74c3c',
                  },
                },
                hidePostalCode: true,
              }}
              onChange={(event) => {
                if (event.error) {
                  updateState({ error: event.error.message });
                } else {
                  updateState({ error: null });
                }
              }}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message" role="alert">
            <FaExclamationTriangle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className={`submit-button ${isSubmitDisabled ? 'disabled' : ''}`}
          disabled={isSubmitDisabled}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <FaSpinner className="spinner" aria-hidden="true" />
              Processing Donation...
            </>
          ) : (
            <>
              <FaLock aria-hidden="true" />
              Donate ${amount} {donationType === 'monthly' ? '/month' : ''}
            </>
          )}
        </button>

        {/* Security Notice */}
        <div className="security-notice">
          <div className="security-content">
            <FaShieldAlt className="security-icon" aria-hidden="true" />
            <div className="security-text">
              <strong>Secure & Encrypted Payment</strong>
              <span>Your donation is safe and secure. Processed by Stripe.</span>
            </div>
          </div>
        </div>

        {/* Loading state for payment intent */}
        {intentLoading && (
          <div className="loading-overlay">
            <FaSpinner className="spinner" aria-hidden="true" />
            <span>Preparing secure payment...</span>
          </div>
        )}
      </form>
    </div>
  );
};

// Main DonationForm component
const DonationForm = ({ onSuccess, className = '' }) => {
  if (!stripePromise) {
    return (
      <div className={`donation-form-container error ${className}`}>
        <div className="error-message">
          <FaExclamationTriangle className="error-icon" />
          <div>
            <strong>Payment system is temporarily unavailable</strong>
            <span>Please try again later or contact support.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`donation-form-wrapper ${className}`}>
      <Elements stripe={stripePromise}>
        <CheckoutForm onSuccess={onSuccess} />
      </Elements>
    </div>
  );
};

DonationForm.propTypes = {
  onSuccess: PropTypes.func,
  className: PropTypes.string,
};

CheckoutForm.propTypes = {
  onSuccess: PropTypes.func,
};

DonationForm.defaultProps = {
  className: '',
};

export default DonationForm;
