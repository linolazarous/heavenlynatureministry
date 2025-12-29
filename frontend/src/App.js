import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import Home from '@/pages/Home';
import About from '@/pages/About';
import Sermons from '@/pages/Sermons';
import SermonDetail from '@/pages/SermonDetail';
import Events from '@/pages/Events';
import EventDetail from '@/pages/EventDetail';
import Blog from '@/pages/Blog';
import BlogDetail from '@/pages/BlogDetail';
import Donate from '@/pages/Donate';
import Contact from '@/pages/Contact';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminLogin from '@/pages/AdminLogin';
import AdminSermons from '@/pages/admin/AdminSermons';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminBlogs from '@/pages/admin/AdminBlogs';
import AdminDonations from '@/pages/admin/AdminDonations';
import AdminContacts from '@/pages/admin/AdminContacts';

// Axios setup
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';

// Configure axios base URL
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
axios.defaults.baseURL = BACKEND_URL;

// Add request interceptor to include JWT token
axios.interceptors.request.use(
  (config) => {
    // For admin routes, get session token from cookie or localStorage
    const isAdminRoute = config.url?.includes('/admin/') || 
                        config.url === '/api/auth/admin/login' ||
                        config.url === '/api/auth/check';
    
    if (isAdminRoute) {
      // Try to get session token from localStorage (set by AdminLogin)
      const sessionToken = localStorage.getItem('admin_session_token');
      if (sessionToken) {
        config.headers['Authorization'] = `Bearer ${sessionToken}`;
      }
    } else {
      // For regular user routes, get JWT token
      const token = localStorage.getItem('user_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (window.location.pathname.includes('/admin')) {
        // Clear admin session
        localStorage.removeItem('admin_session_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login';
      } else {
        // Clear user session
        localStorage.removeItem('user_token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

// Health check component
const HealthCheck = () => {
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get('/api/health');
        console.log('Backend health status:', response.data);
      } catch (error) {
        console.error('Backend health check failed:', error);
      }
    };
    checkHealth();
  }, []);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App flex flex-col min-h-screen">
          <HealthCheck />
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/sermons" element={<Sermons />} />
              <Route path="/sermons/:id" element={<SermonDetail />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* User Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/sermons" element={
                <ProtectedRoute adminOnly>
                  <AdminSermons />
                </ProtectedRoute>
              } />
              <Route path="/admin/events" element={
                <ProtectedRoute adminOnly>
                  <AdminEvents />
                </ProtectedRoute>
              } />
              <Route path="/admin/blogs" element={
                <ProtectedRoute adminOnly>
                  <AdminBlogs />
                </ProtectedRoute>
              } />
              <Route path="/admin/donations" element={
                <ProtectedRoute adminOnly>
                  <AdminDonations />
                </ProtectedRoute>
              } />
              <Route path="/admin/contacts" element={
                <ProtectedRoute adminOnly>
                  <AdminContacts />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <Toaster />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
