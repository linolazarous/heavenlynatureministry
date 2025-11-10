import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Core Components - Import directly for stability
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './components/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy loaded pages with error boundaries
const Home = lazy(() => 
  import('./pages/Home').catch(() => ({ 
    default: () => <div>Failed to load Home page</div> 
  }))
);

const Profile = lazy(() => 
  import('./pages/Profile').catch(() => ({ 
    default: () => <div>Failed to load Profile page</div> 
  }))
);

const Livestream = lazy(() => 
  import('./pages/Livestream').catch(() => ({ 
    default: () => <div>Failed to load Livestream page</div> 
  }))
);

const Donation = lazy(() => 
  import('./pages/Donation').catch(() => ({ 
    default: () => <div>Failed to load Donation page</div> 
  }))
);

const PrivacyPolicy = lazy(() => 
  import('./pages/PrivacyPolicy').catch(() => ({ 
    default: () => <div>Failed to load Privacy Policy</div> 
  }))
);

const Terms = lazy(() => 
  import('./pages/Terms').catch(() => ({ 
    default: () => <div>Failed to load Terms of Service</div> 
  }))
);

const Contact = lazy(() => 
  import('./pages/Contact').catch(() => ({ 
    default: () => <div>Failed to load Contact page</div> 
  }))
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You can log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-4">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Reload Page
                </button>
                <button
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Enhanced Loading Component
const LoadingFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Heavenly Nature Ministry
      </h2>
      <p className="text-gray-600 animate-pulse">Loading God's blessings...</p>
    </div>
  </div>
);

// Layout Component
const MainLayout = ({ children, showHeader = true, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {showHeader && <Header />}
      <main className="flex-1 w-full">
        {children}
      </main>
      {showFooter && <Footer />}
      <ScrollToTop />
    </div>
  );
};

// Route Wrapper Component
const RouteWrapper = ({ component: Component, layoutProps = {} }) => (
  <ErrorBoundary>
    <MainLayout {...layoutProps}>
      <Suspense fallback={<LoadingSpinner />}>
        <Component />
      </Suspense>
    </MainLayout>
  </ErrorBoundary>
);

// Admin Route Protection (placeholder - implement actual auth)
const AdminRoute = ({ component: Component }) => {
  const [isAuthenticated] = useState(() => {
    // Replace with actual authentication check
    return localStorage.getItem('adminAuth') === 'true';
  });

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <MainLayout showHeader={false} showFooter={false}>
      <Suspense fallback={<LoadingSpinner />}>
        <Component />
      </Suspense>
    </MainLayout>
  );
};

// Main App Component
const AppContent = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Initialize AOS with proper configuration
        AOS.init({
          duration: 800,
          once: true,
          offset: 50,
          easing: 'ease-in-out-cubic',
          delay: 100,
        });

        // Simulate any other initialization tasks
        await new Promise(resolve => setTimeout(resolve, 100));

        if (mounted) {
          setIsInitialized(true);
          console.log('🎉 App initialized successfully');
        }
      } catch (error) {
        console.error('App initialization error:', error);
        if (mounted) {
          setIsInitialized(true); // Still show app even if AOS fails
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      AOS.refresh(); // Cleanup AOS
    };
  }, []);

  // Show loading until fully initialized
  if (!isInitialized) {
    return <LoadingFallback />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RouteWrapper component={Home} />} />
            <Route path="/livestream" element={<RouteWrapper component={Livestream} />} />
            <Route path="/donate" element={<RouteWrapper component={Donation} />} />
            <Route path="/profile" element={<RouteWrapper component={Profile} />} />
            <Route path="/privacy-policy" element={<RouteWrapper component={PrivacyPolicy} />} />
            <Route path="/terms" element={<RouteWrapper component={Terms} />} />
            <Route path="/contact" element={<RouteWrapper component={Contact} />} />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

// Export for testing
const App = () => <AppContent />;
export default App;
