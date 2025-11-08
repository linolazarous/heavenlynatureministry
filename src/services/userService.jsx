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

// Cache configuration
const CACHE_CONFIG = {
  DURATION: 2 * 60 * 1000, // 2 minutes
  MAX_SIZE: 100, // Maximum cached users
};

// Cache implementation with LRU eviction
class UserCache {
  constructor() {
    this.cache = new Map();
  }

  get(userId) {
    const cached = this.cache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_CONFIG.DURATION) {
      // Move to end (most recently used)
      this.cache.delete(userId);
      this.cache.set(userId, cached);
      return cached.data;
    }
    this.delete(userId);
    return null;
  }

  set(userId, data) {
    // Evict if cache is full (LRU)
    if (this.cache.size >= CACHE_CONFIG.MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(userId, {
      data,
      timestamp: Date.now()
    });
  }

  delete(userId) {
    this.cache.delete(userId);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }

  keys() {
    return Array.from(this.cache.keys());
  }
}

const userCache = new UserCache();

// Validation utilities
const validators = {
  userId: (userId) => {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new UserServiceError('Invalid user ID', 'INVALID_USER_ID');
    }
    return userId.trim();
  },

  profileData: (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new UserServiceError('Invalid profile data', 'INVALID_PROFILE_DATA');
    }

    const errors = [];
    
    if (data.name) {
      if (data.name.length < 2) errors.push('Name must be at least 2 characters');
      if (data.name.length > 100) errors.push('Name must be less than 100 characters');
    }
    
    if (data.bio && data.bio.length > 500) {
      errors.push('Bio must be less than 500 characters');
    }
    
    if (data.avatar && !validators.isUrl(data.avatar)) {
      errors.push('Avatar must be a valid URL');
    }

    if (errors.length > 0) {
      throw new UserServiceError('Profile validation failed', 'VALIDATION_FAILED', { errors });
    }

    return data;
  },

  password: (password) => {
    const errors = [];
    
    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain a lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain an uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain a number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain a special character (@$!%*?&)');
    }

    if (errors.length > 0) {
      throw new UserServiceError('Password validation failed', 'PASSWORD_VALIDATION_FAILED', { errors });
    }

    return password;
  },

  isUrl: (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  },

  imageFile: (file) => {
    if (!(file instanceof File)) {
      throw new UserServiceError('Invalid file provided', 'INVALID_FILE');
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new UserServiceError('Invalid image format. Use JPEG, PNG, GIF, or WebP', 'INVALID_IMAGE_TYPE');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new UserServiceError('Image must be smaller than 5MB', 'FILE_TOO_LARGE');
    }

    return file;
  }
};

// Event system for user updates
const createEventSystem = () => {
  const listeners = new Map();

  return {
    emit(event, data) {
      const eventListeners = listeners.get(event) || [];
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    },

    on(event, callback) {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event).push(callback);
      
      return () => this.off(event, callback);
    },

    off(event, callback) {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    }
  };
};

const events = createEventSystem();

