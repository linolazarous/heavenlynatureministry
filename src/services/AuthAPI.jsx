// src/services/AuthAPI.jsx
import axios from 'axios';

// API Configuration for Render
const API_BASE_URL = import.meta.env.VITE_API_URL || 
                     process.env.REACT_APP_API_URL || 
                     'https://api.heavenlynatureministry.onrender.com';

// Storage keys for consistency
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user'
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for better UX
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto-logout on unauthorized
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      window.dispatchEvent(new Event('unauthorized'));
    }
    
    return Promise.reject(error);
  }
);

export const AuthAPI = {
  /**
   * Login user with email and password
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      this._storeAuthData(user, token);
      return { user, token };
    } catch (error) {
      const message = error.response?.data?.message || 
                     'Invalid email or password. Please try again.';
      throw new Error(message);
    }
  },

  /**
   * Sign up new user
   */
  async signup(email, password, userData = {}) {
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        ...userData
      });
      
      const { user, token } = response.data;
      this._storeAuthData(user, token);
      return { user, token };
    } catch (error) {
      let message = 'Signup failed. Please try again.';
      
      if (error.response?.status === 409) {
        message = 'An account with this email already exists.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      throw new Error(message);
    }
  },

  /**
   * Verify JWT token and get user data
   */
  async verifyToken(token) {
    try {
      const response = await apiClient.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.user;
    } catch (error) {
      this._clearAuthData();
      throw new Error('Session expired. Please log in again.');
    }
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      this._clearAuthData();
      return null;
    }
  },

  /**
   * Get user profile data
   */
  async getUserProfile(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}/profile`);
      return response.data;
    } catch (error) {
      console.warn('Profile API unavailable, returning basic data');
      const currentUser = this.getCurrentUser();
      return {
        name: currentUser?.name || 'User',
        avatar: null,
        bio: '',
        joinDate: currentUser?.createdAt || new Date().toISOString()
      };
    }
  },

  /**
   * Update user profile
   */
  async updateUserProfile(userId, profileData) {
    try {
      const response = await apiClient.put(`/users/${userId}/profile`, profileData);
      
      // Update stored user data if it's the current user
      const currentUser = this.getCurrentUser();
      if (currentUser?.id === userId) {
        const updatedUser = { ...currentUser, ...profileData };
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      }
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                     'Failed to update profile. Please try again.';
      throw new Error(message);
    }
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        'Failed to send reset email. Please try again.'
      );
    }
  },

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 
                     'Failed to change password. Please try again.';
      throw new Error(message);
    }
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed, clearing local data anyway');
    } finally {
      this._clearAuthData();
    }
  },

  /**
   * Check if user has specific role
   */
  hasRole(user, role) {
    return user?.role === role || user?.role === 'admin';
  },

  /**
   * Check if user is admin
   */
  isAdmin(user) {
    return this.hasRole(user, 'admin');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const user = this.getCurrentUser();
    return !!(token && user);
  },

  // Private helper methods
  _storeAuthData(user, token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  _clearAuthData() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }
};

export { apiClient };
export default AuthAPI;
