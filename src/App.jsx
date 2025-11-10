// src/App.jsx
import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Core Components - Import directly to avoid lazy loading issues
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './components/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

// Public Pages - Lazy load with proper error boundaries
const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const Livestream = lazy(() => import('./pages/Livestream'));
const Donation = lazy(() => import('./pages/Donation'));
const Success = lazy(() => import('./public/Success'));
const Cancel = lazy(() => import('./public/Cancel'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const Contact = lazy(() => import('./pages/Contact'));

// Admin Pages
const AdminHome = lazy(() => import('./admin/Home'));
const AdminUsers = lazy(() => import('./admin/User'));
const AdminLivestream = lazy(() => import('./admin/Livestream'));
const AdminDonate = lazy(() => import('./admin/Donate'));

// Error Boundary Component
class ErrorBoundary extends React.Component {
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">Please refresh the page or try again later.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
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

// Loading Component with better UX
const LoadingFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mb-4"></div>
    <p className="text-gray-600">Loading Heavenly Nature Ministry...</p>
  </div>
);

// Layout component to handle common page structure
const MainLayout = ({ children, showHeader = true, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
      <ScrollToTop />
    </div>
  );
};

// Route wrapper component
const RouteWrapper = ({ component: Component, layoutProps = {} }) => (
  <MainLayout {...layoutProps}>
    <Component />
  </MainLayout>
);

// Admin route wrapper with auth check
const AdminRoute = ({ component: Component }) => {
  const [isAuthenticated] = useState(false); // Replace with actual auth check
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <MainLayout showHeader={false} showFooter={false}>
      <Component />
    </MainLayout>
  );
};

// Main App Component
const AppContent = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize AOS after a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      AOS.init({
        duration: 800,
        once: true,
        offset: 100,
        easing: 'ease-in-out',
      });
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading until app is fully initialized
  if (!isInitialized) {
    return <LoadingFallback />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={<RouteWrapper component={Home} />} 
              />
              <Route 
                path="/livestream" 
                element={<RouteWrapper component={Livestream} />} 
              />
              <Route 
                path="/donate" 
                element={<RouteWrapper component={Donation} />} 
              />
              <Route 
                path="/profile" 
                element={<RouteWrapper component={Profile} />} 
              />
              <Route 
                path="/privacy-policy" 
                element={<RouteWrapper component={PrivacyPolicy} />} 
              />
              <Route 
                path="/terms" 
                element={<RouteWrapper component={Terms} />} 
              />
              <Route 
                path="/contact" 
                element={<RouteWrapper component={Contact} />} 
              />
              
              {/* Success/Cancel Pages (minimal layout) */}
              <Route 
                path="/success" 
                element={
                  <MainLayout showHeader={false} showFooter={false}>
                    <Success />
                  </MainLayout>
                } 
              />
              <Route 
                path="/cancel" 
                element={
                  <MainLayout showHeader={false} showFooter={false}>
                    <Cancel />
                  </MainLayout>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={<AdminRoute component={AdminHome} />} 
              />
              <Route 
                path="/admin/users" 
                element={<AdminRoute component={AdminUsers} />} 
              />
              <Route 
                path="/admin/livestream" 
                element={<AdminRoute component={AdminLivestream} />} 
              />
              <Route 
                path="/admin/donate" 
                element={<AdminRoute component={AdminDonate} />} 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

const App = () => (
  <React.StrictMode>
    <AppContent />
  </React.StrictMode>
);

export default App;
