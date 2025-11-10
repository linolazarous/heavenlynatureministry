// Add this to src/services/api.jsx after the other API services

// Ministry API service for admin dashboard
export const ministryAPI = {
  /**
   * Get ministry statistics for admin dashboard
   */
  async getMinistryStats() {
    try {
      const response = await apiClient.get('/api/admin/ministry/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching ministry stats:', error);
      // Return mock data for development
      return {
        totalMembers: 1247,
        activeMembers: 892,
        newMembersThisMonth: 45,
        eventsThisMonth: 12,
        totalDonations: 125000,
        monthlyDonations: 15000,
        prayerRequests: 23,
        volunteers: 156,
        growthRate: 12.5,
        engagementRate: 68.3
      };
    }
  },

  /**
   * Get dashboard overview data
   */
  async getDashboardOverview() {
    try {
      const response = await apiClient.get('/api/admin/dashboard/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      // Return mock data for development
      return {
        recentActivity: [
          {
            type: 'donation',
            user: 'John Smith',
            amount: 100,
            timestamp: new Date().toISOString(),
            description: 'One-time donation'
          },
          {
            type: 'registration',
            user: 'Sarah Johnson',
            event: 'Sunday Service',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            description: 'Registered for event'
          },
          {
            type: 'prayer',
            user: 'Michael Brown',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            description: 'Submitted prayer request'
          }
        ],
        upcomingEvents: [
          {
            id: '1',
            title: 'Sunday Worship Service',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            attendees: 150,
            capacity: 200
          },
          {
            id: '2',
            title: 'Bible Study',
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            attendees: 45,
            capacity: 60
          }
        ],
        systemStatus: {
          website: 'online',
          database: 'online',
          livestream: 'offline',
          email: 'online'
        }
      };
    }
  },

  /**
   * Get member growth analytics
   */
  async getMemberGrowth(timeframe = 'year') {
    try {
      const response = await apiClient.get('/api/admin/analytics/member-growth', {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching member growth:', error);
      // Return mock data for development
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        labels: months,
        datasets: [
          {
            label: 'New Members',
            data: [15, 22, 18, 25, 30, 28, 35, 40, 38, 45, 42, 50],
            borderColor: '#4a6fa5',
            backgroundColor: 'rgba(74, 111, 165, 0.1)'
          },
          {
            label: 'Total Members',
            data: [800, 822, 840, 865, 895, 923, 958, 998, 1036, 1081, 1123, 1173],
            borderColor: '#2a9d8f',
            backgroundColor: 'rgba(42, 157, 143, 0.1)'
          }
        ]
      };
    }
  },

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics() {
    try {
      const response = await apiClient.get('/api/admin/analytics/engagement');
      return response.data;
    } catch (error) {
      console.error('Error fetching engagement metrics:', error);
      // Return mock data for development
      return {
        attendanceRate: 68.5,
        donationParticipation: 42.3,
        eventParticipation: 35.7,
        volunteerParticipation: 28.9,
        prayerRequestRate: 15.2,
        averageSessionDuration: '12:45',
        pageViews: 12457,
        uniqueVisitors: 3241
      };
    }
  },

  /**
   * Get financial overview
   */
  async getFinancialOverview() {
    try {
      const response = await apiClient.get('/api/admin/financial/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching financial overview:', error);
      // Return mock data for development
      return {
        totalRevenue: 125000,
        monthlyRevenue: 15000,
        expenses: 85000,
        netIncome: 40000,
        revenueByCategory: [
          { category: 'Donations', amount: 100000, percentage: 80 },
          { category: 'Events', amount: 15000, percentage: 12 },
          { category: 'Merchandise', amount: 8000, percentage: 6.4 },
          { category: 'Other', amount: 2000, percentage: 1.6 }
        ],
        expenseBreakdown: [
          { category: 'Staff', amount: 45000, percentage: 52.9 },
          { category: 'Facilities', amount: 20000, percentage: 23.5 },
          { category: 'Outreach', amount: 12000, percentage: 14.1 },
          { category: 'Administrative', amount: 8000, percentage: 9.4 }
        ]
      };
    }
  },

  /**
   * Get recent activities
   */
  async getRecentActivities(limit = 10) {
    try {
      const response = await apiClient.get('/api/admin/activities/recent', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      // Return mock data for development
      return [
        {
          id: '1',
          type: 'donation',
          user: { name: 'John Smith', email: 'john@example.com' },
          amount: 100,
          timestamp: new Date().toISOString(),
          status: 'completed'
        },
        {
          id: '2',
          type: 'event_registration',
          user: { name: 'Sarah Johnson', email: 'sarah@example.com' },
          event: 'Sunday Service',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'confirmed'
        },
        {
          id: '3',
          type: 'prayer_request',
          user: { name: 'Michael Brown', email: 'michael@example.com' },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'new'
        },
        {
          id: '4',
          type: 'member_joined',
          user: { name: 'Emily Davis', email: 'emily@example.com' },
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        }
      ];
    }
  },

  /**
   * Get system health status
   */
  async getSystemHealth() {
    try {
      const response = await apiClient.get('/api/admin/system/health');
      return response.data;
    } catch (error) {
      console.error('Error fetching system health:', error);
      // Return mock data for development
      return {
        services: [
          { name: 'Website', status: 'healthy', uptime: 99.8, responseTime: 245 },
          { name: 'Database', status: 'healthy', uptime: 99.9, responseTime: 120 },
          { name: 'Email Service', status: 'healthy', uptime: 99.5, responseTime: 350 },
          { name: 'File Storage', status: 'healthy', uptime: 99.7, responseTime: 180 },
          { name: 'Payment Gateway', status: 'healthy', uptime: 99.9, responseTime: 280 }
        ],
        lastIncident: '2024-01-15T14:30:00Z',
        overallStatus: 'healthy'
      };
    }
  },

  /**
   * Send broadcast notification
   */
  async sendBroadcastNotification(notificationData) {
    try {
      const response = await apiClient.post('/api/admin/notifications/broadcast', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error sending broadcast notification:', error);
      throw new Error('Failed to send broadcast notification');
    }
  },

  /**
   * Get notification statistics
   */
  async getNotificationStats() {
    try {
      const response = await apiClient.get('/api/admin/notifications/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      // Return mock data for development
      return {
        totalSent: 1247,
        delivered: 1189,
        opened: 856,
        clickRate: 28.5,
        bounceRate: 2.1
      };
    }
  },

  /**
   * Update ministry settings
   */
  async updateMinistrySettings(settings) {
    try {
      const response = await apiClient.put('/api/admin/ministry/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating ministry settings:', error);
      throw new Error('Failed to update ministry settings');
    }
  },

  /**
   * Get ministry settings
   */
  async getMinistrySettings() {
    try {
      const response = await apiClient.get('/api/admin/ministry/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching ministry settings:', error);
      // Return mock data for development
      return {
        name: 'Heavenly Nature Ministry',
        contactEmail: 'info@heavenlynature.org',
        contactPhone: '+1-555-0123',
        address: {
          street: '123 Faith Avenue',
          city: 'Spiritual City',
          state: 'SC',
          zipCode: '12345',
          country: 'USA'
        },
        socialMedia: {
          facebook: 'https://facebook.com/heavenlynature',
          youtube: 'https://youtube.com/heavenlynature',
          instagram: 'https://instagram.com/heavenlynature'
        },
        livestreamSettings: {
          platform: 'youtube',
          autoStart: true,
          defaultTitle: 'Heavenly Nature Ministry Worship Service'
        },
        donationSettings: {
          currency: 'USD',
          minimumAmount: 1,
          paymentMethods: ['card', 'bank_transfer'],
          taxDeductible: true
        }
      };
    }
  }
};

// Also update the default export to include ministryAPI
export default {
  donation: donationAPI,
  admin: adminAPI,
  user: userAPI,
  event: eventAPI,
  auth: authAPI,
  ministry: ministryAPI, // Add this line
  client: apiClient
};
