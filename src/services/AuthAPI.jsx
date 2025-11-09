// src/services/AuthAPI.jsx
import axios from 'axios';

// API Configuration for Render
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
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear local storage and redirect
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('unauthorized'));
          break;
        case 403:
          // Forbidden - insufficient permissions
          console.error('Access forbidden:', data.message);
          break;
        case 429:
          // Rate limited
          console.error('Rate limit exceeded:', data.message);
          break;
        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;
        default:
          console.error('API error:', data.message);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
    } else {
      // Request configuration error
      console.error('Request error:', error.message);
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
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });
      
      const { user, token } = response.data;
      
      // Store token and user data
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(
        error.response?.data?.message || 
        'Invalid email or password. Please try again.'
      );
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
      
      // Store token and user data
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.response?.status === 409) {
        throw new Error('An account with this email already exists.');
      }
      
      throw new Error(
        error.response?.data?.message ||
        'Signup failed. Please try again.'
      );
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
      console.error('Token verification error:', error);
      throw new Error('Session expired. Please log in again.');
    }
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
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
      console.error('Error fetching user profile:', error);
      // Return basic profile if API fails
      const currentUser = this.getCurrentUser();
      return {
        name: currentUser?.name || '',
        avatar: null,
        bio: ''
      };
    }
  },

  /**
   * Update user profile
   */
  async updateUserProfile(userId, profileData) {
    try {
      const response = await apiClient.put(`/users/${userId}/profile`, profileData);
      
      // Update stored user data
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        const updatedUser = { ...currentUser, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update profile. Please try again.');
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
      console.error('Password reset request error:', error);
      throw new Error('Failed to send reset email. Please try again.');
    }
  },

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('No user logged in');
      }

      const response = await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      return response.data;
    } catch (error) {
      console.error('Password change error:', error);
      throw new Error('Failed to change password. Please try again.');
    }
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      // Call logout endpoint if needed
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      return { success: true, message: 'Logged out successfully.' };
    }
  },

  /**
   * Check if user has specific role
   */
  hasRole(user, role) {
    if (!user) return false;
    return user.role === role || user.role === 'admin';
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
    const token = localStorage.getItem('auth_token');
    const user = this.getCurrentUser();
    return !!(token && user);
  }
};

// Export the configured axios instance for other services
export { apiClient };

export default AuthAPI;
