import axios from 'axios';
import { apiClient } from './AuthAPI';

// Broadcast API Configuration
const BROADCAST_API_BASE_URL = process.env.REACT_APP_BROADCAST_API_URL || '/.netlify/functions';
const CACHE_DURATION = 30 * 1000; // 30 seconds for broadcast data

// Cache for broadcast state
const broadcastCache = new Map();

// Error types
export class BroadcastAPIError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = 'BroadcastAPIError';
    this.code = code;
    this.details = details;
  }
}

// Request/response interceptors for broadcast API
const broadcastClient = axios.create({
  baseURL: BROADCAST_API_BASE_URL,
  timeout: 15000, // Longer timeout for broadcast operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
broadcastClient.interceptors.request.use(
  async (config) => {
    try {
      // Auth token will be added by the main apiClient interceptor
      // Add broadcast-specific headers
      config.headers['X-Broadcast-Client'] = 'heavenly-nature-ministry';
      config.headers['X-Client-Version'] = process.env.REACT_APP_VERSION || '1.0.0';
    } catch (error) {
      console.warn('Failed to add broadcast headers:', error);
    }
    return config;
  }
);

// Response interceptor with broadcast-specific error handling
broadcastClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      throw new BroadcastAPIError(
        'Broadcast service timeout. Please check your connection.',
        'TIMEOUT'
      );
    }
    
    if (!error.response) {
      throw new BroadcastAPIError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR'
      );
    }

    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        throw new BroadcastAPIError(
          'Authentication required for broadcast operations.',
          'UNAUTHORIZED'
        );
      case 403:
        throw new BroadcastAPIError(
          'Insufficient permissions for broadcast operations.',
          'FORBIDDEN'
        );
      case 429:
        throw new BroadcastAPIError(
          'Too many broadcast requests. Please wait a moment.',
          'RATE_LIMITED'
        );
      case 503:
        throw new BroadcastAPIError(
          'Broadcast service temporarily unavailable.',
          'SERVICE_UNAVAILABLE'
        );
      default:
        throw new BroadcastAPIError(
          data?.message || 'Broadcast operation failed.',
          'BROADCAST_ERROR',
          data
        );
    }
  }
);

