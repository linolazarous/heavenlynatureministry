import axios from 'axios';

// Base API configuration for Render deployment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.heavenlynatureministry.com';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
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
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('unauthorized'));
    }
    return Promise.reject(error);
  }
);

// API service methods
export const api = {
  // Auth endpoints
  auth: {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    logout: () => apiClient.post('/auth/logout'),
    verifyToken: (token) => apiClient.get('/auth/verify', { headers: { Authorization: `Bearer ${token}` } }),
    refreshToken: () => apiClient.post('/auth/refresh'),
    forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) => apiClient.post('/auth/reset-password', { token, newPassword }),
  },

  // User endpoints
  users: {
    getProfile: (userId) => apiClient.get(`/users/${userId}/profile`),
    updateProfile: (userId, data) => apiClient.put(`/users/${userId}/profile`, data),
    changePassword: (userId, data) => apiClient.post(`/users/${userId}/change-password`, data),
    getDonationStats: (userId) => apiClient.get(`/users/${userId}/donation-stats`),
    getEventRegistrations: (userId) => apiClient.get(`/users/${userId}/events`),
  },

  // Donation endpoints
  donations: {
    create: (data) => apiClient.post('/donations', data),
    getStats: () => apiClient.get('/donations/stats'),
    getUserHistory: (userId) => apiClient.get(`/donations/user/${userId}/history`),
    getReceipt: (donationId) => apiClient.get(`/donations/${donationId}/receipt`),
  },

  // Event endpoints
  events: {
    getAll: (params) => apiClient.get('/events', { params }),
    getFeatured: () => apiClient.get('/events/featured'),
    getById: (eventId) => apiClient.get(`/events/${eventId}`),
    register: (eventId, data) => apiClient.post(`/events/${eventId}/register`, data),
    getCategories: () => apiClient.get('/events/categories'),
  },

  // Ministry endpoints
  ministry: {
    getStats: () => apiClient.get('/ministry/stats'),
    getTestimonials: () => apiClient.get('/testimonials'),
    getStreamStatus: () => apiClient.get('/stream/status'),
  }
};

// Mock API for development
export const mockApi = {
  auth: {
    login: async (credentials) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        data: {
          user: {
            id: '1',
            email: credentials.email,
            name: credentials.email.split('@')[0],
            role: 'user'
          },
          token: 'mock-jwt-token'
        }
      };
    },
    register: async (userData) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        data: {
          user: {
            id: '1',
            email: userData.email,
            name: userData.name || userData.email.split('@')[0],
            role: 'user'
          },
          token: 'mock-jwt-token'
        }
      };
    }
  },
  users: {
    getProfile: async (userId) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        data: {
          id: userId,
          name: 'Demo User',
          email: 'user@example.com',
          bio: 'Member of Heavenly Nature Ministry',
          avatar: null,
          eventsAttended: 5,
          createdAt: new Date().toISOString()
        }
      };
    }
  },
  ministry: {
    getStats: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return {
        data: {
          communitiesServed: 12,
          livesImpacted: 5000,
          prayerRequests: 1200,
          totalDonations: 250000
        }
      };
    }
  }
};

// Export ministryAPI for Home.jsx
export { ministryAPI } from './ministryAPI.jsx';

// Export based on environment
export default process.env.NODE_ENV === 'production' ? api : mockApi;
