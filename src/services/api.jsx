// src/services/api.jsx
import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.heavenlynatureministry.com';

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

// Donation API service
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
  },

  /**
   * Export donations to CSV (admin)
   */
  async exportDonations(filters = {}) {
    try {
      const response = await apiClient.get('/api/admin/donations/export', { 
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting donations:', error);
      throw new Error('Failed to export donations');
    }
  },

  /**
   * Get donation analytics (admin)
   */
  async getDonationAnalytics(timeframe = 'month') {
    try {
      const response = await apiClient.get('/api/admin/analytics/donations', {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching donation analytics:', error);
      // Return mock analytics for development
      return {
        totalRevenue: 125000,
        monthlyGrowth: 15.5,
        topDonors: [
          { name: 'John Smith', amount: 5000, count: 12 },
          { name: 'Sarah Johnson', amount: 3500, count: 8 },
          { name: 'Michael Brown', amount: 2500, count: 5 }
        ],
        revenueByMonth: [
          { month: 'Jan', revenue: 10000 },
          { month: 'Feb', revenue: 12000 },
          { month: 'Mar', revenue: 15000 },
          { month: 'Apr', revenue: 11000 },
          { month: 'May', revenue: 13000 },
          { month: 'Jun', revenue: 14000 }
        ]
      };
    }
  },

  /**
   * Get donor statistics (admin)
   */
  async getDonorStats() {
    try {
      const response = await apiClient.get('/api/admin/analytics/donors');
      return response.data;
    } catch (error) {
      console.error('Error fetching donor stats:', error);
      // Return mock data for development
      return {
        totalDonors: 347,
        newDonorsThisMonth: 25,
        recurringDonors: 89,
        averageDonation: 85.50,
        donorRetentionRate: 78.5
      };
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
  },

  /**
   * Update user profile
   */
  async updateUserProfile(userId, profileData) {
    try {
      const response = await apiClient.put(`/api/users/${userId}/profile`, profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update profile');
    }
  },

  /**
   * Change user password
   */
  async changePassword(userId, passwordData) {
    try {
      const response = await apiClient.post(`/api/users/${userId}/change-password`, passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw new Error('Failed to change password');
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
      return this.getMockEvents();
    }
  },

  /**
   * Get featured events
   */
  async getFeaturedEvents() {
    try {
      const response = await apiClient.get('/api/events/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured events:', error);
      return this.getMockEvents().filter(event => event.isFeatured);
    }
  },

  /**
   * Get event by ID
   */
  async getEventById(eventId) {
    try {
      const response = await apiClient.get(`/api/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw new Error('Event not found');
    }
  },

  /**
   * Register for event
   */
  async registerForEvent(eventId, registrationData) {
    try {
      const response = await apiClient.post(`/api/events/${eventId}/register`, registrationData);
      return response.data;
    } catch (error) {
      console.error('Error registering for event:', error);
      throw new Error('Failed to register for event');
    }
  },

  /**
   * Mock events data for development
   */
  getMockEvents() {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return [
      {
        id: '1',
        title: 'Sunday Worship Service',
        description: 'Join us for our weekly Sunday worship service with praise, prayer, and preaching from God\'s Word.',
        date: nextWeek.toISOString(),
        time: '10:00 AM - 1:00 PM',
        location: 'Main Sanctuary',
        category: 'worship',
        isFeatured: true,
        image: '/images/events/worship-service.jpg',
        maxAttendees: 200,
        currentAttendees: 150,
        registrationRequired: false,
        cost: 0
      },
      {
        id: '2',
        title: 'Wednesday Prayer Meeting',
        description: 'Corporate prayer meeting for all church members and visitors.',
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        time: '6:00 PM - 7:30 PM',
        location: 'Prayer Room',
        category: 'prayer',
        isFeatured: false,
        image: '/images/events/prayer-meeting.jpg',
        maxAttendees: 50,
        currentAttendees: 25,
        registrationRequired: false,
        cost: 0
      }
    ];
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
  },

  /**
   * Refresh token
   */
  async refreshToken() {
    try {
      const response = await apiClient.post('/api/auth/refresh');
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Failed to refresh token');
    }
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      const response = await apiClient.post('/api/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Logout failed');
    }
  },

  /**
   * Forgot password
   */
  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  },

  /**
   * Reset password
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post('/api/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error(error.response?.data?.message || 'Failed to reset password');
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
  client: apiClient
};
