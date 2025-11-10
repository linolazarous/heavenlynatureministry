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
import useLiveStreamStatus from '../hooks/useLiveStreamStatus';
import { auth } from '../services/auth';
import { ministryAPI } from '../services/ministryAPI';
import '../css/HomePage.css';

// Custom hook for public home data
const usePublicHomeData = () => {
  const [state, setState] = useState({
    featuredEvents: [],
    ministryStats: null,
    testimonials: [],
    isLoading: true,
    error: null
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const fetchHomeData = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });
      
      const [eventsResponse, statsResponse, testimonialsResponse] = await Promise.all([
        ministryAPI.getPublicEvents(),
        ministryAPI.getPublicStats(),
        ministryAPI.getFeaturedTestimonials()
      ]);

      updateState({
        featuredEvents: eventsResponse.data,
        ministryStats: statsResponse.data,
        testimonials: testimonialsResponse.data,
        isLoading: false,
        error: null
      });
    } catch (err) {
      console.error('Failed to load home data:', err);
      updateState({
        error: 'Unable to load content. Please try again later.',
        isLoading: false
      });
    }
  }, [updateState]);

  return {
    ...state,
    fetchHomeData
  };
};

const Home = ({ className = '' }) => {
  const { isLive, streamTitle, viewerCount } = useLiveStreamStatus();
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
      stat: ministryStats?.communitiesServed || '12+',
      statLabel: 'Communities'
    },
    {
      title: 'Lives Impacted',
      description: 'Bringing hope and healing to generations',
      icon: FaUsers,
      color: 'secondary',
      stat: ministryStats?.livesImpacted || '5,000+',
      statLabel: 'People'
    },
    {
      title: 'Prayer Support',
      description: 'Join our global prayer community',
      icon: FaPray,
      color: 'prayer',
      stat: ministryStats?.prayerRequests || '1,200+',
      statLabel: 'Prayers'
    },
    {
      title: 'Generous Support',
      description: 'Partner with us in ministry',
      icon: FaDonate,
      color: 'donate',
      stat: `$${ministryStats?.totalDonations?.toLocaleString() || '250K+'}`,
      statLabel: 'Raised'
    }
  ], [ministryStats]);

  // Quick action cards
  const actionCards = useMemo(() => [
    {
      title: 'Join Live Service',
      description: 'Worship with us online',
      icon: FaPlayCircle,
      href: '/live',
      color: 'live',
      featured: isLive
    },
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
  ], [isLive]);

  // Load data on component mount
  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

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
      {/* Hero Section */}
      <ErrorBoundary>
        <HeroSection 
          title="Welcome to Heavenly Nature Ministry"
          subtitle="Empowering generations through faith, hope, and love in South Sudan and beyond"
          ctaText={isLive ? "Join Live Stream" : "Watch Latest Sermon"}
          ctaLink={isLive ? "/live" : "/sermons"}
          secondaryCtaText="Learn About Our Mission"
          secondaryCtaLink="/about"
          isLive={isLive}
          liveLabel={`Live Now: ${streamTitle}`}
          backgroundImage="/images/hero-bg.jpg"
        />
      </ErrorBoundary>

      {/* Error display */}
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
        {/* Impact Statistics */}
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
                  className={`action-card ${action.color} ${action.featured ? 'featured' : ''}`}
                >
                  <div className="action-icon">
                    <action.icon />
                    {action.featured && (
                      <div className="live-pulse"></div>
                    )}
                  </div>
                  <div className="action-content">
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                    {action.featured && (
                      <span className="featured-badge">Live Now</span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <div className="content-grid container">
          {/* Left Column */}
          <div className="content-column">
            {/* Daily Verse */}
            <section className="verse-section">
              <h2>Today's Word of Encouragement</h2>
              <ErrorBoundary>
                <DailyVerse 
                  showRefresh={false}
                  version="NIV"
                  showShare={true}
                />
              </ErrorBoundary>
            </section>

            {/* Upcoming Events */}
            <section className="events-section">
              <div className="section-header">
                <h2>Upcoming Events</h2>
                <a href="/events" className="view-all-link">
                  View All Events →
                </a>
              </div>
              <ErrorBoundary>
                <EventCalendar 
                  events={featuredEvents} 
                  compact 
                  showRegisterButton 
                />
              </ErrorBoundary>
            </section>
          </div>

          {/* Right Column */}
          <div className="content-column">
            {/* Ministry Highlights */}
            <section className="highlights-section">
              <h2>Ministry Highlights</h2>
              <div className="highlight-cards">
                <div className="highlight-card">
                  <FaHeart className="highlight-icon" />
                  <div className="highlight-content">
                    <h3>Community Outreach</h3>
                    <p>Bringing hope and practical help to underserved communities through education and resources.</p>
                  </div>
                </div>
                <div className="highlight-card">
                  <FaHandsHelping className="highlight-icon" />
                  <div className="highlight-content">
                    <h3>Discipleship Programs</h3>
                    <p>Equipping the next generation of leaders through biblical teaching and mentorship.</p>
                  </div>
                </div>
                <div className="highlight-card">
                  <FaBookOpen className="highlight-icon" />
                  <div className="highlight-content">
                    <h3>Bible Distribution</h3>
                    <p>Providing God's Word to families and individuals seeking spiritual growth.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Live Stream Status */}
            {isLive && (
              <section className="live-now-section">
                <div className="live-now-card">
                  <div className="live-header">
                    <FaPlayCircle className="live-icon" />
                    <div className="live-info">
                      <span className="live-badge">LIVE NOW</span>
                      <span className="stream-title">{streamTitle}</span>
                    </div>
                  </div>
                  <div className="live-stats">
                    <span className="viewer-count">{viewerCount} watching</span>
                  </div>
                  <a href="/live" className="join-live-button">
                    Join Live Stream
                  </a>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Testimonials Section */}
        <section className="testimonials-home-section">
          <div className="container">
            <div className="section-header">
              <h2>Stories of Transformation</h2>
              <p>Hear how God is working through our ministry</p>
            </div>
            <ErrorBoundary>
              <Testimonials 
                testimonials={testimonials}
                autoPlay={true}
                showControls={true}
                interval={6000}
              />
            </ErrorBoundary>
          </div>
        </section>

        {/* Call to Action */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Make a Difference?</h2>
              <p>Join us in our mission to bring hope and transformation to communities in need.</p>
              <div className="cta-buttons">
                <a href="/donate" className="btn btn-primary">
                  <FaDonate />
                  Support Our Mission
                </a>
                <a href="/volunteer" className="btn btn-secondary">
                  <FaHandsHelping />
                  Volunteer Opportunities
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="newsletter-section">
          <div className="container">
            <div className="newsletter-content">
              <div className="newsletter-text">
                <h3>Stay Connected</h3>
                <p>Get ministry updates, event notifications, and words of encouragement delivered to your inbox.</p>
              </div>
              <form className="newsletter-form">
                <div className="form-group">
                  <input 
                    type="email" 
                    placeholder="Enter your email address"
                    className="newsletter-input"
                    required
                  />
                  <button type="submit" className="btn btn-primary">
                    Subscribe
                  </button>
                </div>
                <p className="newsletter-note">We respect your privacy. Unsubscribe at any time.</p>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
