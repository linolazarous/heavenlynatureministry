// src/App.jsx
import React, { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import { AuthProvider } from "../components/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

/* ---------------------------------------------------
   🧩 Safe Lazy Import Helper
--------------------------------------------------- */
const safeLazyImport = (importFunc, name) =>
  lazy(async () => {
    try {
      const module = await importFunc();
      return module;
    } catch (err) {
      console.error(`❌ Failed to load ${name} page:`, err);
      return {
        default: () => (
          <ErrorFallback 
            title={`Failed to load ${name}`}
            message="Please refresh or try again later."
            showRetry={true}
          />
        ),
      };
    }
  });

/* ---------------------------------------------------
   🧭 Lazy Pages
--------------------------------------------------- */
const Home = safeLazyImport(() => import("./pages/Home"), "Home");
const Profile = safeLazyImport(() => import("./pages/Profile"), "Profile");
const Livestream = safeLazyImport(() => import("./pages/Livestream"), "Livestream");
const Donation = safeLazyImport(() => import("./pages/Donation"), "Donation");
const PrivacyPolicy = safeLazyImport(() => import("./pages/PrivacyPolicy"), "Privacy Policy");
const Terms = safeLazyImport(() => import("./pages/Terms"), "Terms of Service");
const Contact = safeLazyImport(() => import("./pages/Contact"), "Contact");

/* ---------------------------------------------------
   🧱 Error Components
--------------------------------------------------- */
const ErrorFallback = ({ 
  title = "Something went wrong", 
  message = "Please refresh the page or try again later.", 
  showRetry = true,
  error = null 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="bg-white shadow-lg rounded-2xl max-w-md w-full p-6 text-center">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold mb-2 text-gray-800">{title}</h1>
      <p className="text-gray-600 mb-4">{message}</p>
      <div className="space-y-2">
        {showRetry && (
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full transition-colors duration-200"
          >
            Reload Page
          </button>
        )}
        {showRetry && (
          <button
            onClick={() => window.history.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg w-full transition-colors duration-200"
          >
            Go Back
          </button>
        )}
      </div>
      {import.meta.env.DEV && error && (
        <details className="mt-4 text-left text-sm text-gray-500">
          <summary className="cursor-pointer font-medium">Error Details (Development)</summary>
          <pre className="mt-2 bg-gray-100 p-3 rounded overflow-auto text-xs max-h-40">
            {error instanceof Error ? error.stack : String(error)}
          </pre>
        </details>
      )}
    </div>
  </div>
);

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔥 App Error Boundary caught:", error, errorInfo);
    // You can log to an error reporting service here
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          showRetry={true}
        />
      );
    }
    return this.props.children;
  }
}

/* ---------------------------------------------------
   🌀 Loading Components
--------------------------------------------------- */
const AppLoadingFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Heavenly Nature Ministry</h2>
      <p className="text-gray-600 animate-pulse">Loading God's blessings...</p>
    </div>
  </div>
);

/* ---------------------------------------------------
   🧩 Layout Components
--------------------------------------------------- */
const MainLayout = ({ children, showHeader = true, showFooter = true }) => (
  <div className="min-h-screen flex flex-col bg-white">
    {showHeader && <Header />}
    <main className="flex-1 w-full">{children}</main>
    {showFooter && <Footer />}
    <ScrollToTop />
  </div>
);

const RouteWrapper = ({ component: Component, layoutProps = {} }) => (
  <MainLayout {...layoutProps}>
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  </MainLayout>
);

/* ---------------------------------------------------
   🌍 App Initialization Hook
--------------------------------------------------- */
const useAppInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    let mounted = true;
    let aosInitialized = false;

    const initializeApp = async () => {
      try {
        console.log("⚙️ Initializing Heavenly Nature Ministry app...");

        // Initialize AOS with better configuration
        AOS.init({
          duration: 800,
          once: true,
          offset: 50,
          easing: "ease-in-out-cubic",
          disable: window.innerWidth < 768, // Disable on mobile for performance
        });
        aosInitialized = true;

        // Simulate any async initialization tasks
        await new Promise(resolve => setTimeout(resolve, 100));

        if (mounted) {
          setIsInitialized(true);
          console.log("🎉 App initialized successfully");
        }
      } catch (error) {
        console.error("❌ App initialization error:", error);
        if (mounted) {
          setInitError(error);
          setIsInitialized(true); // Continue anyway
        }
      }
    };

    initializeApp();

    return () => {
      mounted = false;
      if (aosInitialized) {
        try {
          AOS.refresh();
        } catch (err) {
          console.warn("AOS cleanup warning:", err);
        }
      }
    };
  }, []);

  return { isInitialized, initError };
};

/* ---------------------------------------------------
   🏠 App Content Component
--------------------------------------------------- */
const AppContent = () => {
  const { isInitialized, initError } = useAppInitialization();

  // Show loading state
  if (!isInitialized) {
    return <AppLoadingFallback />;
  }

  // Show initialization error (non-blocking)
  if (initError) {
    console.warn("App initialized with warnings:", initError);
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RouteWrapper component={Home} />} />
          <Route path="/livestream" element={<RouteWrapper component={Livestream} />} />
          <Route path="/donate" element={<RouteWrapper component={Donation} />} />
          <Route path="/profile" element={<RouteWrapper component={Profile} />} />
          <Route path="/privacy-policy" element={<RouteWrapper component={PrivacyPolicy} />} />
          <Route path="/terms" element={<RouteWrapper component={Terms} />} />
          <Route path="/contact" element={<RouteWrapper component={Contact} />} />
          
          {/* Redirect all unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

/* ---------------------------------------------------
   🚀 Main App Component
--------------------------------------------------- */
export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

