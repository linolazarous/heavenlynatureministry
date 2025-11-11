// src/services/api.jsx
import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.heavenlynatureministry.onrender.com';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Donation API service - THIS MUST BE EXPORTED
export const donationAPI = {
  /**
   * Process one-time donation
   */
  async processOneTimeDonation(donationData) {
    try {
      const response = await apiClient.post('/api/donations/one-time', donationData);
      return response.data;
    } catch (error) {
      console.error('Donation processing error:', error);
      throw new Error(error.response?.data?.message || 'Failed to process donation');
    }
  },

  /**
   * Process monthly subscription
   */
  async processMonthlySubscription(subscriptionData) {
    try {
      const response = await apiClient.post('/api/donations/subscription', subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Subscription processing error:', error);
      throw new Error(error.response?.data?.message || 'Failed to process subscription');
    }
  },

  /**
   * Get donation statistics
   */
  async getDonationStats() {
    try {
      const response = await apiClient.get('/api/donations/stats');
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

  /**
   * Get user donation stats
   */
  async getUserDonationStats(userId) {
    try {
      const response = await apiClient.get(`/api/donations/user/${userId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user donation stats:', error);
      // Return mock data for development
      return {
        totalDonated: 1250,
        donationCount: 12,
        recentDonations: [
          { id: '1', amount: 100, date: new Date().toISOString(), status: 'completed' },
          { id: '2', amount: 50, date: new Date(Date.now() - 86400000).toISOString(), status: 'completed' }
        ]
      };
    }
  },

  /**
   * Get user donation history
   */
  async getUserDonationHistory(userId) {
    try {
      const response = await apiClient.get(`/api/donations/user/${userId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user donation history:', error);
      // Return mock data for development
      return [
        { id: '1', amount: 100, date: new Date().toISOString(), type: 'one-time', status: 'completed' },
        { id: '2', amount: 50, date: new Date(Date.now() - 86400000).toISOString(), type: 'one-time', status: 'completed' },
        { id: '3', amount: 25, date: new Date(Date.now() - 172800000).toISOString(), type: 'monthly', status: 'active' }
      ];
    }
  },

  /**
   * Get donation history (admin only)
   */
  async getDonationHistory(filters = {}) {
    try {
      const response = await apiClient.get('/api/admin/donations', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching donation history:', error);
      throw new Error('Failed to fetch donation history');
    }
  },

  /**
   * Send donation receipt
   */
  async sendDonationReceipt(donationId, email) {
    try {
      const response = await apiClient.post(`/api/donations/${donationId}/receipt`, { email });
      return response.data;
    } catch (error) {
      console.error('Error sending receipt:', error);
      throw new Error('Failed to send receipt');
    }
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId) {
    try {
      const response = await apiClient.post(`/api/donations/subscriptions/${subscriptionId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  },

  /**
   * Validate donation amount
   */
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

  /**
   * Format currency
   */
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
};

// Ministry API service for admin dashboard - THIS MUST BE EXPORTED
export const ministryAPI = {
  /**
   * Get ministry statistics for admin dashboard
   */
  async getMinistryStats() {
    try {
      const response = await apiClient.get('/api/admin/ministry/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching ministry stats:', error);
      // Return mock data for development
      return {
        totalMembers: 1247,
        activeMembers: 892,
        newMembersThisMonth: 45,
        eventsThisMonth: 12,
        totalDonations: 125000,
        monthlyDonations: 15000,
        prayerRequests: 23,
        volunteers: 156,
        growthRate: 12.5,
        engagementRate: 68.3
      };
    }
  },

  /**
   * Get dashboard overview data
   */
  async getDashboardOverview() {
    try {
      const response = await apiClient.get('/api/admin/dashboard/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      // Return mock data for development
      return {
        recentActivity: [
          {
            type: 'donation',
            user: 'John Smith',
            amount: 100,
            timestamp: new Date().toISOString(),
            description: 'One-time donation'
          },
          {
            type: 'registration',
            user: 'Sarah Johnson',
            event: 'Sunday Service',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            description: 'Registered for event'
          }
        ],
        upcomingEvents: [
          {
            id: '1',
            title: 'Sunday Worship Service',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            attendees: 150,
            capacity: 200
          }
        ],
        systemStatus: {
          website: 'online',
          database: 'online',
          livestream: 'offline',
          email: 'online'
        }
      };
    }
  }
};

// Admin-specific API services
export const adminAPI = {
  /**
   * Get all donations (admin)
   */
  async getAllDonations(filters = {}) {
    try {
      const response = await apiClient.get('/api/admin/donations', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching all donations:', error);
      throw new Error('Failed to fetch donations');
    }
  },

  /**
   * Get donation by ID (admin)
   */
  async getDonationById(donationId) {
    try {
      const response = await apiClient.get(`/api/admin/donations/${donationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching donation:', error);
      throw new Error('Failed to fetch donation');
    }
  },

  /**
   * Update donation status (admin)
   */
  async updateDonationStatus(donationId, status) {
    try {
      const response = await apiClient.put(`/api/admin/donations/${donationId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating donation status:', error);
      throw new Error('Failed to update donation status');
    }
  }
};

// User API service
export const userAPI = {
  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    try {
      const response = await apiClient.get(`/api/users/${userId}/profile`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Return mock data for development
      return {
        id: userId,
        name: 'Demo User',
        email: 'user@example.com',
        avatar: null,
        bio: 'Member of Heavenly Nature Ministry',
        phone: '+1234567890',
        address: {
          street: '123 Church St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        },
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          newsletter: true
        },
        eventsAttended: 5,
        memberSince: '2023-01-15T00:00:00.000Z'
      };
    }
  }
};

// Event API service
export const eventAPI = {
  /**
   * Get all events
   */
  async getEvents(filters = {}) {
    try {
      const response = await apiClient.get('/api/events', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      // Return mock data for development
      return [
        {
          id: '1',
          title: 'Sunday Worship Service',
          description: 'Join us for our weekly Sunday worship service with praise, prayer, and preaching from God\'s Word.',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          time: '10:00 AM - 1:00 PM',
          location: 'Main Sanctuary',
          category: 'worship',
          isFeatured: true,
          image: '/images/events/worship-service.jpg',
          maxAttendees: 200,
          currentAttendees: 150,
          registrationRequired: false,
          cost: 0
        }
      ];
    }
  }
};

// Auth API service
export const authAPI = {
  /**
   * Login user
   */
  async login(credentials) {
    try {
      const response = await apiClient.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  /**
   * Register user
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }
};

// Export the axios instance for direct use
export { apiClient };

// Default export with all API services
export default {
  donation: donationAPI,
  admin: adminAPI,
  user: userAPI,
  event: eventAPI,
  auth: authAPI,
  ministry: ministryAPI,
  client: apiClient
};
