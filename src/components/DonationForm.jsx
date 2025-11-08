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
  FaShieldAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './DonationForm.css';

// Error boundaries and constants
const ERROR_MESSAGES = {
  PAYMENT_FAILED: 'Payment failed. Please try again or use a different payment method.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  INVALID_AMOUNT: 'Please enter a valid donation amount ($5 minimum).',
  STRIPE_NOT_LOADED: 'Payment system is initializing. Please wait...',
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

// Payment intent hook
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
        const response = await fetch('/.netlify/functions/create-payment-intent', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            metadata: {
              donationType,
              name: name.trim(),
              email: email.trim().toLowerCase(),
              timestamp: new Date().toISOString(),
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
          setError(ERROR_MESSAGES.NETWORK_ERROR);
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
            address: {
              country: 'US', // Default, can be made dynamic
            },
          },
        },
        receipt_email: email.trim().toLowerCase(),
      });

      if (stripeError) {
        throw stripeError;
      }

      if (paymentIntent.status === 'succeeded') {
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
        toast.success(`Thank you for your $${amount} donation!`);
        
        if (onSuccess) {
          onSuccess(paymentIntent, { amount, donationType, name, email });
        } else {
          navigate('/donation-success', {
            state: {
              amount,
              donationType,
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
        <h2>
          <FaDonate /> Support Our Ministry
        </h2>
        <p>Your generous gift helps us continue our mission in South Sudan</p>
      </div>

      <form onSubmit={handleSubmit} className="donation-form" noValidate>
        {/* Donation Type */}
        <div className="form-group">
          <label htmlFor="donation-type">Donation Type</label>
          <div className="donation-type-toggle" role="group" aria-labelledby="donation-type">
            <button
              type="button"
              id="one-time"
              className={donationType === 'one-time' ? 'active' : ''}
              onClick={() => updateState({ donationType: 'one-time', error: null })}
            >
              One-Time
            </button>
            <button
              type="button"
              id="monthly"
              className={donationType === 'monthly' ? 'active' : ''}
              onClick={() => updateState({ donationType: 'monthly', error: null })}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Amount Selection */}
        <div className="form-group">
          <label htmlFor="donation-amount">Donation Amount (USD)</label>
          <div className="amount-buttons" role="group" aria-labelledby="donation-amount">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                type="button"
                key={amt}
                className={amount === amt ? 'active' : ''}
                onClick={() => handlePresetAmount(amt)}
                aria-pressed={amount === amt}
              >
                ${amt}
              </button>
            ))}
          </div>
          <div className="custom-amount">
            <span>$</span>
            <input
              type="number"
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
          <label htmlFor="donor-name">Full Name *</label>
          <input
            id="donor-name"
            type="text"
            value={name}
            onChange={(e) => updateState({ name: e.target.value, error: null })}
            required
            aria-required="true"
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="donor-email">Email Address *</label>
          <input
            id="donor-email"
            type="email"
            value={email}
            onChange={(e) => updateState({ email: e.target.value, error: null })}
            required
            aria-required="true"
            placeholder="Enter your email address"
          />
        </div>

        {/* Payment Details */}
        <div className="form-group">
          <label htmlFor="card-element">Payment Details *</label>
          <div className="card-element-container">
            <CardElement
              id="card-element"
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    fontFamily: '"Poppins", sans-serif',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                    padding: '10px 12px',
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
            <FaExclamationTriangle />
            {error}
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
          <FaShieldAlt aria-hidden="true" />
          <div>
            <strong>Secure & Encrypted Payment</strong>
            <span>Processed by Stripe • PCI DSS compliant</span>
          </div>
        </div>

        {/* Loading state for payment intent */}
        {intentLoading && (
          <div className="loading-overlay">
            <FaSpinner className="spinner" />
            Preparing payment...
          </div>
        )}
      </form>
    </div>
  );
};

// Main DonationForm component with error boundary
const DonationForm = ({ onSuccess }) => {
  if (!stripePromise) {
    return (
      <div className="donation-form-container error">
        <div className="error-message">
          <FaExclamationTriangle />
          Payment system is temporarily unavailable. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm onSuccess={onSuccess} />
    </Elements>
  );
};

DonationForm.propTypes = {
  onSuccess: PropTypes.func,
};

CheckoutForm.propTypes = {
  onSuccess: PropTypes.func,
};

export default DonationForm;
