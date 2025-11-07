// netlify/functions/user-profile.js
const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async (event, context) => {
  // Validate HTTP method
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Allow': 'GET' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Validate authentication
  if (!context.clientContext || !context.clientContext.user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SECRET,
    domain: 'db.fauna.com',
    scheme: 'https',
    timeout: 5000 // 5 second timeout
  });

  try {
    const { id } = event.queryStringParameters;
    
    // Validate input
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User ID is required' })
      };
    }

    // Verify the requesting user matches the requested profile
    const authUser = context.clientContext.user;
    if (authUser.sub !== id) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Forbidden' })
      };
    }

    const result = await client.query(
      q.Get(q.Ref(q.Collection('users'), id))
    );

    // Sanitize response - don't expose sensitive data
    const userData = {
      id: result.ref.id,
      email: result.data.email,
      name: result.data.name || '',
      role: result.data.role || 'user',
      createdAt: result.data.createdAt || result.ts / 1000
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-cache, max-age=0'
      },
      body: JSON.stringify(userData)
    };
  } catch (error) {
    console.error('FaunaDB Error:', error);
    
    // Don't expose database errors to client
    const errorMessage = error.message.includes('instance not found') 
      ? 'User not found' 
      : 'Error fetching profile';

    return {
      statusCode: error.requestResult?.statusCode || 500,
      body: JSON.stringify({ error: errorMessage })
    };
  }
};