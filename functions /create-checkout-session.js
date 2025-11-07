// netlify/functions/create-checkout-session.js
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
    if (!amount || isNaN(amount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Valid amount is required' })
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { 
            name: 'Ministry Donation',
            description: 'Supporting Heavenly Nature Ministry'
          },
          unit_amount: Math.round(amount * 100), // Ensure integer
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: email || undefined,
      metadata: {
        ...metadata,
        source: 'website-donation'
      },
      success_url: `${process.env.URL}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/donate`,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({ sessionId: session.id })
    };
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Payment processing failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};