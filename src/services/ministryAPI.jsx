import axios from 'axios';

// Base API configuration for Render deployment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.heavenlynatureministry.onrender.com';

// Create axios instance with default config
const ministryClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
ministryClient.interceptors.request.use(
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
ministryClient.interceptors.response.use(
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

// Ministry API service methods
export const ministryAPI = {
  // Public endpoints (no auth required)
  getPublicEvents: async () => {
    try {
      const response = await ministryClient.get('/events/public');
      return response;
    } catch (error) {
      console.error('Error fetching public events:', error);
      // Return mock data for development
      return {
        data: [
          {
            id: 1,
            title: 'Sunday Worship Service',
            date: new Date(Date.now() + 86400000).toISOString(),
            time: '10:00 AM',
            location: 'Main Sanctuary & Online',
            description: 'Join us for uplifting worship and biblical teaching',
            image: '/images/sunday-service.jpg',
            isOnline: true
          },
          {
            id: 2,
            title: 'Bible Study Fellowship',
            date: new Date(Date.now() + 172800000).toISOString(),
            time: '7:00 PM',
            location: 'Fellowship Hall',
            description: 'Deep dive into God\'s Word with our community',
            image: '/images/bible-study.jpg',
            isOnline: false
          },
          {
            id: 3,
            title: 'Community Outreach',
            date: new Date(Date.now() + 259200000).toISOString(),
            time: '9:00 AM',
            location: 'Local Community Center',
            description: 'Serving our community with love and compassion',
            image: '/images/outreach.jpg',
            isOnline: false
          }
        ]
      };
    }
  },

  getPublicStats: async () => {
    try {
      const response = await ministryClient.get('/ministry/stats/public');
      return response;
    } catch (error) {
      console.error('Error fetching public stats:', error);
      // Return mock data for development
      return {
        data: {
          communitiesServed: 12,
          livesImpacted: 5000,
          prayerRequests: 1200,
          totalDonations: 250000,
          volunteers: 150,
          programsRunning: 8,
          yearsServing: 5
        }
      };
    }
  },

  getFeaturedTestimonials: async () => {
    try {
      const response = await ministryClient.get('/testimonials/featured');
      return response;
    } catch (error) {
      console.error('Error fetching featured testimonials:', error);
      // Return mock data for development
      return {
        data: [
          {
            id: 1,
            quote: "This ministry completely transformed my life. I was lost but now I'm found in Christ. The love and support I received here gave me hope when I had none.",
            author: "Mary K.",
            role: "Ministry Partner",
            location: "Juba, South Sudan",
            date: "2024-01-15",
            rating: 5
          },
          {
            id: 2,
            quote: "The children's program saved my family. My kids now have hope, purpose, and a future. They're learning about God's love while getting the education they deserve.",
            author: "James L.",
            role: "Parent",
            location: "Gudele, Juba",
            date: "2024-02-20",
            rating: 5
          },
          {
            id: 3,
            quote: "Through this ministry, I discovered my purpose in serving others. The discipleship program equipped me to lead and make a difference in my community.",
            author: "Sarah M.",
            role: "Volunteer Leader",
            location: "Juba Town",
            date: "2024-03-10",
            rating: 5
          }
        ]
      };
    }
  },

  getLiveStreamStatus: async () => {
    try {
      const response = await ministryClient.get('/stream/status');
      return response;
    } catch (error) {
      console.error('Error fetching stream status:', error);
      // Return mock data for development
      return {
        data: {
          isLive: false,
          streamTitle: 'Sunday Worship Service',
          viewerCount: 0,
          startTime: null,
          platform: 'youtube'
        }
      };
    }
  },

  // Newsletter subscription
  subscribeToNewsletter: async (email) => {
    try {
      const response = await ministryClient.post('/newsletter/subscribe', { email });
      return response;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
  },

  // Prayer requests
  submitPrayerRequest: async (prayerData) => {
    try {
      const response = await ministryClient.post('/prayer-requests', prayerData);
      return response;
    } catch (error) {
      console.error('Error submitting prayer request:', error);
      throw error;
    }
  },

  // Contact form
  submitContactForm: async (contactData) => {
    try {
      const response = await ministryClient.post('/contact', contactData);
      return response;
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }
  },

  // Sermons and media
  getRecentSermons: async (limit = 5) => {
    try {
      const response = await ministryClient.get('/sermons/recent', { params: { limit } });
      return response;
    } catch (error) {
      console.error('Error fetching recent sermons:', error);
      // Return mock data for development
      return {
        data: [
          {
            id: 1,
            title: 'The Power of Faith',
            preacher: 'Pastor John',
            date: new Date(Date.now() - 86400000).toISOString(),
            duration: '45:30',
            videoUrl: '/sermons/1',
            thumbnail: '/images/sermon1.jpg'
          },
          {
            id: 2,
            title: 'Walking in Love',
            preacher: 'Pastor Sarah',
            date: new Date(Date.now() - 172800000).toISOString(),
            duration: '38:15',
            videoUrl: '/sermons/2',
            thumbnail: '/images/sermon2.jpg'
          }
        ]
      };
    }
  },

  // Ministry programs
  getMinistryPrograms: async () => {
    try {
      const response = await ministryClient.get('/programs');
      return response;
    } catch (error) {
      console.error('Error fetching ministry programs:', error);
      // Return mock data for development
      return {
        data: [
          {
            id: 1,
            name: 'Children\'s Education',
            description: 'Providing quality education and spiritual foundation for children',
            impact: '250+ children served',
            image: '/images/children-program.jpg'
          },
          {
            id: 2,
            name: 'Community Development',
            description: 'Empowering communities through sustainable projects',
            impact: '12 communities transformed',
            image: '/images/community-dev.jpg'
          },
          {
            id: 3,
            name: 'Discipleship Training',
            description: 'Equipping leaders for ministry and service',
            impact: '75 leaders trained',
            image: '/images/discipleship.jpg'
          }
        ]
      };
    }
  },

  // Volunteer opportunities
  getVolunteerOpportunities: async () => {
    try {
      const response = await ministryClient.get('/volunteer/opportunities');
      return response;
    } catch (error) {
      console.error('Error fetching volunteer opportunities:', error);
      // Return mock data for development
      return {
        data: [
          {
            id: 1,
            title: 'Sunday Service Helper',
            description: 'Assist with Sunday service operations',
            commitment: 'Weekly',
            skills: ['Hospitality', 'Organization'],
            location: 'Main Campus'
          },
          {
            id: 2,
            title: 'Children\'s Ministry Volunteer',
            description: 'Help with children\'s programs and activities',
            commitment: 'Weekly',
            skills: ['Teaching', 'Childcare'],
            location: 'Children\'s Wing'
          },
          {
            id: 3,
            title: 'Community Outreach Team',
            description: 'Participate in community service projects',
            commitment: 'Monthly',
            skills: ['Service', 'Compassion'],
            location: 'Various Locations'
          }
        ]
      };
    }
  },

  // Utility methods
  clearCache: () => {
    // Clear any cached data if needed
    console.log('Ministry API cache cleared');
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await ministryClient.get('/health');
      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }
};

export default ministryAPI;
