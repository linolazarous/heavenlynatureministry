import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  FaPlayCircle, 
  FaCalendarAlt, 
  FaDonate, 
  FaUsers, 
  FaPray,
  FaExclamationTriangle,
  FaSyncAlt
} from 'react-icons/fa';
import DailyVerse from '../components/DailyVerse';
import HeroSection from '../components/HeroSection';
import EventCalendar from '../components/EventCalendar';
import Testimonials from '../components/Testimonials';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';
import ErrorMessage from '../components/ErrorMessage';
import useLiveStreamStatus from '../hooks/useLiveStreamStatus';
import { useAuth } from '../hooks/useAuth';
import { ministryAPI } from '../services/api';
import '../css/HomePage.css';

// Custom hook for admin home data
const useAdminHomeData = () => {
  const [state, setState] = useState({
    featuredEvents: [],
    ministryStats: null,
    isLoading: true,
    error: null,
    lastUpdated: null
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const fetchHomeData = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });
      
      const [eventsResponse, statsResponse] = await Promise.all([
        ministryAPI.getFeaturedEvents(),
        ministryAPI.getMinistryStats()
      ]);

      updateState({
        featuredEvents: eventsResponse.data,
        ministryStats: statsResponse.data,
        isLoading: false,
        lastUpdated: new Date().toISOString(),
        error: null
      });
    } catch (err) {
      console.error('Failed to load admin home data:', err);
      updateState({
        error: err.response?.data?.message || 'Failed to load dashboard data',
        isLoading: false
      });
    }
  }, [updateState]);

  return {
    ...state,
    fetchHomeData
  };
};

