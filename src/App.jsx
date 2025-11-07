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

// Admin Pages
const AdminHome = lazy(() => import('./admin/Home.jsx'));
const AdminUsers = lazy(() => import('./admin/User.jsx'));
const AdminLivestream = lazy(() => import('./admin/Livestream.jsx'));
const AdminDonate = lazy(() => import('./admin/Donate.jsx'));

// Reusable Loading Fallback
const LoadingFallback = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-2"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [authState, setAuthState] = useState({ user: null, isAuthenticated: false, isLoading: true });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthState({
        user: { role: 'user' }, // Change to admin for testing
        isAuthenticated: false,
        isLoading: false,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (authState.isLoading) return <LoadingFallback message="Checking authentication..." />;

  if (!authState.isAuthenticated) return <Navigate to="/" replace />;

  if (requireAdmin && authState.user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Admin Access Required</h3>
          <p className="text-yellow-700">You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

// Admin Layout
const AdminLayout = ({ children }) => (
  <div className="flex min-h-screen bg-gray-100">
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
        ].map(item => (
          <a key={item.href} href={item.href} className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors">
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
    <div className="flex-1 overflow-auto p-8">{children}</div>
  </div>
);

// Custom hook: Livestream schedule
const useLivestreamSchedule = () => {
  const [livestreamActive, setLivestreamActive] = useState(false);
  const [nextStream, setNextStream] = useState(null);

  const checkLivestream = useCallback(() => {
    const now = new Date();
    const isSunday = now.getDay() === 0;
    const hourUTC = now.getUTCHours();
    const minute = now.getMinutes();
    const active = isSunday && hourUTC === 8 && minute <= 120;
    setLivestreamActive(active);

    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()));
    nextSunday.setUTCHours(8, 0, 0, 0);
    setNextStream(nextSunday);
  }, []);

  useEffect(() => {
    checkLivestream();
    const timer = setInterval(checkLivestream, 60000);
    return () => clearInterval(timer);
  }, [checkLivestream]);

  return { livestreamActive, nextStream };
};

// AOS handler on route change
const AOSHandler = () => {
  const location = useLocation();
  useEffect(() => {
    try { AOS.refresh(); } catch { }
  }, [location.pathname]);
  return null;
};

// AppContent
const AppContent = () => {
  const { livestreamActive, nextStream } = useLivestreamSchedule();
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    try {
      AOS.init({ duration: 800, easing: 'ease-in-out', once: true, mirror: false, offset: 50, disable: window.innerWidth < 768 });
    } catch { }
  }, []);

  if (maintenanceMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-4 max-w-md">
          <div className="text-4xl mb-4">🔧</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Maintenance Mode</h1>
          <p className="text-gray-600">We'll be back shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <ScrollToTop />
        <AOSHandler />

        {livestreamActive && (
          <div className="bg-red-600 text-white py-2 px-4 text-center">
            🔴 LIVE NOW – Sunday Service streaming! <a href="/livestream" className="underline">Watch Now</a>
          </div>
        )}

        <Routes>
          {/* Public Header/Footer */}
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<Header livestreamActive={livestreamActive} nextStream={nextStream} />} />
        </Routes>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home livestreamActive={livestreamActive} nextStream={nextStream} />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/livestream" element={<Livestream livestreamActive={livestreamActive} />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout><AdminHome /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/livestream" element={<ProtectedRoute requireAdmin><AdminLayout><AdminLivestream /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/donate" element={<ProtectedRoute requireAdmin><AdminLayout><AdminDonate /></AdminLayout></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-4">Page not found</p>
                  <a href="/" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">Return Home</a>
                </div>
              </div>
            } />
          </Routes>
        </main>

        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<Footer />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

// App with error boundary
class AppErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error(error, info); }
  render() { return this.state.hasError ? <div className="min-h-screen flex items-center justify-center">Application Error</div> : this.props.children; }
}

const App = () => (
  <AppErrorBoundary>
    <Suspense fallback={<LoadingFallback message="Initializing app..." />}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Suspense>
  </AppErrorBoundary>
);

export default App;
