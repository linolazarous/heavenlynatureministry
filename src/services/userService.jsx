import { apiClient } from './AuthAPI';

// Error types for user service
export class UserServiceError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = 'UserServiceError';
    this.code = code;
    this.details = details;
  }
}

// Cache for user data
const userCache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Cache management
const getCachedUser = (userId) => {
  const cached = userCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  userCache.delete(userId);
  return null;
};

const setCachedUser = (userId, data) => {
  userCache.set(userId, {
    data,
    timestamp: Date.now()
  });
};

export const userService = {
  /**
   * Fetch user profile with caching and error handling
   */
  async fetchUserProfile(userId) {
    try {
      // Validate userId
      if (!userId || typeof userId !== 'string') {
        throw new UserServiceError('Invalid user ID', 'INVALID_USER_ID');
      }

      // Check cache first
      const cached = getCachedUser(userId);
      if (cached) {
        return cached;
      }

      const response = await apiClient.get(`/users/${userId}/profile`, {
        timeout: 10000,
        validateStatus: (status) => status < 500
      });

      if (response.status === 200) {
        const profile = response.data;
        
        // Cache the profile
        setCachedUser(userId, profile);
        
        return profile;
      }

      if (response.status === 404) {
        throw new UserServiceError('User profile not found', 'PROFILE_NOT_FOUND');
      }

      throw new UserServiceError(
        `Failed to fetch profile: ${response.status}`,
        'FETCH_PROFILE_FAILED'
      );

    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      if (error.response?.status === 404) {
        throw new UserServiceError('User profile not found', 'PROFILE_NOT_FOUND');
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new UserServiceError(
          'Request timeout while fetching profile',
          'TIMEOUT'
        );
      }
      
      throw new UserServiceError(
        error.message || 'Failed to fetch user profile',
        'NETWORK_ERROR'
      );
    }
  },

  /**
   * Update user profile with validation
   */
  async updateUserProfile(userId, profileData) {
    try {
      // Validate input
      if (!userId || typeof userId !== 'string') {
        throw new UserServiceError('Invalid user ID', 'INVALID_USER_ID');
      }

      if (!profileData || typeof profileData !== 'object') {
        throw new UserServiceError('Invalid profile data', 'INVALID_PROFILE_DATA');
      }

      // Validate specific fields
      const validationErrors = this.validateProfileData(profileData);
      if (validationErrors.length > 0) {
        throw new UserServiceError(
          'Profile data validation failed',
          'VALIDATION_FAILED',
          { errors: validationErrors }
        );
      }

      const response = await apiClient.put(`/users/${userId}/profile`, profileData, {
        timeout: 15000
      });

      if (response.status === 200) {
        const updatedProfile = response.data;
        
        // Update cache
        setCachedUser(userId, updatedProfile);
        
        // Emit profile update event
        this.emitProfileUpdate(updatedProfile);
        
        return updatedProfile;
      }

      throw new UserServiceError(
        `Failed to update profile: ${response.status}`,
        'UPDATE_PROFILE_FAILED'
      );

    } catch (error) {
      console.error('Error updating user profile:', error);
      
      if (error.response?.status === 400) {
        throw new UserServiceError(
          'Invalid profile data provided',
          'INVALID_DATA',
          error.response.data
        );
      }
      
      if (error.response?.status === 403) {
        throw new UserServiceError(
          'Permission denied to update profile',
          'PERMISSION_DENIED'
        );
      }
      
      throw new UserServiceError(
        error.message || 'Failed to update user profile',
        'NETWORK_ERROR'
      );
    }
  },

  /**
   * Change user password with security validation
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Validate passwords
      const passwordErrors = this.validatePassword(newPassword);
      if (passwordErrors.length > 0) {
        throw new UserServiceError(
          'Password validation failed',
          'PASSWORD_VALIDATION_FAILED',
          { errors: passwordErrors }
        );
      }

      const response = await apiClient.post(`/users/${userId}/password`, {
        currentPassword,
        newPassword
      }, {
        timeout: 15000
      });

      if (response.status === 200) {
        // Emit password change event
        this.emitPasswordChange(userId);
        
        return response.data;
      }

      if (response.status === 401) {
        throw new UserServiceError(
          'Current password is incorrect',
          'INCORRECT_CURRENT_PASSWORD'
        );
      }

      throw new UserServiceError(
        `Failed to change password: ${response.status}`,
        'CHANGE_PASSWORD_FAILED'
      );

    } catch (error) {
      console.error('Error changing password:', error);
      
      if (error.response?.status === 401) {
        throw new UserServiceError(
          'Current password is incorrect',
          'INCORRECT_CURRENT_PASSWORD'
        );
      }
      
      throw new UserServiceError(
        error.message || 'Failed to change password',
        'NETWORK_ERROR'
      );
    }
  },

  /**
   * Request email verification
   */
  async requestEmailVerification(userId) {
    try {
      const response = await apiClient.post(`/users/${userId}/verify-email`, {}, {
        timeout: 10000
      });

      if (response.status === 200) {
        return response.data;
      }

      throw new UserServiceError(
        'Failed to send verification email',
        'VERIFICATION_REQUEST_FAILED'
      );

    } catch (error) {
      console.error('Error requesting email verification:', error);
      throw new UserServiceError(
        'Failed to send verification email',
        'NETWORK_ERROR'
      );
    }
  },

  /**
   * Upload profile avatar
   */
  async uploadAvatar(userId, imageFile) {
    try {
      const formData = new FormData();
      formData.append('avatar', imageFile);
      
      const response = await apiClient.post(`/users/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // Longer timeout for file upload
      });

      if (response.status === 200) {
        const updatedProfile = response.data;
        
        // Update cache
        setCachedUser(userId, updatedProfile);
        
        return updatedProfile;
      }

      throw new UserServiceError(
        'Failed to upload avatar',
        'AVATAR_UPLOAD_FAILED'
      );

    } catch (error) {
      console.error('Error uploading avatar:', error);
      
      if (error.response?.status === 413) {
        throw new UserServiceError(
          'Image file too large. Please use a smaller image.',
          'FILE_TOO_LARGE'
        );
      }
      
      throw new UserServiceError(
        'Failed to upload profile picture',
        'NETWORK_ERROR'
      );
    }
  },

  /**
   * Get user donation history
   */
  async getDonationHistory(userId, options = {}) {
    try {
      const { limit = 50, offset = 0 } = options;
      
      const response = await apiClient.get(`/users/${userId}/donations`, {
        params: { limit, offset },
        timeout: 10000
      });

      if (response.status === 200) {
        return response.data;
      }

      throw new UserServiceError(
        'Failed to fetch donation history',
        'FETCH_DONATIONS_FAILED'
      );

    } catch (error) {
      console.error('Error fetching donation history:', error);
      throw new UserServiceError(
        'Failed to fetch donation history',
        'NETWORK_ERROR'
      );
    }
  },

  /**
   * Get user event registrations
   */
  async getEventRegistrations(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}/events`, {
        timeout: 10000
      });

      if (response.status === 200) {
        return response.data;
      }

      throw new UserServiceError(
        'Failed to fetch event registrations',
        'FETCH_EVENTS_FAILED'
      );

    } catch (error) {
      console.error('Error fetching event registrations:', error);
      throw new UserServiceError(
        'Failed to fetch event registrations',
        'NETWORK_ERROR'
      );
    }
  },

  /**
   * Validate profile data
   */
  validateProfileData(profileData) {
    const errors = [];
    
    if (profileData.name && profileData.name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    
    if (profileData.name && profileData.name.length > 100) {
      errors.push('Name must be less than 100 characters');
    }
    
    if (profileData.bio && profileData.bio.length > 500) {
      errors.push('Bio must be less than 500 characters');
    }
    
    if (profileData.avatar && !this.isValidUrl(profileData.avatar)) {
      errors.push('Avatar must be a valid URL');
    }
    
    return errors;
  },

  /**
   * Validate password strength
   */
  validatePassword(password) {
    const errors = [];
    
    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    return errors;
  },

  /**
   * Check if string is a valid URL
   */
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  },

  /**
   * Emit profile update event
   */
  emitProfileUpdate(profile) {
    const event = new CustomEvent('userProfileUpdated', {
      detail: profile
    });
    window.dispatchEvent(event);
  },

  /**
   * Subscribe to profile updates
   */
  onProfileUpdate(callback) {
    const handler = (event) => callback(event.detail);
    window.addEventListener('userProfileUpdated', handler);
    
    return () => {
      window.removeEventListener('userProfileUpdated', handler);
    };
  },

  /**
   * Emit password change event
   */
  emitPasswordChange(userId) {
    const event = new CustomEvent('userPasswordChanged', {
      detail: { userId }
    });
    window.dispatchEvent(event);
  },

  /**
   * Clear user cache
   */
  clearUserCache(userId = null) {
    if (userId) {
      userCache.delete(userId);
    } else {
      userCache.clear();
    }
  },

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cachedUsers: userCache.size,
      cacheKeys: Array.from(userCache.keys())
    };
  }
};

// Legacy exports for backward compatibility
export const fetchUserProfile = userService.fetchUserProfile.bind(userService);
export const updateUserProfile = userService.updateUserProfile.bind(userService);
export const changePassword = userService.changePassword.bind(userService);

export default userService;