const AdminHome = ({ className = '' }) => {
  const { user } = useAuth();
  const { isLive, streamTitle, viewerCount } = useLiveStreamStatus();
  const {
    featuredEvents,
    ministryStats,
    isLoading,
    error,
    lastUpdated,
    fetchHomeData
  } = useAdminHomeData();

  // Quick links data
  const quickLinks = useMemo(() => [
    {
      title: 'Support Our Mission',
      description: 'Your generosity changes lives',
      icon: FaDonate,
      href: '/admin/donations',
      color: 'donate',
      badge: ministryStats?.totalDonations || 0
    },
    {
      title: 'Manage Users',
      description: 'User administration and roles',
      icon: FaUsers,
      href: '/admin/users',
      color: 'ministries',
      badge: ministryStats?.totalUsers || 0
    },
    {
      title: 'Prayer Requests',
      description: 'View and manage prayer needs',
      icon: FaPray,
      href: '/admin/prayer',
      color: 'prayer',
      badge: ministryStats?.pendingPrayers || 0
    },
    {
      title: 'Event Management',
      description: 'Create and manage events',
      icon: FaCalendarAlt,
      href: '/admin/events',
      color: 'events',
      badge: featuredEvents?.length || 0
    }
  ], [ministryStats, featuredEvents]);

  // Load data on component mount
  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchHomeData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchHomeData]);

  const handleRetry = useCallback(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  if (isLoading && !ministryStats) {
    return (
      <div className="admin-home-loading">
        <LoadingSpinner 
          size="large" 
          message="Loading Ministry Dashboard..." 
        />
      </div>
    );
  }

  return (
    <div className={`admin-home-page ${className}`}>
      {/* Header with welcome and stats */}
      <header className="admin-home-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name || 'Administrator'}!</h1>
          <p>Here's what's happening in your ministry today.</p>
          {lastUpdated && (
            <div className="last-updated">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              <button 
                onClick={fetchHomeData}
                className="refresh-btn"
                disabled={isLoading}
                aria-label="Refresh data"
              >
                <FaSyncAlt className={isLoading ? 'spinning' : ''} />
              </button>
            </div>
          )}
        </div>

        {/* Live stream status badge */}
        {isLive && (
          <div className="live-status-badge">
            <FaPlayCircle className="live-icon" />
            <div className="live-info">
              <span className="live-text">LIVE NOW</span>
              <span className="stream-title">{streamTitle}</span>
              <span className="viewer-count">{viewerCount} viewers</span>
            </div>
            <a href="/live" className="join-live-btn">Join Stream</a>
          </div>
        )}
      </header>

      {/* Error display */}
      {error && (
        <div className="admin-home-error">
          <ErrorMessage 
            message={error}
            onRetry={handleRetry}
            severity="error"
            showIcon
          />
        </div>
      )}

      <main className="admin-home-content">
        {/* Hero section with CTA */}
        <ErrorBoundary 
          fallback={
            <ErrorMessage 
              message="Hero section unavailable"
              severity="warning"
            />
          }
        >
          <HeroSection 
            title="Ministry Administration Dashboard"
            subtitle="Manage your ministry operations and track engagement"
            ctaText={isLive ? "Manage Live Stream" : "View Stream Settings"}
            ctaLink="/admin/livestream"
            isLive={isLive}
            liveLabel={`${viewerCount} viewers`}
            variant="admin"
          />
        </ErrorBoundary>

        {/* Stats overview */}
        {ministryStats && (
          <section className="stats-overview">
            <h2>Ministry Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{ministryStats.totalUsers || 0}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">${(ministryStats.totalDonations || 0).toLocaleString()}</div>
                <div className="stat-label">Total Donations</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{ministryStats.activeEvents || 0}</div>
                <div className="stat-label">Active Events</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{ministryStats.prayerRequests || 0}</div>
                <div className="stat-label">Prayer Requests</div>
              </div>
            </div>
          </section>
        )}

        <div className="admin-content-grid">
          {/* Left column */}
          <div className="admin-content-column">
            {/* Daily verse */}
            <section className="verse-section">
              <h2>Today's Inspiration</h2>
              <ErrorBoundary 
                fallback={
                  <ErrorMessage 
                    message="Daily verse unavailable"
                    severity="warning"
                  />
                }
              >
                <DailyVerse 
                  showRefresh={true}
                  version="NIV"
                />
              </ErrorBoundary>
            </section>

            {/* Upcoming events */}
            <section className="events-section">
              <div className="section-header">
                <h2>Upcoming Events</h2>
                <a href="/admin/events" className="view-all-link">
                  Manage Events →
                </a>
              </div>
              <ErrorBoundary 
                fallback={
                  <ErrorMessage 
                    message="Events unavailable"
                    severity="warning"
                  />
                }
              >
                <EventCalendar 
                  events={featuredEvents} 
                  compact 
                  showActions 
                />
              </ErrorBoundary>
            </section>
          </div>

          {/* Right column */}
          <div className="admin-content-column">
            {/* Quick links */}
            <section className="quick-links-section">
              <h2>Quick Actions</h2>
              <div className="admin-link-cards">
                {quickLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link.href}
                    className={`admin-link-card ${link.color}`}
                  >
                    <div className="link-card-header">
                      <link.icon className="link-icon" />
                      {link.badge > 0 && (
                        <span className="link-badge">{link.badge}</span>
                      )}
                    </div>
                    <div className="link-card-content">
                      <h3>{link.title}</h3>
                      <p>{link.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>

            {/* Recent testimonials */}
            <section className="testimonials-section">
              <div className="section-header">
                <h2>Recent Testimonials</h2>
                <a href="/admin/testimonials" className="view-all-link">
                  Manage All →
                </a>
              </div>
              <ErrorBoundary 
                fallback={
                  <ErrorMessage 
                    message="Testimonials unavailable"
                    severity="warning"
                  />
                }
              >
                <Testimonials 
                  autoPlay={false}
                  showControls={true}
                  limit={2}
                />
              </ErrorBoundary>
            </section>
          </div>
        </div>

        {/* System status */}
        <section className="system-status">
          <h2>System Status</h2>
          <div className="status-grid">
            <div className="status-item online">
              <div className="status-indicator"></div>
              <span>Website</span>
            </div>
            <div className={`status-item ${isLive ? 'live' : 'online'}`}>
              <div className="status-indicator"></div>
              <span>Live Stream</span>
            </div>
            <div className="status-item online">
              <div className="status-indicator"></div>
              <span>Database</span>
            </div>
            <div className="status-item online">
              <div className="status-indicator"></div>
              <span>Payments</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

AdminHome.propTypes = {
  className: PropTypes.string
};

AdminHome.defaultProps = {
  className: ''
};

export default AdminHome;