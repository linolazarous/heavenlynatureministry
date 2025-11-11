// src/App.jsx
import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./components/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";

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
          <div className="min-h-screen flex items-center justify-center text-center text-red-600">
            <div>
              <p className="text-lg font-semibold mb-2">Failed to load {name} page.</p>
              <p className="text-gray-600">Please refresh or try again later.</p>
            </div>
          </div>
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
   🧱 Global Error Boundary
--------------------------------------------------- */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔥 App Error Boundary caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white shadow-lg rounded-2xl max-w-md w-full p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-4">Please refresh the page or try again later.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full mb-2 transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg w-full transition-colors"
            >
              Try Again
            </button>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-left text-sm text-gray-500">
                <summary className="cursor-pointer">Error Details</summary>
                <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto text-xs">
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------------------------------------------------
   🌀 Loading Fallback
--------------------------------------------------- */
const LoadingFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Heavenly Nature Ministry</h2>
      <p className="text-gray-600 animate-pulse">Loading God’s blessings...</p>
    </div>
  </div>
);

/* ---------------------------------------------------
   🧩 Layout
--------------------------------------------------- */
const MainLayout = ({ children, showHeader = true, showFooter = true }) => (
  <div className="min-h-screen flex flex-col bg-white">
    {showHeader && <Header />}
    <main className="flex-1 w-full">{children}</main>
    {showFooter && <Footer />}
    <ScrollToTop />
  </div>
);

/* ---------------------------------------------------
   🛡️ Route Wrapper
--------------------------------------------------- */
const RouteWrapper = ({ component: Component, layoutProps = {} }) => (
  <ErrorBoundary>
    <MainLayout {...layoutProps}>
      <Suspense fallback={<LoadingSpinner />}>
        <Component />
      </Suspense>
    </MainLayout>
  </ErrorBoundary>
);

/* ---------------------------------------------------
   🌍 App Content
--------------------------------------------------- */
const AppContent = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    console.log("⚙️ Initializing Heavenly Nature Ministry app...");

    const init = async () => {
      try {
        AOS.init({ duration: 800, once: true, offset: 50, easing: "ease-in-out-cubic" });
        await new Promise((r) => setTimeout(r, 100));
        if (mounted) {
          setIsInitialized(true);
          console.log("🎉 App initialized successfully");
        }
      } catch (err) {
        console.error("❌ AOS init error:", err);
        if (mounted) setIsInitialized(true);
      }
    };

    init();
    return () => {
      mounted = false;
      try {
        AOS.refreshHard();
      } catch (err) {
        console.warn("AOS cleanup failed:", err);
      }
    };
  }, []);

  if (!isInitialized) return <LoadingFallback />;

  return (
    <ErrorBoundary>
      <ErrorBoundary>
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </ErrorBoundary>
  );
};

export default function App() {
  try {
    return <AppContent />;
  } catch (error) {
    console.error("🚨 Fatal App Render Error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-center">
        <p>Critical initialization error. Please refresh the page.</p>
      </div>
    );
  }
}
