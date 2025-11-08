// src/services/donationService.jsx
import axios from 'axios';

// Base API configuration
const API_BASE_URL= process.env.REACT_APP_API_URL || 'https://api.heavenlynatureministry.com;
const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

// Initialize Stripe
let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = window.Stripe && window.Stripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Donation service
export const donationService = {
  // Process one-time donation
  async processOneTimeDonation(donationData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/donations/one-time`, {
        amount: donationData.amount,
        currency: donationData.currency || 'usd',
        email: donationData.email,
        name: donationData.name,
        message: donationData.message,
        isAnonymous: donationData.isAnonymous || false,
        paymentMethod: donationData.paymentMethod || 'stripe'
      });

      if (response.data.success && response.data.clientSecret) {
        const stripe = await getStripe();
        const result = await stripe.confirmCardPayment(response.data.clientSecret, {
          payment_method: {
            card: donationData.paymentMethod,
            billing_details: {
              name: donationData.name,
              email: donationData.email,
            },
          },
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        return {
          success: true,
          donationId: response.data.donationId,
          receiptUrl: response.data.receiptUrl
        };
      }

      return response.data;
    } catch (error) {
      console.error('Donation processing error:', error);
      throw new Error(error.response?.data?.message || 'Failed to process donation');
    }
  },

  // Process monthly subscription
  async processMonthlySubscription(subscriptionData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/donations/subscription`, {
        amount: subscriptionData.amount,
        currency: subscriptionData.currency || 'usd',
        email: subscriptionData.email,
        name: subscriptionData.name,
        interval: 'monthly',
        message: subscriptionData.message,
        isAnonymous: subscriptionData.isAnonymous || false
      });

      if (response.data.success && response.data.clientSecret) {
        const stripe = await getStripe();
        const result = await stripe.confirmCardPayment(response.data.clientSecret, {
          payment_method: {
            card: subscriptionData.paymentMethod,
            billing_details: {
              name: subscriptionData.name,
              email: subscriptionData.email,
            },
          },
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        return {
          success: true,
          subscriptionId: response.data.subscriptionId,
          customerId: response.data.customerId
        };
      }

      return response.data;
    } catch (error) {
      console.error('Subscription processing error:', error);
      throw new Error(error.response?.data?.message || 'Failed to process subscription');
    }
  },

  // Get donation statistics
  async getDonationStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/donations/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching donation stats:', error);
      // Return mock data for development
      return {
        totalDonations: 125000,
        monthlyRecurring: 2500,
        donorsCount: 347,
        recentDonations: [
          { name: 'Anonymous', amount: 100, date: new Date().toISOString() },
          { name: 'John D.', amount: 50, date: new Date().toISOString() }
        ]
      };
    }
  },

  // Get donation history (admin only)
  async getDonationHistory(filters = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/donations`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching donation history:', error);
      throw new Error('Failed to fetch donation history');
    }
  },

  // Send donation receipt
  async sendDonationReceipt(donationId, email) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/donations/${donationId}/receipt`, {
        email: email
      });
      return response.data;
    } catch (error) {
      console.error('Error sending receipt:', error);
      throw new Error('Failed to send receipt');
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/donations/subscriptions/${subscriptionId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  },

  // Validate donation amount
  validateDonationAmount(amount) {
    const minAmount = 1; // $1 minimum
    const maxAmount = 100000; // $100,000 maximum
    
    if (amount < minAmount) {
      return { valid: false, message: `Minimum donation amount is $${minAmount}` };
    }
    
    if (amount > maxAmount) {
      return { valid: false, message: `Maximum donation amount is $${maxAmount}` };
    }
    
    return { valid: true };
  },

  // Format currency
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
};

// Mock service for development
export const mockDonationService = {
  async processOneTimeDonation(donationData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate random success/failure
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      return {
        success: true,
        donationId: `don_${Date.now()}`,
        receiptUrl: '#',
        message: 'Thank you for your generous donation!'
      };
    } else {
      throw new Error('Payment processing failed. Please try again.');
    }
  },

  async processMonthlySubscription(subscriptionData) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        success: true,
        subscriptionId: `sub_${Date.now()}`,
        customerId: `cus_${Date.now()}`,
        message: 'Monthly subscription setup successfully!'
      };
    } else {
      throw new Error('Subscription setup failed. Please try again.');
    }
  },

  async getDonationStats() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      totalDonations: 125000,
      monthlyRecurring: 2500,
      donorsCount: 347,
      goalAmount: 200000,
      progressPercentage: 62.5,
      recentDonations: [
        { name: 'Anonymous', amount: 100, date: new Date().toISOString(), currency: 'USD' },
        { name: 'John D.', amount: 50, date: new Date(Date.now() - 86400000).toISOString(), currency: 'USD' },
        { name: 'Sarah M.', amount: 200, date: new Date(Date.now() - 172800000).toISOString(), currency: 'USD' }
      ]
    };
  }
};

// Export based on environment
export default process.env.NODE_ENV === 'production' ? donationService : mockDonationService;