export const BroadcastAPI = {
  /**
   * Get current broadcast state with caching
   */
  async getCurrentState() {
    const cacheKey = 'current-state';
    const cached = broadcastCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await broadcastClient.get('/broadcast/state');
      const state = response.data;
      
      // Cache the state
      broadcastCache.set(cacheKey, {
        data: state,
        timestamp: Date.now()
      });
      
      return state;
    } catch (error) {
      console.error('Error fetching current state:', error);
      
      // Return default state if API fails
      const defaultState = {
        isLive: false,
        streamTitle: 'Heavenly Nature Ministry',
        lowerThird: { visible: false, title: '', subtitle: '', color: '#4a6fa5' },
        bibleVerse: null,
        notes: '',
        countdown: null
      };
      
      broadcastCache.set(cacheKey, {
        data: defaultState,
        timestamp: Date.now()
      });
      
      return defaultState;
    }
  },

  /**
   * Update broadcast state
   */
  async updateState(stateUpdate) {
    try {
      // Validate state update
      if (!stateUpdate || typeof stateUpdate !== 'object') {
        throw new BroadcastAPIError('Invalid state update object', 'INVALID_STATE');
      }

      const response = await broadcastClient.post('/broadcast/state', stateUpdate);
      
      // Invalidate cache
      broadcastCache.delete('current-state');
      
      // Emit state change event for real-time updates
      this.emitStateChange(response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error updating state:', error);
      throw error;
    }
  },

  /**
   * Start broadcast with platform support
   */
  async startBroadcast(platform = 'youtube', options = {}) {
    try {
      const response = await broadcastClient.post('/broadcast/start', {
        platform,
        ...options,
        timestamp: new Date().toISOString()
      });
      
      // Invalidate cache
      broadcastCache.delete('current-state');
      
      console.log(`Broadcast started on ${platform}`);
      return response.data;
    } catch (error) {
      console.error('Error starting broadcast:', error);
      throw new BroadcastAPIError(
        `Failed to start broadcast on ${platform}`,
        'START_FAILED',
        { platform, error: error.message }
      );
    }
  },

  /**
   * End broadcast
   */
  async endBroadcast() {
    try {
      const response = await broadcastClient.post('/broadcast/end', {
        timestamp: new Date().toISOString()
      });
      
      // Invalidate cache
      broadcastCache.delete('current-state');
      
      console.log('Broadcast ended');
      return response.data;
    } catch (error) {
      console.error('Error ending broadcast:', error);
      throw new BroadcastAPIError(
        'Failed to end broadcast',
        'END_FAILED',
        { error: error.message }
      );
    }
  },

  /**
   * Save broadcast preset
   */
  async savePreset(preset) {
    try {
      if (!preset.name || !preset.state) {
        throw new BroadcastAPIError('Preset must have name and state', 'INVALID_PRESET');
      }

      const response = await broadcastClient.post('/broadcast/presets', {
        ...preset,
        createdAt: new Date().toISOString(),
        id: preset.id || `preset-${Date.now()}`
      });
      
      return response.data;
    } catch (error) {
      console.error('Error saving preset:', error);
      throw error;
    }
  },

  /**
   * Load broadcast preset
   */
  async loadPreset(presetId) {
    try {
      const response = await broadcastClient.get(`/broadcast/presets/${presetId}`);
      return response.data;
    } catch (error) {
      console.error('Error loading preset:', error);
      throw new BroadcastAPIError(
        'Failed to load preset',
        'LOAD_PRESET_FAILED',
        { presetId, error: error.message }
      );
    }
  },

  /**
   * Get all presets
   */
  async getPresets() {
    try {
      const response = await broadcastClient.get('/broadcast/presets');
      return response.data;
    } catch (error) {
      console.error('Error fetching presets:', error);
      // Return empty array if API fails
      return [];
    }
  },

  /**
   * Delete preset
   */
  async deletePreset(presetId) {
    try {
      const response = await broadcastClient.delete(`/broadcast/presets/${presetId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting preset:', error);
      throw new BroadcastAPIError(
        'Failed to delete preset',
        'DELETE_PRESET_FAILED',
        { presetId, error: error.message }
      );
    }
  },

  /**
   * Get broadcast statistics
   */
  async getStats() {
    try {
      const response = await broadcastClient.get('/broadcast/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching broadcast stats:', error);
      // Return default stats if API fails
      return {
        totalBroadcasts: 0,
        averageViewers: 0,
        totalViewers: 0,
        lastBroadcast: null
      };
    }
  },

  /**
   * Upload overlay image
   */
  async uploadOverlayImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await broadcastClient.post('/broadcast/upload-overlay', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // Longer timeout for file uploads
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading overlay image:', error);
      throw new BroadcastAPIError(
        'Failed to upload overlay image',
        'UPLOAD_FAILED',
        { error: error.message }
      );
    }
  },

  /**
   * Emit state change for real-time updates
   */
  emitStateChange(newState) {
    // This would typically use WebSockets or Server-Sent Events
    // For now, we'll use a custom event
    const event = new CustomEvent('broadcastStateChange', {
      detail: newState
    });
    window.dispatchEvent(event);
  },

  /**
   * Subscribe to state changes
   */
  onStateChange(callback) {
    const handler = (event) => callback(event.detail);
    window.addEventListener('broadcastStateChange', handler);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener('broadcastStateChange', handler);
    };
  },

  /**
   * Clear broadcast cache
   */
  clearCache() {
    broadcastCache.clear();
  },

  /**
   * Get cache info
   */
  getCacheInfo() {
    return {
      size: broadcastCache.size,
      keys: Array.from(broadcastCache.keys()),
      entries: Array.from(broadcastCache.entries()).map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp
      }))
    };
  }
};

export default BroadcastAPI;