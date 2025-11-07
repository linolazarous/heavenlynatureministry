import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Components
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';

// New Refined Components
import BibleVerseSearch from '@/components/BibleVerseSearch';
import CountdownTimer from '@/components/CountdownTimer';
import DailyVerse from '@/components/DailyVerse';
import DonationForm from '@/components/DonationForm';
import EmailVerification from '@/components/EmailVerification';
import EventCalendar from '@/components/EventCalendar';
import LivestreamNotes from '@/components/LivestreamNotes';
import LivestreamOverlay from '@/components/LivestreamOverlay';
import LowerThirdGenerator from '@/components/LowerThirdGenerator';
import PasswordForm from '@/components/PasswordForm';
import ProfileForm from '@/components/ProfileForm';
import SimpleDonation from '@/components/SimpleDonation';
import Testimonials from '@/components/Testimonials';
import YouTubeEmbed from '@/components/YouTubeEmbed';

// Public Pages
import Home from '@/pages/Home';
import Profile from '@/pages/Profile';
import Livestream from '@/pages/Livestream';
import Success from '@/public/Success';
import Cancel from '@/public/Cancel';

// Admin Pages
import AdminHome from '@/admin/Home';
import AdminUsers from '@/admin/User';
import AdminLivestream from '@/admin/Livestream';
import AdminDonate from '@/admin/Donate';

// Public Donation Page
import Donate from '@/pages/Donate';

// Context
import { AuthProvider, useAuth } from '@/components/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" message="Checking authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <ErrorMessage 
            message="Admin Access Required"
            description="You need administrator privileges to access this page."
            severity="warning"
            showIcon
          />
        </div>
      </div>
    );
  }

  return children;
};

// Admin Layout Component
const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Ministry Admin</h2>
          <p>Heavenly Nature Ministry</p>
        </div>
        <nav className="sidebar-nav">
          <a href="/admin" className="nav-item">
            <i className="fas fa-tachometer-alt"></i>
            Dashboard
          </a>
          <a href="/admin/users" className="nav-item">
            <i className="fas fa-users"></i>
            User Management
          </a>
          <a href="/admin/livestream" className="nav-item">
            <i className="fas fa-broadcast-tower"></i>
            Livestream Control
          </a>
          <a href="/admin/donate" className="nav-item">
            <i className="fas fa-donate"></i>
            Donation Management
          </a>
          <a href="/admin/events" className="nav-item">
            <i className="fas fa-calendar-alt"></i>
            Event Management
          </a>
          <a href="/" className="nav-item">
            <i className="fas fa-home"></i>
            Back to Site
          </a>
        </nav>
      </div>
      <div className="admin-content">
        {children}
      </div>
    </div>
  );
};

// Custom hook for livestream schedule
const useLivestreamSchedule = () => {
  const [livestreamActive, setLivestreamActive] = useState(false);
  const [nextStream, setNextStream] = useState(null);

  const checkLivestreamSchedule = useCallback(() => {
    try {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Sunday Service 10AM CAT (8AM UTC) - Extended to 2 hours
      const isLivestreamTime = day === 0 && hours === 8 && minutes >= 0 && minutes <= 120;
      setLivestreamActive(isLivestreamTime);

      // Calculate next stream time
      const nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + (7 - now.getDay()));
      nextSunday.setHours(8, 0, 0, 0);
      setNextStream(nextSunday);
    } catch (error) {
      console.error('Error checking livestream schedule:', error);
      setLivestreamActive(false);
    }
  }, []);

  useEffect(() => {
    checkLivestreamSchedule();
    const timer = setInterval(checkLivestreamSchedule, 60000); // Check every minute

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [checkLivestreamSchedule]);

  return { livestreamActive, nextStream };
};

// Custom hook for app initialization
const useAppInitialization = () => {
  const [state, setState] = useState({
    loading: true,
    error: null,
    essentialData: null,
    maintenanceMode: false
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const initializeApp = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });

      // Simulate essential data loading
      const [configResponse, maintenanceResponse] = await Promise.all([
        // fetch('/api/config').then(res => res.json()),
        // fetch('/api/maintenance-status').then(res => res.json()),
        new Promise(resolve => setTimeout(() => resolve({
          ministryName: 'Heavenly Nature Ministry',
          version: '1.0.0',
          features: {
            livestream: true,
            donations: true,
            events: true
          }
        }), 800)),
        new Promise(resolve => setTimeout(() => resolve({ active: false }), 500))
      ]);

      if (maintenanceResponse.active) {
        updateState({ 
          maintenanceMode: true,
          loading: false 
        });
        return;
      }

      updateState({ 
        loading: false,
        essentialData: configResponse,
        maintenanceMode: false
      });
    } catch (err) {
      console.error('App initialization failed:', err);
      updateState({ 
        error: err.message || 'Failed to load application. Please refresh the page.',
        loading: false 
      });
    }
  }, [updateState]);

  return {
    ...state,
    initializeApp
  };
};

// Component to handle AOS refresh on route changes
const AOSRouteHandler = () => {
  const location = useLocation();

  useEffect(() => {
    try {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        AOS.refresh();
      }, 100);
    } catch (error) {
      console.error('Error refreshing AOS:', error);
    }
  }, [location.pathname]);

  return null;
};

