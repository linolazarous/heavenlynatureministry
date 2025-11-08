// src/App.jsx
import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Core Components
const Header = lazy(() => import('./components/Header.jsx'));
const Footer = lazy(() => import('./components/Footer.jsx'));
const ScrollToTop = lazy(() => import('./components/ScrollToTop.jsx'));
const AuthProvider = lazy(() => import('./components/AuthContext.jsx'));

// Public Pages
const Home = lazy(() => import('./pages/Home.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Livestream = lazy(() => import('./pages/Livestream.jsx'));
const Donate = lazy(() => import('./pages/Donate.jsx'));
const Success = lazy(() => import('./public/Success.jsx'));
const Cancel = lazy(() => import('./public/Cancel.jsx'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'));
const Terms = lazy(() => import('./pages/Terms.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));

// Admin Pages
const AdminHome = lazy(() => import('./admin/Home.jsx'));
const AdminUsers = lazy(() => import('./admin/User.jsx'));
const AdminLivestream = lazy(() => import('./admin/Livestream.jsx'));
const AdminDonate = lazy(() => import('./admin/Donate.jsx'));

// Reusable Loading Fallback
const LoadingFallback = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  </div>
);

// Error Boundary Component
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but something went wrong. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [authState, setAuthState] = useState({ 
    user: null, 
    isAuthenticated: false, 
    isLoading: true 
  });

  useEffect(() => {
    // Simulate auth check - replace with actual authentication logic
    const checkAuth = async () => {
      try {
        // TODO: Replace with actual authentication check
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAuthState({
          user: { role: 'user' }, // Default to user role
          isAuthenticated: false, // Set to true when auth is implemented
          isLoading: false,
        });
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkAuth();
  }, []);

  if (authState.isLoading) {
    return <LoadingFallback message="Checking authentication..." />;
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && authState.user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center max-w-sm">
          <div className="text-yellow-600 text-4xl mb-3">🔒</div>
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Admin Access Required</h3>
          <p className="text-yellow-700 text-sm">
            You need administrator privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

// Admin Layout Component
const AdminLayout = ({ children }) => (
  <div className="flex min-h-screen bg-gray-100">
    <div className="w-64 bg-white shadow-lg flex-shrink-0">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Ministry Admin</h2>
        <p className="text-sm text-gray-600 mt-1">Heavenly Nature Ministry</p>
      </div>
      <nav className="p-4 space-y-2">
        {[
          { href: "/admin", icon: "📊", label: "Dashboard" },
          { href: "/admin/users", icon: "👥", label: "User Management" },
          { href: "/admin/livestream", icon: "📺", label: "Livestream Control" },
          { href: "/admin/donate", icon: "💰", label: "Donation Management" },
          { href: "/", icon: "🏠", label: "Back to Site" }
        ].map(item => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
    <div className="flex-1 overflow-auto">
      <div className="p-6 md:p-8">{children}</div>
    </div>
  </div>
);

// Livestream Schedule Hook
const useLivestreamSchedule = () => {
  const [livestreamActive, setLivestreamActive] = useState(false);
  const [nextStream, setNextStream] = useState(null);

  const checkLivestream = useCallback(() => {
    try {
      const now = new Date();
      const isSunday = now.getDay() === 0;
      const hourUTC = now.getUTCHours();
      const minute = now.getMinutes();
      
      // Sunday 8:00-10:00 UTC (10:00-12:00 CAT)
      const active = isSunday && hourUTC === 8 && minute <= 120;
      setLivestreamActive(active);

      // Calculate next stream time
      const nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + (7 - now.getDay()));
      nextSunday.setUTCHours(8, 0, 0, 0);
      setNextStream(nextSunday);
    } catch (error) {
      console.error('Error checking livestream schedule:', error);
    }
  }, []);

  useEffect(() => {
    checkLivestream();
    const interval = setInterval(checkLivestream, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkLivestream]);

  return { livestreamActive, nextStream };
};

// AOS Handler Component
const AOSHandler = () => {
  const location = useLocation();
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        AOS.refresh();
      } catch (error) {
        console.warn('AOS refresh failed:', error);
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return null;
};

// Maintenance Mode Component
const MaintenanceMode = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="text-center max-w-md">
      <div className="text-6xl mb-6">🔧</div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Maintenance Mode</h1>
      <p className="text-gray-600 mb-6 text-lg">
        We're currently performing scheduled maintenance. We'll be back online shortly.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          Thank you for your patience and understanding.
        </p>
      </div>
    </div>
  </div>
);

// 404 Component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="text-center max-w-md">
      <h1 className="text-8xl font-bold text-gray-300 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <a
        href="/"
        className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
      >
        Return Home
      </a>
    </div>
  </div>
);

// Main App Content Component
const AppContent = () => {
  const { livestreamActive, nextStream } = useLivestreamSchedule();
  const [maintenanceMode] = useState(false); // Set to true for maintenance

  useEffect(() => {
    const initializeAOS = () => {
      try {
        AOS.init({
          duration: 800,
          easing: 'ease-in-out',
          once: true,
          mirror: false,
          offset: 50,
          disable: window.innerWidth < 768,
        });
      } catch (error) {
        console.warn('AOS initialization failed:', error);
      }
    };

    // Delay AOS initialization for better performance
    const timeout = setTimeout(initializeAOS, 100);
    return () => clearTimeout(timeout);
  }, []);

  if (maintenanceMode) {
    return <MaintenanceMode />;
  }

  return (
    <Router>
      <Suspense fallback={<LoadingFallback message="Loading ministry app..." />}>
        <ScrollToTop />
        <AOSHandler />

        {/* Livestream Banner */}
        {livestreamActive && (
          <div className="bg-red-600 text-white py-3 px-4 text-center">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                LIVE NOW – Sunday Service Streaming
              </span>
              <a 
                href="/livestream" 
                className="underline font-semibold hover:no-underline"
              >
                Watch Now
              </a>
            </div>
          </div>
        )}

        {/* Conditional Header */}
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route 
            path="*" 
            element={
              <Header 
                livestreamActive={livestreamActive} 
                nextStream={nextStream} 
              />
            } 
          />
        </Routes>

        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <Home 
                  livestreamActive={livestreamActive} 
                  nextStream={nextStream} 
                />
              } 
            />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/livestream" element={
              <Livestream livestreamActive={livestreamActive} />
            } />
            <Route path="/donate" element={<Donate />} />
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminHome />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/livestream" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminLivestream />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/donate" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <AdminDonate />
                </AdminLayout>
              </ProtectedRoute>
            } />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Conditional Footer */}
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<Footer />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

// Main App Component
const App = () => (
  <AppErrorBoundary>
    <Suspense fallback={<LoadingFallback message="Initializing ministry app..." />}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Suspense>
  </AppErrorBoundary>
);

export default App;
