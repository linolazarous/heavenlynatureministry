// netlify/functions/email-notification.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
    const { to, subject, text, html, templateId, dynamicTemplateData } = JSON.parse(event.body);
    
    // Validate required fields
    if (!to || !subject || (!text && !html && !templateId)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'info@heavenlynatureministry.com',
      replyTo: process.env.SENDGRID_REPLY_TO || 'info@heavenlynatureministry.com',
      subject,
      ...(text && { text }),
      ...(html && { html }),
      ...(templateId && { 
        templateId,
        dynamicTemplateData 
      })
    };

    await sgMail.send(msg);
    console.log('Email sent to:', to);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Email sent successfully' })
    };
  } catch (error) {
    console.error('SendGrid Error:', error);
    
    let errorMessage = 'Failed to send email';
    if (error.response) {
      console.error('SendGrid Response:', error.response.body);
      errorMessage = error.response.body.errors?.[0]?.message || errorMessage;
    }

    return {
      statusCode: error.code || 500,
      body: JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};