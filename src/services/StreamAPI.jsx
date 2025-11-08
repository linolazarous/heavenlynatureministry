// src/services/StreamAPI.jsx
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.heavenlynatureministry.com';

export const StreamAPI = {
  // Get current stream status
  async getStatus() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/stream/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stream status:', error);
      throw new Error('Failed to fetch stream status');
    }
  },

  // Get stream analytics
  async getAnalytics(streamId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/stream/${streamId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stream analytics:', error);
      throw new Error('Failed to fetch stream analytics');
    }
  },

  // Start a new stream (admin only)
  async startStream(streamData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/stream/start`, streamData);
      return response.data;
    } catch (error) {
      console.error('Error starting stream:', error);
      throw new Error('Failed to start stream');
    }
  },

  // Stop current stream (admin only)
  async stopStream(streamId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/stream/${streamId}/stop`);
      return response.data;
    } catch (error) {
      console.error('Error stopping stream:', error);
      throw new Error('Failed to stop stream');
    }
  },

  // Get stream schedule
  async getSchedule() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/stream/schedule`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stream schedule:', error);
      // Return default schedule
      return {
        regularStreams: [
          {
            day: 'Sunday',
            time: '10:00 AM - 1:00 PM',
            timezone: 'CAT',
            title: 'Sunday Worship Service',
            description: 'Weekly worship service with praise, prayer, and preaching'
          }
        ],
        specialStreams: []
      };
    }
  }
};

export default StreamAPI;
