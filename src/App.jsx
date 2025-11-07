import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

// Core Components
import Header from "../components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import ErrorMessage from "./components/ErrorMessage.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";

// Context
import { AuthProvider, useAuth } from "./components/AuthContext.jsx";

// Lazy-loaded Components
const BibleVerseSearch = lazy(() => import("./components/BibleVerseSearch.jsx"));
const CountdownTimer = lazy(() => import("./components/CountdownTimer.jsx"));
const DailyVerse = lazy(() => import("./components/DailyVerse.jsx"));
const DonationForm = lazy(() => import("./components/DonationForm.jsx"));
const EmailVerification = lazy(() => import("./components/EmailVerification.jsx"));
const EventCalendar = lazy(() => import("./components/EventCalendar.jsx"));
const LivestreamNotes = lazy(() => import("./components/LivestreamNotes.jsx"));
const LivestreamOverlay = lazy(() => import("./components/LivestreamOverlay.jsx"));
const LowerThirdGenerator = lazy(() => import("./components/LowerThirdGenerator.jsx"));
const PasswordForm = lazy(() => import("./components/PasswordForm.jsx"));
const ProfileForm = lazy(() => import("./components/ProfileForm.jsx"));
const SimpleDonation = lazy(() => import("./components/SimpleDonation.jsx"));
const Testimonials = lazy(() => import("./components/Testimonials.jsx"));
const YouTubeEmbed = lazy(() => import("./components/YouTubeEmbed.jsx"));

// Public Pages
const Home = lazy(() => import("./pages/Home.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Livestream = lazy(() => import("./pages/Livestream.jsx"));
const Donate = lazy(() => import("./pages/Donate.jsx"));
const Success = lazy(() => import("./public/Success.jsx"));
const Cancel = lazy(() => import("./public/Cancel.jsx"));

// Admin Pages
const AdminHome = lazy(() => import("./admin/Home.jsx"));
const AdminUsers = lazy(() => import("./admin/User.jsx"));
const AdminLivestream = lazy(() => import("./admin/Livestream.jsx"));
const AdminDonate = lazy(() => import("./admin/Donate.jsx"));

// ----------------------
// Lazy Loading Fallback
// ----------------------
const LazyLoadingFallback = ({ componentName = "Component" }) => (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner message={`Loading ${componentName}...`} size="small" />
  </div>
);

// ----------------------
// Protected Route
// ----------------------
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" message="Checking authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (requireAdmin && user?.role !== "admin") {
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

// ----------------------
// Admin Layout
// ----------------------
const AdminLayout = ({ children }) => (
  <div className="admin-layout">
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Ministry Admin</h2>
        <p>Heavenly Nature Ministry</p>
      </div>
      <nav className="sidebar-nav">
        <a href="/admin" className="nav-item">
          <i className="fas fa-tachometer-alt"></i> Dashboard
        </a>
        <a href="/admin/users" className="nav-item">
          <i className="fas fa-users"></i> User Management
        </a>
        <a href="/admin/livestream" className="nav-item">
          <i className="fas fa-broadcast-tower"></i> Livestream Control
        </a>
        <a href="/admin/donate" className="nav-item">
          <i className="fas fa-donate"></i> Donation Management
        </a>
        <a href="/" className="nav-item">
          <i className="fas fa-home"></i> Back to Site
        </a>
      </nav>
    </div>
    <div className="admin-content">{children}</div>
  </div>
);

// ----------------------
// Maintenance Mode (Optional)
// ----------------------
const MaintenanceMode = ({ active }) =>
  active ? (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-semibold mb-2">Under Maintenance</h1>
      <p className="text-gray-600 text-center max-w-md">
        We're improving the Heavenly Nature Ministry website to serve you better. Please check back soon.
      </p>
    </div>
  ) : null;

// ----------------------
// AOS Initialization
// ----------------------
const AOSRouteHandler = () => {
  const location = useLocation();
  useEffect(() => {
    AOS.init({ duration: 600, once: true });
    AOS.refresh();
  }, [location.pathname]);
  return null;
};

// ----------------------
// Main App Component
// ----------------------
function App() {
  const [maintenance, setMaintenance] = useState(false);

  const checkMaintenance = useCallback(() => {
    // Simulate API call or ENV check
    setMaintenance(false);
  }, []);

  useEffect(() => {
    checkMaintenance();
  }, [checkMaintenance]);

  if (maintenance) return <MaintenanceMode active={true} />;

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AOSRouteHandler />
        <Header />
        <main className="main-content">
          <Suspense fallback={<LazyLoadingFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/livestream" element={<Livestream />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/success" element={<Success />} />
              <Route path="/cancel" element={<Cancel />} />

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

              {/* Catch-all */}
              <Route
                path="*"
                element={
                  <ErrorMessage
                    message="404 - Page Not Found"
                    description="Sorry, the page you are looking for does not exist."
                    severity="error"
                    showIcon
                  />
                }
              />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;

