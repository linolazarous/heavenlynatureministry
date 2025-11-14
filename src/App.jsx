// src/App.jsx
import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import { AuthProvider } from "../components/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

/* -----------------------------
   Lazy Imports (Safe Wrapper)
-------------------------------- */
const SafeLazy = (importFunc) =>
  lazy(() =>
    importFunc().catch(() => ({
      default: () => (
        <CenteredError message="Failed to load page. Please refresh and try again." />
      ),
    }))
  );

const Home = SafeLazy(() => import("./pages/Home"));
const Profile = SafeLazy(() => import("./pages/Profile"));
const Livestream = SafeLazy(() => import("./pages/Livestream"));
const Donation = SafeLazy(() => import("./pages/Donation"));
const PrivacyPolicy = SafeLazy(() => import("./pages/PrivacyPolicy"));
const Terms = SafeLazy(() => import("./pages/Terms"));
const Contact = SafeLazy(() => import("./pages/Contact"));

/* -----------------------------
   Error Fallback Component
-------------------------------- */
const CenteredError = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center p-6">
    <div>
      <div className="text-red-500 text-5xl mb-3">⚠️</div>
      <p className="text-xl font-semibold text-gray-700">{message}</p>
    </div>
  </div>
);

/* -----------------------------
   Main Layout Wrapper
-------------------------------- */
const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-white">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
    <ScrollToTop />
  </div>
);

/* -----------------------------
   App Initialization (AOS)
-------------------------------- */
const useInit = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 700,
      once: true,
      offset: 40,
    });

    const timer = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return ready;
};

/* -----------------------------
   Main App Content
-------------------------------- */
const AppContent = () => {
  const initialized = useInit();

  if (!initialized) return <LoadingSpinner />;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/livestream" element={<Layout><Livestream /></Layout>} />
        <Route path="/donate" element={<Layout><Donation /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
        <Route path="/terms" element={<Layout><Terms /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

/* -----------------------------
   Export App
-------------------------------- */
export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <AppContent />
      </Suspense>
    </AuthProvider>
  );
}
