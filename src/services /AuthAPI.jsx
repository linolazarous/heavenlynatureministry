import axios from 'axios';
import netlifyIdentity from 'netlify-identity-widget';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || '/.netlify/functions';

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
  async (config) => {
    try {
      const user = netlifyIdentity.currentUser();
      if (user) {
        const token = await user.jwt();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to add auth token to request:', error);
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
          // Unauthorized - redirect to login
          netlifyIdentity.logout();
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
      // Use Netlify Identity for authentication
      const user = await netlifyIdentity.login(email, password, true);
      
      if (!user) {
        throw new Error('Login failed - no user returned');
      }

      // Get JWT token
      const token = await user.jwt();
      
      // Fetch additional user data from our API
      const userProfile = await this.getUserProfile(user.id);
      
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email.split('@')[0],
          role: user.user_metadata?.role || 'user',
          ...userProfile
        },
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(
        error.message === 'Failed to fetch' 
          ? 'Network error. Please check your connection.'
          : 'Invalid email or password. Please try again.'
      );
    }
  },

  /**
   * Sign up new user
   */
  async signup(email, password, userData = {}) {
    try {
      const user = await netlifyIdentity.signup(email, password, userData);
      
      if (!user) {
        throw new Error('Signup failed');
      }

      // Send welcome email or additional setup
      await apiClient.post('/welcome-user', {
        email,
        name: userData.full_name
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email.split('@')[0],
          role: 'user'
        },
        token: await user.jwt()
      };
    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.message.includes('already exists')) {
        throw new Error('An account with this email already exists.');
      }
      
      throw new Error(
        error.message === 'Failed to fetch'
          ? 'Network error during signup. Please try again.'
          : 'Signup failed. Please try again.'
      );
    }
  },

  /**
   * Verify JWT token and get user data
   */
  async verifyToken(token) {
    try {
      const response = await apiClient.get('/verify-token', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.user;
    } catch (error) {
      console.error('Token verification error:', error);
      throw new Error('Session expired. Please log in again.');
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
      return {
        name: netlifyIdentity.currentUser()?.user_metadata?.full_name || '',
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
      await netlifyIdentity.requestPasswordRecovery(email);
      return { success: true, message: 'Password reset email sent.' };
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
      const user = netlifyIdentity.currentUser();
      if (!user) {
        throw new Error('No user logged in');
      }

      // Note: Netlify Identity doesn't have a direct change password method
      // This would typically be handled through their recovery flow
      // For now, we'll use a custom function
      const response = await apiClient.post('/change-password', {
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
      netlifyIdentity.logout();
      return { success: true, message: 'Logged out successfully.' };
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Logout failed. Please try again.');
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
  }
};

// Export the configured axios instance for other services
export { apiClient };

export default AuthAPI;