// src/App.jsx
import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Core Components - Fixed import paths with error boundaries
const Header = lazy(() => import('./components/Header.jsx').catch(() => ({ default: () => <div>Header Loading...</div> })));
const Footer = lazy(() => import('./components/Footer.jsx').catch(() => ({ default: () => <div>Footer Loading...</div> })));
const ScrollToTop = lazy(() => import('./components/ScrollToTop.jsx').catch(() => ({ default: () => null })));
const ErrorMessage = lazy(() => import('./components/ErrorMessage.jsx').catch(() => ({ default: ({ message }) => <div>Error: {message}</div> })));
const LoadingSpinner = lazy(() => import('./components/LoadingSpinner.jsx').catch(() => ({ default: () => <div>Loading...</div> })));

// Lazy load non-critical components with error handling
const createLazyComponent = (importFunc, componentName) => 
  lazy(() => importFunc().catch(() => ({ 
    default: () => (
      <div className="p-4 text-center text-red-600">
        Failed to load {componentName}. Please refresh the page.
      </div>
    )
  })));

// Public Pages
const Home = createLazyComponent(() => import('./pages/Home.jsx'), 'Home');
const Profile = createLazyComponent(() => import('./pages/Profile.jsx'), 'Profile');
const Livestream = createLazyComponent(() => import('./pages/Livestream.jsx'), 'Livestream');
const Donate = createLazyComponent(() => import('./pages/Donate.jsx'), 'Donate');
const Success = createLazyComponent(() => import('./public/Success.jsx'), 'Success');
const Cancel = createLazyComponent(() => import('./public/Cancel.jsx'), 'Cancel');

// Admin Pages
const AdminHome = createLazyComponent(() => import('./admin/Home.jsx'), 'Admin Dashboard');
const AdminUsers = createLazyComponent(() => import('./admin/User.jsx'), 'User Management');
const AdminLivestream = createLazyComponent(() => import('./admin/Livestream.jsx'), 'Livestream Control');
const AdminDonate = createLazyComponent(() => import('./admin/Donate.jsx'), 'Donation Management');

// Context with error boundary
const AuthProvider = lazy(() => import('./components/AuthContext.jsx').catch(() => ({ 
  default: ({ children }) => <>{children}</> 
})));

// Error Boundary for lazy components
const LazyLoadingFallback = ({ componentName = "Component" }) => (
  <div className="flex items-center justify-center p-8 min-h-[200px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
      <p className="text-gray-600 text-sm">Loading {componentName}...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [authState, setAuthState] = useState({ 
    user: null, 
    isAuthenticated: false, 
    isLoading: true 
  });

  useEffect(() => {
    // Simulate auth check
    const timer = setTimeout(() => {
      setAuthState({
        user: { role: 'user' }, // Default to non-admin
        isAuthenticated: false, // Change to true for testing
        isLoading: false
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LazyLoadingFallback componentName="authentication" />
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && authState.user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Admin Access Required</h3>
            <p className="text-yellow-700">You need administrator privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

// Admin Layout Component
const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
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
          ].map((item) => (
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

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
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
      const day = now.getDay();
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
    const timer = setInterval(checkLivestreamSchedule, 60000);
    return () => clearInterval(timer);
  }, [checkLivestreamSchedule]);

  return { livestreamActive, nextStream };
};

// Component to handle AOS refresh on route changes
const AOSRouteHandler = () => {
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        AOS.refresh();
      } catch (error) {
        console.warn('AOS refresh failed:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null;
};

// Maintenance Mode Component
const MaintenanceMode = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="text-4xl mb-4">🔧</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Maintenance Mode</h1>
          <p className="text-gray-600">
            Heavenly Nature Ministry is currently undergoing maintenance. 
            We'll be back online shortly.
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            For urgent matters:<br />
            <a href="tel:+211926006202" className="font-semibold hover:text-blue-900">
              +211 926 006 202
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

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
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center max-w-md">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="text-red-600 text-lg mb-2">⚠️ Application Error</div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Something went wrong</h2>
              <p className="text-gray-600 mb-4">
                We apologize for the inconvenience. Please refresh the page to continue.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent = () => {
  const { livestreamActive, nextStream } = useLivestreamSchedule();
  const [appState, setAppState] = useState({
    loading: true,
    error: null,
    maintenanceMode: false
  });

  // Initialize AOS animations
  useEffect(() => {
    try {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false,
        offset: 50,
        disable: window.innerWidth < 768
      });
    } catch (error) {
      console.warn('AOS initialization failed:', error);
    }
  }, []);

  // Simulate app initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppState({
        loading: false,
        error: null,
        maintenanceMode: false // Set to true to test maintenance mode
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (appState.maintenanceMode) {
    return <MaintenanceMode />;
  }

  if (appState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Heavenly Nature Ministry</h2>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (appState.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Load Error</h3>
            <p className="text-red-700 mb-4">{appState.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <ScrollToTop />
      </Suspense>
      <AOSRouteHandler />
      
      {/* Global Livestream Status Banner */}
      {livestreamActive && (
        <div className="bg-red-600 text-white py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center flex-col sm:flex-row gap-2">
            <div className="flex items-center">
              <span className="animate-pulse mr-2">🔴</span>
              <span className="font-semibold">LIVE NOW</span>
            </div>
            <span>Sunday Service is currently streaming!</span>
            <a 
              href="/livestream" 
              className="bg-white text-red-600 px-3 py-1 rounded text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Watch Now
            </a>
          </div>
        </div>
      )}

      <div className="min-h-screen flex flex-col bg-white">
        {/* Public Header for non-admin routes */}
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={
            <Suspense fallback={<div className="h-16 bg-white border-b"></div>}>
              <Header livestreamActive={livestreamActive} nextStream={nextStream} />
            </Suspense>
          } />
        </Routes>
        
        <main className="flex-grow">
          <Suspense fallback={<LazyLoadingFallback componentName="page" />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home livestreamActive={livestreamActive} nextStream={nextStream} />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/livestream" element={<Livestream livestreamActive={livestreamActive} />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/success" element={<Success />} />
              <Route path="/cancel" element={<Cancel />} />

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

              {/* 404 Fallback */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center px-4">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-8">Page not found</p>
                    <a 
                      href="/" 
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Return Home
                    </a>
                  </div>
                </div>
              } />
            </Routes>
          </Suspense>
        </main>

        {/* Public Footer for non-admin routes */}
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={
            <Suspense fallback={<div className="h-20 bg-gray-50"></div>}>
              <Footer />
            </Suspense>
          } />
        </Routes>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading app...</div>}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Suspense>
    </AppErrorBoundary>
  );
};

export default App;
