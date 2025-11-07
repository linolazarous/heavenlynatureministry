// netlify/functions/donation.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Validate HTTP method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Validate content type
  if (!event.headers['content-type']?.includes('application/json')) {
    return {
      statusCode: 415,
      body: JSON.stringify({ error: 'Unsupported Media Type' })
    };
  }

  try {
    const { amount, email, metadata = {} } = JSON.parse(event.body);
    
    // Validate input
    if (!amount || isNaN(amount) || amount < 1) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Valid amount is required (minimum $1)' })
      };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      receipt_email: email || undefined,
      metadata: {
        ...metadata,
        source: 'website-donation'
      },
      description: 'Donation to Heavenly Nature Ministry'
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      })
    };
  } catch (error) {
    console.error('Stripe Payment Error:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ 
        error: 'Payment processing failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};