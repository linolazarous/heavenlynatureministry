import axios from "axios";

/**
 * Vite environment variables MUST:
 * 1. Start with VITE_
 * 2. Be accessed via import.meta.env
 *
 * Example in .env:
 * VITE_BACKEND_URL=https://api.yourdomain.com
 */

// Production backend URL - this should be set in your .env.production file
// Default to your deployed Render backend
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://hnmbackend-gedp.onrender.com/api";

if (!BACKEND_URL) {
  console.error(
    "❌ VITE_BACKEND_URL is not defined. Check your .env file."
  );
}

console.log("🌐 API Configuration:", {
  backendUrl: BACKEND_URL,
  env: import.meta.env.MODE,
  nodeEnv: import.meta.env.VITE_APP_ENV
});

export const API = `${BACKEND_URL}/api`;

// Create axios instance with proper configuration
export const api = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  timeout: 30000, // 30 seconds timeout
  withCredentials: false, // Set to true if using cookies/sessions
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or wherever you store it
    const token = localStorage.getItem("access_token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging (remove in production)
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
    }
    
    return config;
  },
  (error) => {
    console.error('📤 Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
api.interceptors.response.use(
  (response) => {
    // Log response for debugging (remove in production)
    if (import.meta.env.DEV) {
      console.log(`📥 Response ${response.status}:`, response.data);
    }
    return response;
  },
  (error) => {
    const { response } = error;
    
    // Handle different error scenarios
    if (!response) {
      // Network error
      console.error('🌐 Network Error:', error.message);
      throw new Error("Network error. Please check your internet connection.");
    }
    
    const { status, data } = response;
    
    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        console.error('🔐 Unauthorized access');
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        // Optional: Redirect to login page
        // window.location.href = '/login';
        break;
        
      case 403:
        console.error('🚫 Forbidden access');
        break;
        
      case 404:
        console.error('🔍 Resource not found');
        break;
        
      case 422:
        console.error('📝 Validation error:', data);
        break;
        
      case 500:
        console.error('💥 Server error');
        break;
        
      default:
        console.error(`❌ HTTP ${status}:`, data);
    }
    
    // Return a consistent error format
    return Promise.reject({
      status,
      message: data?.error || data?.message || "An error occurred",
      details: data?.details || null,
      timestamp: new Date().toISOString()
    });
  }
);

// Test API connection
export const testConnection = async () => {
  try {
    const response = await api.get("/health");
    console.log("✅ API Connection successful:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ API Connection failed:", error);
    return { 
      success: false, 
      error: error.message || "Failed to connect to API",
      details: error 
    };
  }
};

/* ================================
   Auth Endpoints
================================ */
export const login = async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

export const register = async (userData) => {
  const { data } = await api.post("/auth/register", userData);
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const refreshToken = async (refreshToken) => {
  const { data } = await api.post("/auth/refresh", { refresh_token: refreshToken });
  return data;
};

/* ================================
   Sermons
================================ */
export const getSermons = async (skip = 0, limit = 20) => {
  const { data } = await api.get(
    `/sermons?skip=${skip}&limit=${limit}`
  );
  return data;
};

export const getSermonById = async (id) => {
  const { data } = await api.get(`/sermons/${id}`);
  return data;
};

export const createSermon = async (sermonData) => {
  const { data } = await api.post("/sermons", sermonData);
  return data;
};

export const updateSermon = async (id, sermonData) => {
  const { data } = await api.put(`/sermons/${id}`, sermonData);
  return data;
};

export const deleteSermon = async (id) => {
  const { data } = await api.delete(`/sermons/${id}`);
  return data;
};

/* ================================
   Events
================================ */
export const getEvents = async (
  skip = 0,
  limit = 20,
  upcoming = true
) => {
  const { data } = await api.get(
    `/events?skip=${skip}&limit=${limit}&upcoming=${upcoming}`
  );
  return data;
};

export const getEventById = async (id) => {
  const { data } = await api.get(`/events/${id}`);
  return data;
};

export const createEvent = async (eventData) => {
  const { data } = await api.post("/events", eventData);
  return data;
};

export const updateEvent = async (id, eventData) => {
  const { data } = await api.put(`/events/${id}`, eventData);
  return data;
};

export const deleteEvent = async (id) => {
  const { data } = await api.delete(`/events/${id}`);
  return data;
};

export const createRSVP = async (eventId, rsvpData) => {
  const { data } = await api.post(
    `/events/${eventId}/rsvp`,
    rsvpData
  );
  return data;
};

export const getEventRSVPs = async (eventId) => {
  const { data } = await api.get(`/events/${eventId}/rsvps`);
  return data;
};

/* ================================
   Donations
================================ */
export const createDonationCheckout = async (donationData) => {
  const { data } = await api.post(
    "/donations/checkout",
    donationData,
    {
      headers: {
        Origin: window.location.origin,
      },
    }
  );
  return data;
};

export const getDonationStatus = async (sessionId) => {
  const { data } = await api.get(
    `/donations/status/${sessionId}`
  );
  return data;
};

export const getDonations = async (skip = 0, limit = 20) => {
  const { data } = await api.get(`/donations?skip=${skip}&limit=${limit}`);
  return data;
};

export const getDonationStats = async () => {
  const { data } = await api.get("/donations/stats");
  return data;
};

/* ================================
   Prayers
================================ */
export const createPrayerRequest = async (prayerData) => {
  const { data } = await api.post(
    "/prayers",
    prayerData
  );
  return data;
};

export const getPrayers = async (skip = 0, limit = 20) => {
  const { data } = await api.get(
    `/prayers?skip=${skip}&limit=${limit}&public_only=true`
  );
  return data;
};

export const getPrayerById = async (id) => {
  const { data } = await api.get(`/prayers/${id}`);
  return data;
};

export const updatePrayer = async (id, prayerData) => {
  const { data } = await api.put(`/prayers/${id}`, prayerData);
  return data;
};

export const markPrayerAsAnswered = async (id, testimony) => {
  const { data } = await api.post(`/prayers/${id}/answered`, { testimony });
  return data;
};

/* ================================
   Volunteers
================================ */
export const createVolunteer = async (volunteerData) => {
  const { data } = await api.post(
    "/volunteers",
    volunteerData
  );
  return data;
};

export const getVolunteers = async (skip = 0, limit = 20) => {
  const { data } = await api.get(`/volunteers?skip=${skip}&limit=${limit}`);
  return data;
};

export const getVolunteerById = async (id) => {
  const { data } = await api.get(`/volunteers/${id}`);
  return data;
};

export const updateVolunteerStatus = async (id, status, notes = "") => {
  const { data } = await api.put(`/volunteers/${id}/status`, { status, notes });
  return data;
};

/* ================================
   Blog
================================ */
export const getBlogPosts = async (skip = 0, limit = 20) => {
  const { data } = await api.get(
    `/blog?skip=${skip}&limit=${limit}`
  );
  return data;
};

export const getBlogPostBySlug = async (slug) => {
  const { data } = await api.get(`/blog/${slug}`);
  return data;
};

export const createBlogPost = async (postData) => {
  const { data } = await api.post("/blog", postData);
  return data;
};

export const updateBlogPost = async (id, postData) => {
  const { data } = await api.put(`/blog/${id}`, postData);
  return data;
};

export const deleteBlogPost = async (id) => {
  const { data } = await api.delete(`/blog/${id}`);
  return data;
};

/* ================================
   Resources
================================ */
export const getResources = async (
  skip = 0,
  limit = 50,
  category = null
) => {
  let url = `/resources?skip=${skip}&limit=${limit}`;
  if (category) url += `&category=${category}`;

  const { data } = await api.get(url);
  return data;
};

export const getResourceById = async (id) => {
  const { data } = await api.get(`/resources/${id}`);
  return data;
};

export const createResource = async (resourceData) => {
  const { data } = await api.post("/resources", resourceData);
  return data;
};

export const updateResource = async (id, resourceData) => {
  const { data } = await api.put(`/resources/${id}`, resourceData);
  return data;
};

export const deleteResource = async (id) => {
  const { data } = await api.delete(`/resources/${id}`);
  return data;
};

export const incrementDownloadCount = async (id) => {
  const { data } = await api.post(`/resources/${id}/download`);
  return data;
};

/* ================================
   Livestream
================================ */
export const getCurrentLivestream = async () => {
  const { data } = await api.get(
    "/livestream/current"
  );
  return data;
};

export const getLivestreams = async (skip = 0, limit = 20) => {
  const { data } = await api.get(`/livestream?skip=${skip}&limit=${limit}`);
  return data;
};

export const getLivestreamById = async (id) => {
  const { data } = await api.get(`/livestream/${id}`);
  return data;
};

export const createLivestream = async (streamData) => {
  const { data } = await api.post("/livestream", streamData);
  return data;
};

export const updateLivestream = async (id, streamData) => {
  const { data } = await api.put(`/livestream/${id}`, streamData);
  return data;
};

export const getChatMessages = async (streamId, skip = 0, limit = 100) => {
  const { data } = await api.get(`/livestream/${streamId}/chat?skip=${skip}&limit=${limit}`);
  return data;
};

export const sendChatMessage = async (streamId, messageData) => {
  const { data } = await api.post(`/livestream/${streamId}/chat`, messageData);
  return data;
};

/* ================================
   Ministry Info
================================ */
export const getMinistryInfo = async () => {
  const { data } = await api.get(
    "/ministry/info"
  );
  return data;
};

export const updateMinistryInfo = async (infoData) => {
  const { data } = await api.put("/ministry/info", infoData);
  return data;
};

/* ================================
   Analytics & Admin
================================ */
export const getAnalytics = async () => {
  const { data } = await api.get("/admin/analytics");
  return data;
};

export const getDashboardStats = async () => {
  const { data } = await api.get("/admin/dashboard");
  return data;
};

export const getRecentActivity = async (limit = 10) => {
  const { data } = await api.get(`/admin/activity?limit=${limit}`);
  return data;
};

/* ================================
   File Upload
================================ */
export const uploadFile = async (file, type = "image") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const { data } = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

/* ================================
   Utility Functions
================================ */
export const formatError = (error) => {
  if (error.response) {
    return {
      message: error.response.data?.error || "An error occurred",
      details: error.response.data?.details,
      status: error.response.status,
    };
  }
  if (error.request) {
    return {
      message: "Network error. Please check your connection.",
      details: null,
      status: 0,
    };
  }
  return {
    message: error.message || "An unexpected error occurred",
    details: null,
    status: 0,
  };
};

// Initialize API test on module load (for debugging)
if (import.meta.env.DEV) {
  console.log("🚀 Initializing API module...");
  testConnection().then(result => {
    if (result.success) {
      console.log("✅ API initialized successfully");
    } else {
      console.warn("⚠️ API initialization warning:", result.error);
    }
  });
    }
