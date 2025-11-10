// src/services/FacebookService.jsx
import { authHeader } from '../utils/authHeader';
import { handleResponse } from '../utils/responseHandler';

class FacebookService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || '';
  }

  /**
   * Start a Facebook Live stream
   * @returns {Promise<Object>} Stream information including embed HTML
   */
  async startLiveStream() {
    try {
      const response = await fetch(`${this.baseURL}/api/facebook/live/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({
          title: 'Heavenly Nature Ministry Livestream',
          description: 'Join us for worship and the word of God',
          privacy: 'PUBLIC'
        })
      });

      const data = await handleResponse(response);
      
      // Validate response structure
      if (!data.stream_id || !data.embed_html) {
        throw new Error('Invalid response from Facebook API');
      }

      console.log('Facebook Live stream started:', data.stream_id);
      return data;
    } catch (error) {
      console.error('Error starting Facebook Live stream:', error);
      throw new Error(`Failed to start Facebook Live: ${error.message}`);
    }
  }

  /**
   * End the current Facebook Live stream
   * @returns {Promise<Object>} End stream response
   */
  async endLiveStream() {
    try {
      const response = await fetch(`${this.baseURL}/api/facebook/live/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        }
      });

      const data = await handleResponse(response);
      console.log('Facebook Live stream ended');
      return data;
    } catch (error) {
      console.error('Error ending Facebook Live stream:', error);
      throw new Error(`Failed to end Facebook Live: ${error.message}`);
    }
  }

  /**
   * Get current Facebook Live stream status
   * @returns {Promise<Object>} Stream status information
   */
  async getStreamStatus() {
    try {
      const response = await fetch(`${this.baseURL}/api/facebook/live/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        }
      });

      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error getting Facebook Live status:', error);
      throw new Error(`Failed to get Facebook Live status: ${error.message}`);
    }
  }

  /**
   * Update Facebook Live stream information
   * @param {Object} updates - Stream updates
   * @returns {Promise<Object>} Updated stream information
   */
  async updateStream(updates) {
    try {
      const response = await fetch(`${this.baseURL}/api/facebook/live/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify(updates)
      });

      const data = await handleResponse(response);
      console.log('Facebook Live stream updated');
      return data;
    } catch (error) {
      console.error('Error updating Facebook Live stream:', error);
      throw new Error(`Failed to update Facebook Live: ${error.message}`);
    }
  }

  /**
   * Get Facebook page insights and statistics
   * @returns {Promise<Object>} Page insights data
   */
  async getPageInsights() {
    try {
      const response = await fetch(`${this.baseURL}/api/facebook/insights`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        }
      });

      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error getting Facebook insights:', error);
      throw new Error(`Failed to get Facebook insights: ${error.message}`);
    }
  }

  /**
   * Schedule a Facebook Live stream
   * @param {Object} scheduleData - Schedule information
   * @returns {Promise<Object>} Scheduled stream information
   */
  async scheduleLiveStream(scheduleData) {
    try {
      const response = await fetch(`${this.baseURL}/api/facebook/live/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({
          title: scheduleData.title || 'Heavenly Nature Ministry Livestream',
          description: scheduleData.description || 'Join us for worship and the word of God',
          scheduled_time: scheduleData.scheduledTime,
          privacy: scheduleData.privacy || 'PUBLIC'
        })
      });

      const data = await handleResponse(response);
      console.log('Facebook Live stream scheduled:', data.id);
      return data;
    } catch (error) {
      console.error('Error scheduling Facebook Live stream:', error);
      throw new Error(`Failed to schedule Facebook Live: ${error.message}`);
    }
  }

  /**
   * Delete a scheduled Facebook Live stream
   * @param {string} streamId - The stream ID to delete
   * @returns {Promise<Object>} Deletion response
   */
  async deleteScheduledStream(streamId) {
    try {
      const response = await fetch(`${this.baseURL}/api/facebook/live/schedule/${streamId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        }
      });

      const data = await handleResponse(response);
      console.log('Scheduled Facebook Live stream deleted');
      return data;
    } catch (error) {
      console.error('Error deleting scheduled Facebook Live stream:', error);
      throw new Error(`Failed to delete scheduled Facebook Live: ${error.message}`);
    }
  }

  /**
   * Get comments for the current live stream
   * @param {string} streamId - The stream ID
   * @returns {Promise<Array>} Array of comments
   */
  async getStreamComments(streamId) {
    try {
      const response = await fetch(`${this.baseURL}/api/facebook/live/${streamId}/comments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        }
      });

      const data = await handleResponse(response);
      return data.comments || [];
    } catch (error) {
      console.error('Error getting Facebook Live comments:', error);
      throw new Error(`Failed to get Facebook Live comments: ${error.message}`);
    }
  }

  /**
   * Post a comment to the live stream
   * @param {string} streamId - The stream ID
   * @param {string} message - The comment message
   * @returns {Promise<Object>} Comment response
   */
  async postComment(streamId, message) {
    try {
      const response = await fetch(`${this.baseURL}/api/facebook/live/${streamId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({ message })
      });

      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error posting Facebook Live comment:', error);
      throw new Error(`Failed to post Facebook Live comment: ${error.message}`);
    }
  }
}

// Create and export the class directly for named export
export { FacebookService };

// Also export a singleton instance as default for backward compatibility
export const facebookService = new FacebookService();
export default facebookService;