export const userService = {
  /**
   * Fetch user profile with caching and comprehensive error handling
   */
  async fetchUserProfile(userId, options = {}) {
    const { forceRefresh = false, timeout = 10000 } = options;
    const validatedUserId = validators.userId(userId);

    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = userCache.get(validatedUserId);
        if (cached) {
          return cached;
        }
      }

      const response = await apiClient.get(`/users/${validatedUserId}/profile`, {
        timeout,
        validateStatus: (status) => status < 500
      });

      switch (response.status) {
        case 200:
          const profile = response.data;
          userCache.set(validatedUserId, profile);
          events.emit('profileFetched', profile);
          return profile;

        case 404:
          throw new UserServiceError('User profile not found', 'PROFILE_NOT_FOUND');

        case 403:
          throw new UserServiceError('Access denied to user profile', 'ACCESS_DENIED');

        default:
          throw new UserServiceError(
            `Server returned ${response.status}`,
            'SERVER_ERROR'
          );
      }

    } catch (error) {
      if (error instanceof UserServiceError) throw error;

      console.error('Error fetching user profile:', error);
      
      if (error.code === 'ECONNABORTED') {
        throw new UserServiceError('Request timeout', 'TIMEOUT');
      }
      
      if (error.response?.status === 404) {
        throw new UserServiceError('User profile not found', 'PROFILE_NOT_FOUND');
      }
      
      throw new UserServiceError(
        error.message || 'Network error while fetching profile',
        'NETWORK_ERROR'
      );
    }
  },

  /**
   * Update user profile with full validation and event emission
   */
  async updateUserProfile(userId, profileData, options = {}) {
    const { timeout = 15000 } = options;
    const validatedUserId = validators.userId(userId);
    const validatedData = validators.profileData(profileData);

    try {
      const response = await apiClient.put(
        `/users/${validatedUserId}/profile`, 
        validatedData, 
        { timeout }
      );

      if (response.status === 200) {
        const updatedProfile = response.data;
        
        // Update cache and emit events
        userCache.set(validatedUserId, updatedProfile);
        events.emit('profileUpdated', updatedProfile);
        events.emit('userProfileUpdated', updatedProfile); // Legacy event
        
        return updatedProfile;
      }

      // Handle specific error responses
      switch (response.status) {
        case 400:
          throw new UserServiceError(
            'Invalid profile data',
            'INVALID_DATA',
            response.data
          );
        case 403:
          throw new UserServiceError(
            'Permission denied',
            'PERMISSION_DENIED'
          );
        case 409:
          throw new UserServiceError(
            'Profile update conflict',
            'UPDATE_CONFLICT',
            response.data
          );
        default:
          throw new UserServiceError(
            `Update failed: ${response.status}`,
            'UPDATE_FAILED'
          );
      }

    } catch (error) {
      if (error instanceof UserServiceError) throw error;
      
      console.error('Error updating user profile:', error);
      throw new UserServiceError(
        error.message || 'Failed to update profile',
        'NETWORK_ERROR'
      );
    }
  },

  /**
   * Change user password with security validation
   */
  async changePassword(userId, currentPassword, newPassword, options = {}) {
    const { timeout = 15000 } = options;
    const validatedUserId = validators.userId(userId);
    const validatedNewPassword = validators.password(newPassword);

    try {
      const response = await apiClient.post(
        `/users/${validatedUserId}/password`,
        {
          currentPassword,
          newPassword: validatedNewPassword
        },
        { timeout }
      );

      if (response.status === 200) {
        events.emit('passwordChanged', { userId: validatedUserId });
        return response.data;
      }

      switch (response.status) {
        case 401:
          throw new UserServiceError('Current password is incorrect', 'INCORRECT_PASSWORD');
        case 400:
          throw new UserServiceError('Invalid password data', 'INVALID_PASSWORD_DATA');
        default:
          throw new UserServiceError('Password change failed', 'PASSWORD_CHANGE_FAILED');
      }

    } catch (error) {
      if (error instanceof UserServiceError) throw error;
      
      console.error('Error changing password:', error);
      throw new UserServiceError(
        'Failed to change password',
        'NETWORK_ERROR'
      );
    }
  },

  /**
   * Upload profile avatar with file validation
   */
  async uploadAvatar(userId, imageFile, options = {}) {
    const { timeout = 30000 } = options;
    const validatedUserId = validators.userId(userId);
    const validatedFile = validators.imageFile(imageFile);

    try {
      const formData = new FormData();
      formData.append('avatar', validatedFile);
      
      const response = await apiClient.post(
        `/users/${validatedUserId}/avatar`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout,
        }
      );

      if (response.status === 200) {
        const updatedProfile = response.data;
        userCache.set(validatedUserId, updatedProfile);
        events.emit('avatarUpdated', updatedProfile);
        return updatedProfile;
      }

      throw new UserServiceError('Avatar upload failed', 'UPLOAD_FAILED');

    } catch (error) {
      if (error instanceof UserServiceError) throw error;
      
      console.error('Error uploading avatar:', error);
      
      if (error.response?.status === 413) {
        throw new UserServiceError('File too large', 'FILE_TOO_LARGE');
      }
      
      throw new UserServiceError('Upload failed', 'NETWORK_ERROR');
    }
  },

  /**
   * Get user donation history with pagination
   */
  async getDonationHistory(userId, options = {}) {
    const { limit = 50, offset = 0, timeout = 10000 } = options;
    const validatedUserId = validators.userId(userId);

    try {
      const response = await apiClient.get(`/users/${validatedUserId}/donations`, {
        params: { limit, offset },
        timeout
      });

      if (response.status === 200) {
        return response.data;
      }

      throw new UserServiceError('Failed to fetch donations', 'FETCH_FAILED');

    } catch (error) {
      console.error('Error fetching donation history:', error);
      throw new UserServiceError('Failed to fetch donations', 'NETWORK_ERROR');
    }
  },

  /**
   * Get user event registrations
   */
  async getEventRegistrations(userId, options = {}) {
    const { timeout = 10000 } = options;
    const validatedUserId = validators.userId(userId);

    try {
      const response = await apiClient.get(`/users/${validatedUserId}/events`, {
        timeout
      });

      if (response.status === 200) {
        return response.data;
      }

      throw new UserServiceError('Failed to fetch events', 'FETCH_FAILED');

    } catch (error) {
      console.error('Error fetching event registrations:', error);
      throw new UserServiceError('Failed to fetch events', 'NETWORK_ERROR');
    }
  },

  /**
   * Request email verification
   */
  async requestEmailVerification(userId, options = {}) {
    const { timeout = 10000 } = options;
    const validatedUserId = validators.userId(userId);

    try {
      const response = await apiClient.post(
        `/users/${validatedUserId}/verify-email`,
        {},
        { timeout }
      );

      if (response.status === 200) {
        events.emit('verificationRequested', { userId: validatedUserId });
        return response.data;
      }

      throw new UserServiceError('Verification request failed', 'REQUEST_FAILED');

    } catch (error) {
      console.error('Error requesting verification:', error);
      throw new UserServiceError('Verification request failed', 'NETWORK_ERROR');
    }
  },

  // Event system methods
  on: events.on.bind(events),
  off: events.off.bind(events),

  // Cache management
  clearCache(userId = null) {
    if (userId) {
      userCache.delete(userId);
    } else {
      userCache.clear();
    }
    events.emit('cacheCleared', { userId });
  },

  getCacheStats() {
    return {
      size: userCache.size(),
      keys: userCache.keys(),
      config: CACHE_CONFIG
    };
  },

  // Validation methods (exposed for external use)
  validators
};

// Legacy exports for backward compatibility
export const {
  fetchUserProfile,
  updateUserProfile,
  changePassword,
  uploadAvatar,
  getDonationHistory,
  getEventRegistrations,
  requestEmailVerification
} = userService;

export default userService;
