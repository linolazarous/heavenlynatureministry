// src/pages/Home.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FaPlayCircle, 
  FaCalendarAlt, 
  FaDonate, 
  FaUsers, 
  FaPray,
  FaChurch,
  FaHeart,
  FaHandsHelping,
  FaBookOpen
} from 'react-icons/fa';
import DailyVerse from '../components/DailyVerse';
import HeroSection from '../components/HeroSection';
import EventCalendar from '../components/EventCalendar';
import Testimonials from '../components/Testimonials';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';
import ErrorMessage from '../components/ErrorMessage';
import '../css/HomePage.css';

// Custom hook for public home data (static fallback)
const usePublicHomeData = () => {
  const [state, setState] = useState({
    featuredEvents: [],
    ministryStats: {
      communitiesServed: '12+',
      livesImpacted: '5,000+',
      prayerRequests: '1,200+',
      totalDonations: 250000
    },
    testimonials: [],
    isLoading: false,
    error: null
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // No API fetching anymore
  const fetchHomeData = useCallback(() => {
    // Simulate loading if needed
  }, []);

  return {
    ...state,
    fetchHomeData
  };
};

const Home = ({ className = '' }) => {
  const {
    featuredEvents,
    ministryStats,
    testimonials,
    isLoading,
    error,
    fetchHomeData
  } = usePublicHomeData();

  // Ministry impact cards
  const impactCards = useMemo(() => [
    {
      title: 'Community Outreach',
      description: 'Transforming lives through faith and service',
      icon: FaChurch,
      color: 'primary',
      stat: ministryStats?.communitiesServed,
      statLabel: 'Communities'
    },
    {
      title: 'Lives Impacted',
      description: 'Bringing hope and healing to generations',
      icon: FaUsers,
      color: 'secondary',
      stat: ministryStats?.livesImpacted,
      statLabel: 'People'
    },
    {
      title: 'Prayer Support',
      description: 'Join our global prayer community',
      icon: FaPray,
      color: 'prayer',
      stat: ministryStats?.prayerRequests,
      statLabel: 'Prayers'
    },
    {
      title: 'Generous Support',
      description: 'Partner with us in ministry',
      icon: FaDonate,
      color: 'donate',
      stat: `$${(ministryStats?.totalDonations || 0).toLocaleString()}`,
      statLabel: 'Raised'
    }
  ], [ministryStats]);

  // Quick action cards (no live stream)
  const actionCards = useMemo(() => [
    {
      title: 'Give Generously',
      description: 'Support our mission',
      icon: FaDonate,
      href: '/donate',
      color: 'donate'
    },
    {
      title: 'Upcoming Events',
      description: 'See what\'s happening',
      icon: FaCalendarAlt,
      href: '/events',
      color: 'events'
    },
    {
      title: 'Request Prayer',
      description: 'Share your prayer needs',
      icon: FaPray,
      href: '/prayer',
      color: 'prayer'
    }
  ], []);

  const handleRetry = useCallback(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  if (isLoading && !ministryStats) {
    return (
      <div className="home-loading">
        <LoadingSpinner 
          size="large" 
          message="Welcome to Heavenly Nature Ministry..." 
        />
      </div>
    );
  }

  return (
    <div className={`home-page ${className}`}>
      <ErrorBoundary>
        <HeroSection 
          title="Welcome to Heavenly Nature Ministry"
          subtitle="Empowering generations through faith, hope, and love in South Sudan and beyond"
          ctaText="Watch Latest Sermon"
          ctaLink="/sermons"
          secondaryCtaText="Learn About Our Mission"
          secondaryCtaLink="/about"
          backgroundImage="/images/hero-bg.jpg"
        />
      </ErrorBoundary>

      {error && (
        <div className="home-error">
          <ErrorMessage 
            message={error}
            onRetry={handleRetry}
            severity="warning"
            showIcon
          />
        </div>
      )}

      <main className="home-content">
        {/* Impact Section */}
        <section className="impact-section">
          <div className="container">
            <div className="section-header">
              <h2>Our Impact Together</h2>
              <p>Through your support, we're making a difference in communities across South Sudan</p>
            </div>
            <div className="impact-grid">
              {impactCards.map((card, index) => (
                <div key={index} className={`impact-card ${card.color}`}>
                  <div className="impact-icon">
                    <card.icon />
                  </div>
                  <div className="impact-content">
                    <div className="impact-stat">{card.stat}</div>
                    <div className="impact-stat-label">{card.statLabel}</div>
                    <h3 className="impact-title">{card.title}</h3>
                    <p className="impact-description">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="actions-section">
          <div className="container">
            <h2>Get Involved Today</h2>
            <div className="actions-grid">
              {actionCards.map((action, index) => (
                <a 
                  key={index}
                  href={action.href}
                  className={`action-card ${action.color}`}
                >
                  <div className="action-icon">
                    <action.icon />
                  </div>
                  <div className="action-content">
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Remaining content (Daily Verse, Events, Testimonials, CTA, Newsletter) stays unchanged */}
        {/* ... */}
      </main>
    </div>
  );
};

export default Home;
