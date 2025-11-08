/**
 * Stripe payment configuration with enhanced security and error handling
 */

// Use environment variables for sensitive data
const STRIPE_CONFIG = {
  secretKey: process.env.REACT_APP_STRIPE_SECRET_KEY,
  publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  currency: 'usd',
  products: {
    LIVESTREAM_ACCESS: {
      name: 'Livestream Event Access',
      amount: 1000, // $10.00 in cents
      description: 'Access to exclusive livestream events and content'
    },
    DONATION: {
      name: 'Ministry Donation',
      amount: null, // Custom amount
      description: 'Support our ministry and mission'
    }
  }
};

const stripe = require('stripe')(STRIPE_CONFIG.secretKey);

// Validate environment configuration
const validateConfig = () => {
  const requiredEnvVars = ['REACT_APP_STRIPE_SECRET_KEY', 'REACT_APP_STRIPE_PUBLISHABLE_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Enhanced error handling class
class PaymentError extends Error {
  constructor(message, code, userMessage) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
    this.userMessage = userMessage || 'An error occurred during payment processing';
  }
}

// Create checkout session with enhanced options
const createCheckoutSession = async (productType, options = {}) => {
  try {
    validateConfig();

    const product = STRIPE_CONFIG.products[productType];
    if (!product) {
      throw new PaymentError('Invalid product type', 'INVALID_PRODUCT');
    }

    const {
      successUrl = `${process.env.REACT_APP_DOMAIN}/payment/success`,
      cancelUrl = `${process.env.REACT_APP_DOMAIN}/payment/cancel`,
      customerEmail = null,
      metadata = {},
      quantity = 1
    } = options;

    const sessionConfig = {
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        product_type: productType,
        timestamp: new Date().toISOString(),
        ...metadata
      },
      line_items: [{
        price_data: {
          currency: STRIPE_CONFIG.currency,
          product_data: {
            name: product.name,
            description: product.description,
            images: options.images || []
          },
          unit_amount: options.amount || product.amount,
        },
        quantity: quantity,
      }],
      // Additional security and UX features
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      custom_text: {
        submit: {
          message: 'You will be redirected to complete your payment securely'
        }
      }
    };

    // Remove shipping for digital products
    if (productType === 'LIVESTREAM_ACCESS') {
      delete sessionConfig.shipping_address_collection;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Log successful session creation (without sensitive data)
    console.log(`Checkout session created: ${session.id} for product: ${productType}`);

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Enhanced error mapping
    let paymentError;
    switch (error.type) {
      case 'StripeCardError':
        paymentError = new PaymentError(
          error.message,
          'CARD_ERROR',
          'Your card was declined. Please try another payment method.'
        );
        break;
      case 'StripeRateLimitError':
        paymentError = new PaymentError(
          error.message,
          'RATE_LIMIT',
          'Too many requests. Please try again in a moment.'
        );
        break;
      case 'StripeInvalidRequestError':
        paymentError = new PaymentError(
          error.message,
          'INVALID_REQUEST',
          'Invalid payment request. Please check your information.'
        );
        break;
      case 'StripeAPIError':
        paymentError = new PaymentError(
          error.message,
          'API_ERROR',
          'Payment service temporarily unavailable. Please try again.'
        );
        break;
      case 'StripeConnectionError':
        paymentError = new PaymentError(
          error.message,
          'CONNECTION_ERROR',
          'Network connection issue. Please check your connection.'
        );
        break;
      case 'StripeAuthenticationError':
        paymentError = new PaymentError(
          error.message,
          'AUTH_ERROR',
          'Payment authentication failed. Please contact support.'
        );
        break;
      default:
        paymentError = new PaymentError(
          error.message,
          'UNKNOWN_ERROR',
          'An unexpected error occurred. Please try again.'
        );
    }

    throw paymentError;
  }
};

// Netlify function handler with enhanced security
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': process.env.REACT_APP_DOMAIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        error: 'Method Not Allowed',
        message: 'Only POST requests are supported'
      })
    };
  }

  try {
    // Validate request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Request body is required'
        })
      };
    }

    const { productType, ...options } = JSON.parse(event.body);

    if (!productType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Product type is required'
        })
      };
    }

    const session = await createCheckoutSession(productType, options);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        id: session.id,
        publishableKey: STRIPE_CONFIG.publishableKey
      })
    };

  } catch (error) {
    console.error('Payment handler error:', error);

    // Don't expose internal error details in production
    const isProduction = process.env.NODE_ENV === 'production';
    const userMessage = isProduction ? error.userMessage : error.message;

    return {
      statusCode: error.code === 'INVALID_PRODUCT' ? 400 : 500,
      headers,
      body: JSON.stringify({
        error: error.code || 'INTERNAL_ERROR',
        message: userMessage,
        ...(isProduction ? {} : { debug: error.message })
      })
    };
  }
};

export {
  STRIPE_CONFIG,
  createCheckoutSession,
  PaymentError
};
