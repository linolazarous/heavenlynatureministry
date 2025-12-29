import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user_token');
    
    // For user routes, add JWT token
    if (token && !config.url.includes('/auth/admin/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear user auth on 401
      if (localStorage.getItem('user_token')) {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user');
        
        // Only redirect if not on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
