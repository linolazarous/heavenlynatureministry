// functions/auth.js
const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async (event, context) => {
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

  const client = new faunadb.Client({
    secret: process.env.FAUNA_SECRET,
    domain: 'db.fauna.com',
    scheme: 'https',
  });

  try {
    const { email } = JSON.parse(event.body);
    
    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Valid email is required' })
      };
    }

    const result = await client.query(
      q.Get(q.Match(q.Index('users_by_email'), email))
    );
    
    // Don't expose sensitive data
    const userData = {
      id: result.ref.id,
      email: result.data.email,
      role: result.data.role || 'user'
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(userData)
    };
  } catch (error) {
    console.error('Auth error:', error);
    
    // Don't expose database errors to client
    const errorMessage = error.message.includes('instance not found') 
      ? 'User not found' 
      : 'Authentication failed';

    return {
      statusCode: error.requestResult?.statusCode || 400,
      body: JSON.stringify({ error: errorMessage })
    };
  }
};