// Maintenance Mode Component
const MaintenanceMode = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <div className="mb-6">
          <i className="fas fa-tools text-4xl text-blue-600 mb-4"></i>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Maintenance Mode
          </h1>
          <p className="text-gray-600">
            Heavenly Nature Ministry is currently undergoing maintenance. 
            We'll be back online shortly. Thank you for your patience.
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            For urgent matters, please contact us at:<br />
            <a href="tel:+211926006202" className="font-semibold">+211 926 006 202</a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Error Boundary Component
const AppErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event) => {
      console.error('App error caught:', event.error);
      setHasError(true);
    };

    const handleRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <ErrorMessage 
            message={
              <div>
                <h2 className="text-xl font-bold mb-2">Application Error</h2>
                <p>Something went wrong. Please refresh the page or try again later.</p>
              </div>
            }
            onRetry={() => window.location.reload()}
            severity="error"
            showIcon
          />
        </div>
      </div>
    );
  }

  return children;
};

const AppContent = () => {
  const { livestreamActive, nextStream } = useLivestreamSchedule();
  const { loading, error, essentialData, maintenanceMode, initializeApp } = useAppInitialization();

  // Initialize AOS animations
  useEffect(() => {
    try {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false,
        offset: 50,
        delay: 100,
        disable: window.innerWidth < 768, // Disable on mobile for performance
        startEvent: 'DOMContentLoaded'
      });
    } catch (error) {
      console.error('Error initializing AOS:', error);
    }

    return () => {
      try {
        AOS.refresh();
      } catch (error) {
        console.error('Error cleaning up AOS:', error);
      }
    };
  }, []);

  // Initialize app on mount
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Maintenance mode
  if (maintenanceMode) {
    return <MaintenanceMode />;
  }

  if (loading) {
    return (
      <LoadingSpinner 
        fullScreen 
        message="Loading Heavenly Nature Ministry..." 
        size="large"
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6">
          <ErrorMessage 
            message={error}
            onRetry={initializeApp}
            severity="error"
            showIcon
            retryText="Try Again"
          />
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <AOSRouteHandler />
      
      {/* Global Livestream Status Banner */}
      {livestreamActive && (
        <div className="bg-red-600 text-white py-2 px-4 text-center">
          <div className="container mx-auto flex items-center justify-center">
            <span className="animate-pulse mr-2">🔴 LIVE</span>
            <span>Sunday Service is currently streaming!</span>
            <a 
              href="/livestream" 
              className="ml-4 bg-white text-red-600 px-3 py-1 rounded text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Watch Now
            </a>
          </div>
        </div>
      )}

      <div className="app min-h-screen flex flex-col">
        {/* Public Header for non-admin routes */}
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<Header livestreamActive={livestreamActive} nextStream={nextStream} />} />
        </Routes>
        
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <Home 
                  livestreamActive={livestreamActive}
                  nextStream={nextStream}
                  components={{
                    Testimonials,
                    DailyVerse,
                    SimpleDonation,
                    EventCalendar,
                    YouTubeEmbed
                  }}
                />
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile 
                    components={{
                      ProfileForm,
                      PasswordForm,
                      EmailVerification
                    }}
                  />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/livestream" 
              element={
                <Livestream 
                  livestreamActive={livestreamActive}
                  components={{
                    YouTubeEmbed,
                    LivestreamOverlay,
                    LivestreamNotes,
                    BibleVerseSearch,
                    CountdownTimer,
                    LowerThirdGenerator
                  }}
                />
              } 
            />
            
            <Route 
              path="/donate" 
              element={
                <Donate 
                  components={{
                    DonationForm,
                    SimpleDonation
                  }}
                />
              } 
            />
            
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />

            {/* Additional Public Ministry Routes */}
            <Route 
              path="/events" 
              element={
                <div className="min-h-screen py-8">
                  <div className="container mx-auto px-4">
                    <EventCalendar />
                  </div>
                </div>
              } 
            />
            
            <Route 
              path="/testimonials" 
              element={
                <div className="min-h-screen py-8">
                  <div className="container mx-auto px-4">
                    <Testimonials />
                  </div>
                </div>
              } 
            />
            
            <Route 
              path="/daily-verse" 
              element={
                <div className="min-h-screen py-8">
                  <div className="container mx-auto px-4 max-w-2xl">
                    <DailyVerse />
                  </div>
                </div>
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminHome />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminUsers />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/livestream" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminLivestream />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/donate" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <AdminDonate />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/events" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold mb-6">Event Management</h1>
                      <EventCalendar adminMode={true} />
                    </div>
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />

            {/* 404 Fallback */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center p-8">
                    <h1 className="text-4xl font-bold mb-4 text-gray-800">404</h1>
                    <p className="text-xl mb-8 text-gray-600">Page not found</p>
                    <div className="space-x-4">
                      <a 
                        href="/" 
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                      >
                        Return Home
                      </a>
                      <a 
                        href="/admin" 
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
                      >
                        Admin Dashboard
                      </a>
                    </div>
                  </div>
                </div>
              } 
            />
          </Routes>
        </main>

        {/* Public Footer for non-admin routes */}
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<Footer />} />
        </Routes>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AppErrorBoundary>
  );
};

export default App;