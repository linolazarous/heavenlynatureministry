// src/services/eventService.jsx
import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.heavenlynatureministry.onrender.com';

// Event service
export const eventService = {
  // Get all events with optional filtering
  async getEvents(filters = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      // Return mock data for development
      return this.getMockEvents();
    }
  },

  // Get featured events (for homepage)
  async getFeaturedEvents() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events/featured`);
      return response.data;
    } catch (error) {
      console.error('Error fetching featured events:', error);
      return this.getMockEvents().filter(event => event.isFeatured);
    }
  },

  // Get single event by ID
  async getEventById(eventId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw new Error('Event not found');
    }
  },

  // Create new event (admin only)
  async createEvent(eventData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/events`, eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  },

  // Update event (admin only)
  async updateEvent(eventId, eventData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/admin/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
  },

  // Delete event (admin only)
  async deleteEvent(eventId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/admin/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete event');
    }
  },

  // Register for event
  async registerForEvent(eventId, registrationData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/events/${eventId}/register`, registrationData);
      return response.data;
    } catch (error) {
      console.error('Error registering for event:', error);
      throw new Error('Failed to register for event');
    }
  },

  // Get event registrations (admin only)
  async getEventRegistrations(eventId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/events/${eventId}/registrations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching registrations:', error);
      throw new Error('Failed to fetch registrations');
    }
  },

  // Get event categories
  async getEventCategories() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [
        { id: 'worship', name: 'Worship Service', color: '#1a4b8c' },
        { id: 'prayer', name: 'Prayer Meeting', color: '#2a9d8f' },
        { id: 'bible-study', name: 'Bible Study', color: '#e9c46a' },
        { id: 'community', name: 'Community Outreach', color: '#f4a261' },
        { id: 'youth', name: 'Youth Program', color: '#e76f51' },
        { id: 'special', name: 'Special Event', color: '#9d4edd' }
      ];
    }
  },

  // Search events
  async searchEvents(query, filters = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events/search`, {
        params: { q: query, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching events:', error);
      return this.getMockEvents().filter(event => 
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase())
      );
    }
  },

  // Get upcoming events
  async getUpcomingEvents(limit = 5) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events/upcoming`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      const now = new Date();
      return this.getMockEvents()
        .filter(event => new Date(event.date) > now)
        .slice(0, limit);
    }
  },

  // Get events by date range
  async getEventsByDateRange(startDate, endDate) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events/range`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return this.getMockEvents().filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= start && eventDate <= end;
      });
    }
  },

  // Mock data for development
  getMockEvents() {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return [
      {
        id: '1',
        title: 'Sunday Worship Service',
        description: 'Join us for our weekly Sunday worship service with praise, prayer, and preaching from God\'s Word.',
        date: nextWeek.toISOString(),
        time: '10:00 AM - 1:00 PM',
        location: 'Main Sanctuary',
        category: 'worship',
        isFeatured: true,
        image: '/images/events/worship-service.jpg',
        maxAttendees: 200,
        currentAttendees: 150,
        registrationRequired: false,
        cost: 0
      },
      {
        id: '2',
        title: 'Wednesday Prayer Meeting',
        description: 'Corporate prayer meeting for all church members and visitors.',
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        time: '6:00 PM - 7:30 PM',
        location: 'Prayer Room',
        category: 'prayer',
        isFeatured: false,
        image: '/images/events/prayer-meeting.jpg',
        maxAttendees: 50,
        currentAttendees: 25,
        registrationRequired: false,
        cost: 0
      },
      {
        id: '3',
        title: 'Bible Study: Book of Romans',
        description: 'Deep dive into the Book of Romans with Pastor John.',
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        time: '7:00 PM - 8:30 PM',
        location: 'Fellowship Hall',
        category: 'bible-study',
        isFeatured: true,
        image: '/images/events/bible-study.jpg',
        maxAttendees: 40,
        currentAttendees: 30,
        registrationRequired: true,
        cost: 0
      },
      {
        id: '4',
        title: 'Community Outreach Program',
        description: 'Serving the local community through food distribution and counseling.',
        date: nextMonth.toISOString(),
        time: '9:00 AM - 2:00 PM',
        location: 'Community Center',
        category: 'community',
        isFeatured: true,
        image: '/images/events/community-outreach.jpg',
        maxAttendees: 100,
        currentAttendees: 45,
        registrationRequired: true,
        cost: 0
      },
      {
        id: '5',
        title: 'Youth Night',
        description: 'Special evening for youth with games, worship, and relevant teaching.',
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        time: '6:30 PM - 9:00 PM',
        location: 'Youth Center',
        category: 'youth',
        isFeatured: false,
        image: '/images/events/youth-night.jpg',
        maxAttendees: 80,
        currentAttendees: 60,
        registrationRequired: false,
        cost: 5
      }
    ];
  },

  // Utility functions
  formatEventDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  isEventUpcoming(dateString) {
    return new Date(dateString) > new Date();
  },

  getEventStatus(event) {
    const now = new Date();
    const eventDate = new Date(event.date);
    
    if (eventDate < now) {
      return 'completed';
    } else if (event.currentAttendees >= event.maxAttendees) {
      return 'full';
    } else {
      return 'open';
    }
  }
};

// Mock service for development
export const mockEventService = {
  async getEvents(filters = {}) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    let events = eventService.getMockEvents();
    
    // Apply filters
    if (filters.category) {
      events = events.filter(event => event.category === filters.category);
    }
    
    if (filters.upcoming) {
      const now = new Date();
      events = events.filter(event => new Date(event.date) > now);
    }
    
    if (filters.featured) {
      events = events.filter(event => event.isFeatured);
    }
    
    return events;
  },

  async getFeaturedEvents() {
    await new Promise(resolve => setTimeout(resolve, 800));
    return eventService.getMockEvents().filter(event => event.isFeatured);
  },

  async registerForEvent(eventId, registrationData) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate random success/failure
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      return {
        success: true,
        registrationId: `reg_${Date.now()}`,
        message: 'Successfully registered for the event!'
      };
    } else {
      throw new Error('Registration failed. Please try again.');
    }
  }
};

// Export based on environment
export default process.env.NODE_ENV === 'production' ? eventService : mockEventService;
