// src/pages/Profile.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FaUser, 
  FaDonate, 
  FaCalendarAlt, 
  FaCog,
  FaHistory,
  FaChartLine,
  FaSyncAlt
} from 'react-icons/fa';

// Components
import DonationForm from '../components/DonationForm';
import EventCalendar from '../components/EventCalendar';
import ProfileForm from '../components/ProfileForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ErrorBoundary from '../components/ErrorBoundary';

// Services
import { userService } from '../services/userService';
import { donationService } from '../services/donationService';
import { eventService } from '../services/eventService';
import { authService } from '../services/authService';

// Custom hook for profile data management
const useProfileData = (userId) => {
  const [state, setState] = useState({
    profile: null,
    donationStats: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
    refreshCount: 0
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const fetchProfileData = useCallback(async () => {
    if (!userId) return;

    try {
      updateState({ isLoading: true, error: null });

      const [profileResponse, donationStatsResponse] = await Promise.all([
        userService.getUserProfile(userId),
        donationService.getUserDonationStats(userId)
      ]);

      updateState({
        profile: profileResponse,
        donationStats: donationStatsResponse,
        isLoading: false,
        lastUpdated: new Date().toISOString(),
        error: null
      });
    } catch (err) {
      console.error('Failed to load profile data:', err);
      updateState({
        error: err.message || 'Failed to load profile data',
        isLoading: false
      });
    }
  }, [userId, updateState]);

  const refreshData = useCallback(() => {
    updateState(prev => ({ 
      ...prev, 
      refreshCount: prev.refreshCount + 1 
    }));
  }, [updateState]);

  // Load data when userId changes or on refresh
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData, state.refreshCount]);

  return {
    ...state,
    fetchProfileData,
    refreshData,
    updateState
  };
};

