// src/App.jsx
import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Core Components - Simple relative imports
const Header = lazy(() => import('./components/Header'));
const Footer = lazy(() => import('./components/Footer'));
const ScrollToTop = lazy(() => import('./components/ScrollToTop'));
const AuthProvider = lazy(() => import('./components/AuthContext'));

// Public Pages
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

// Loading Component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
);

// Main App Component
const AppContent = () => {
  const [livestreamActive, setLivestreamActive] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={
            <div>
              <Header />
              <Home />
              <Footer />
            </div>
          } />
          <Route path="/livestream" element={
            <div>
              <Header />
              <Livestream />
              <Footer />
            </div>
          } />
          <Route path="/donate" element={
            <div>
              <Header />
              <Donate />
              <Footer />
            </div>
          } />
          <Route path="/profile" element={
            <div>
              <Header />
              <Profile />
              <Footer />
            </div>
          } />
          <Route path="/privacy-policy" element={
            <div>
              <Header />
              <PrivacyPolicy />
              <Footer />
            </div>
          } />
          <Route path="/terms" element={
            <div>
              <Header />
              <Terms />
              <Footer />
            </div>
          } />
          <Route path="/contact" element={
            <div>
              <Header />
              <Contact />
              <Footer />
            </div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

const App = () => (
  <React.StrictMode>
    <AppContent />
  </React.StrictMode>
);

export default App;

