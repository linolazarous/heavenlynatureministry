// netlify/functions/webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async (event) => {
  // Validate HTTP method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Allow': 'POST' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !endpointSecret) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing signature or webhook secret' })
    };
  }

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` })
    };
  }

  // Initialize FaunaDB client
  const faunaClient = new faunadb.Client({
    secret: process.env.FAUNADB_SECRET,
    domain: 'db.fauna.com',
    scheme: 'https'
  });

  try {
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = stripeEvent.data.object;
        const { id, amount, receipt_email, metadata } = paymentIntent;
        
        // Save to database
        await faunaClient.query(
          q.Create(q.Collection('donations'), {
            data: {
              paymentId: id,
              amount: amount / 100, // Convert to dollars
              email: receipt_email,
              type: 'stripe',
              status: 'completed',
              metadata: metadata || {},
              createdAt: q.Now()
            }
          }
        );

        // Optional: Send confirmation email
        if (receipt_email) {
          const sgMail = require('@sendgrid/mail');
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          
          await sgMail.send({
            to: receipt_email,
            from: process.env.SENDGRID_FROM_EMAIL || 'donations@heavenlynatureministry.org',
            subject: 'Thank you for your donation',
            text: `We've received your donation of $${(amount/100).toFixed(2)}. Thank you for supporting our ministry!`,
            templateId: process.env.SENDGRID_DONATION_TEMPLATE_ID,
            dynamicTemplateData: {
              amount: (amount/100).toFixed(2),
              donation_date: new Date().toLocaleDateString()
            }
          });
        }
        break;

      case 'payment_intent.payment_failed':
        console.warn('Payment failed:', stripeEvent.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (err) {
    console.error('Webhook processing error:', err);
    
    // Important: Return 200 to prevent Stripe from retrying non-actionable errors
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        error: 'Webhook processed with errors',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      })
    };
  }
};