// Donation History Component
const DonationHistory = ({ userId, onDonationUpdate }) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      const donationHistory = await donationService.getUserDonationHistory(userId);
      setDonations(donationHistory);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load donation history');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  if (loading) {
    return <LoadingSpinner message="Loading donation history..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error}
        onRetry={fetchDonations}
        severity="error"
      />
    );
  }

  return (
    <div className="donation-history">
      <div className="section-header">
        <h2>Donation History</h2>
        <button onClick={fetchDonations} className="refresh-btn">
          <FaSyncAlt /> Refresh
        </button>
      </div>

      {donations.length === 0 ? (
        <div className="empty-state">
          <FaDonate size={48} />
          <h3>No Donations Yet</h3>
          <p>Make your first donation to see your history here.</p>
          <DonationForm onSuccess={onDonationUpdate} />
        </div>
      ) : (
        <div className="donations-list">
          {donations.map(donation => (
            <div key={donation.id} className="donation-item">
              <div className="donation-amount">
                ${donation.amount}
              </div>
              <div className="donation-details">
                <div className="donation-date">
                  {new Date(donation.date).toLocaleDateString()}
                </div>
                <div className="donation-type">
                  {donation.type === 'one-time' ? 'One-time' : 'Monthly'}
                </div>
              </div>
              <div className="donation-status">
                <span className={`status-badge ${donation.status}`}>
                  {donation.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Custom Auth Hook (since useAuth doesn't exist yet)
const useAuth = () => {
  const [authState, setAuthState] = useState({
    user: null,
    isLoading: true
  });

  useEffect(() => {
    // Mock auth state - replace with actual auth logic
    const currentUser = authService.currentUser();
    setAuthState({
      user: currentUser || { id: '1', email: 'user@example.com', name: 'Demo User' },
      isLoading: false
    });
  }, []);

  const updateUser = (userData) => {
    setAuthState(prev => ({
      ...prev,
      user: { ...prev.user, ...userData }
    }));
  };

  return {
    ...authState,
    updateUser
  };
};

const Profile = ({ className = '' }) => {
  const { user, updateUser } = useAuth();
  const {
    profile,
    donationStats,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    updateState
  } = useProfileData(user?.id);

  const [activeTab, setActiveTab] = useState('overview');

  // Profile tabs configuration
  const profileTabs = useMemo(() => [
    {
      id: 'overview',
      label: 'Overview',
      icon: FaUser,
      description: 'Your profile summary and activity'
    },
    {
      id: 'donations',
      label: 'Donation History',
      icon: FaDonate,
      description: 'View your giving history and impact'
    },
    {
      id: 'events',
      label: 'My Events',
      icon: FaCalendarAlt,
      description: 'Events you\'re attending or interested in'
    },
    {
      id: 'settings',
      label: 'Profile Settings',
      icon: FaCog,
      description: 'Manage your account and preferences'
    }
  ], []);

  // Handle profile updates
  const handleProfileUpdate = useCallback((updatedProfile) => {
    updateState(prev => ({ 
      ...prev, 
      profile: updatedProfile 
    }));
    
    // Update global auth context
    if (updateUser) {
      updateUser({ ...user, ...updatedProfile });
    }

    // Refresh data to ensure consistency
    refreshData();
  }, [updateState, updateUser, user, refreshData]);

  const handleRetry = useCallback(() => {
    refreshData();
  }, [refreshData]);

  // Auto-refresh profile data every 5 minutes
  useEffect(() => {
    const interval = setInterval(refreshData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshData]);

  if (isLoading && !profile) {
    return (
      <div className="profile-loading">
        <LoadingSpinner 
          message="Loading your profile..." 
          size="large"
        />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="profile-error">
        <ErrorMessage 
          message={error}
          onRetry={handleRetry}
          severity="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className={`profile-container ${className}`}>
      {/* Profile Header */}
      <ErrorBoundary>
        <header className="profile-header">
          <div className="profile-identity">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                {profile?.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={`${user?.name || user?.email}'s avatar`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`avatar-placeholder ${profile?.avatar ? 'fallback' : ''}`}>
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                </div>
              </div>
              {lastUpdated && (
                <div className="last-updated">
                  <button 
                    onClick={refreshData}
                    className="refresh-btn"
                    disabled={isLoading}
                    aria-label="Refresh profile data"
                  >
                    <FaSyncAlt className={isLoading ? 'spinning' : ''} />
                  </button>
                </div>
              )}
            </div>

            <div className="profile-info">
              <h1 className="profile-name">
                {profile?.name || user?.email}
                {user?.emailVerified && (
                  <span className="verified-badge" title="Verified email">
                    ✓
                  </span>
                )}
              </h1>
              
              <p className="profile-email">{user?.email}</p>
              
              {profile?.bio && (
                <p className="profile-bio">{profile.bio}</p>
              )}

              {/* Profile Stats */}
              <div className="profile-stats">
                <div className="stat-item">
                  <div className="stat-value">
                    {donationStats?.donationCount || 0}
                  </div>
                  <div className="stat-label">Total Donations</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-value">
                    ${(donationStats?.totalDonated || 0).toLocaleString()}
                  </div>
                  <div className="stat-label">Total Given</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-value">
                    {profile?.eventsAttended || 0}
                  </div>
                  <div className="stat-label">Events Attended</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-value">
                    {new Date(user?.createdAt || Date.now()).getFullYear()}
                  </div>
                  <div className="stat-label">Member Since</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="profile-actions">
            <button className="action-btn primary">
              <FaDonate />
              Make a Donation
            </button>
            <button className="action-btn secondary">
              <FaCalendarAlt />
              Browse Events
            </button>
          </div>
        </header>
      </ErrorBoundary>

      {/* Error Display */}
      {error && (
        <div className="profile-content-error">
          <ErrorMessage 
            message={error}
            onRetry={handleRetry}
            severity="warning"
          />
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="profile-tabs" aria-label="Profile sections">
        {profileTabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
          >
            <tab.icon className="tab-icon" />
            <span className="tab-label">{tab.label}</span>
            <span className="tab-description">{tab.description}</span>
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="profile-content">
        <ErrorBoundary>
          {activeTab === 'overview' && (
            <div id="overview-panel" className="tab-panel" role="tabpanel">
              <section className="overview-section">
                <h2>Recent Activity</h2>
                <div className="activity-feed">
                  {donationStats?.recentDonations?.length > 0 ? (
                    <div className="recent-donations">
                      <h3>Recent Donations</h3>
                      {donationStats.recentDonations.slice(0, 5).map((donation, index) => (
                        <div key={index} className="activity-item">
                          <FaDonate className="activity-icon" />
                          <div className="activity-details">
                            <span className="activity-amount">
                              ${donation.amount}
                            </span>
                            <span className="activity-date">
                              {new Date(donation.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <FaHistory />
                      <p>No recent activity</p>
                      <button className="btn btn-primary">
                        Make Your First Donation
                      </button>
                    </div>
                  )}
                </div>
              </section>

              <section className="impact-section">
                <h2>Your Impact</h2>
                <div className="impact-metrics">
                  <div className="impact-card">
                    <FaChartLine className="impact-icon" />
                    <div className="impact-content">
                      <div className="impact-value">
                        ${(donationStats?.totalDonated || 0).toLocaleString()}
                      </div>
                      <div className="impact-label">
                        Total Contribution
                      </div>
                    </div>
                  </div>
                  
                  <div className="impact-card">
                    <FaUser className="impact-icon" />
                    <div className="impact-content">
                      <div className="impact-value">
                        {donationStats?.donationCount || 0}
                      </div>
                      <div className="impact-label">
                        Donations Made
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'donations' && (
            <div id="donations-panel" className="tab-panel" role="tabpanel">
              <DonationHistory 
                userId={user?.id}
                onDonationUpdate={refreshData}
              />
            </div>
          )}

          {activeTab === 'events' && (
            <div id="events-panel" className="tab-panel" role="tabpanel">
              <EventCalendar 
                userId={user?.id}
                mode="user"
                showRegistration={true}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div id="settings-panel" className="tab-panel" role="tabpanel">
              <ProfileForm 
                profile={profile}
                onUpdate={handleProfileUpdate}
                userId={user?.id}
              />
            </div>
          )}
        </ErrorBoundary>
      </main>

      {/* Loading overlay for background updates */}
      {isLoading && (
        <div className="profile-loading-overlay">
          <LoadingSpinner size="small" />
          <span>Updating profile...</span>
        </div>
      )}
    </div>
  );
};

export default Profile;
