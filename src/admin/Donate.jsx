import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  FaDonate, 
  FaHandHoldingHeart, 
  FaChartLine,
  FaUsers,
  FaPray,
  FaSyncAlt,
  FaExclamationTriangle
} from 'react-icons/fa';

// Components
import DonationForm from '../components/DonationForm';
import SimpleDonation from '../components/SimpleDonation';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ErrorBoundary from '../components/ErrorBoundary';

// Hooks and Services
import { useAuth } from '../hooks/useAuth';
import { donationAPI } from '../services/api';

// Constants
const DEFAULT_TIERS = [
  { amount: 25, label: 'Supporter' },
  { amount: 50, label: 'Partner' },
  { amount: 100, label: 'Builder' },
  { amount: 250, label: 'Leader' },
  { amount: 500, label: 'Visionary' }
];

// Custom hook for donation management
const useDonationManagement = () => {
  const [state, setState] = useState({
    tiers: DEFAULT_TIERS,
    donationStats: null,
    recentDonations: [],
    isLoading: true,
    error: null,
    activeTab: 'overview',
    lastUpdated: null
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const fetchDonationData = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });
      
      const [statsResponse, recentResponse, tiersResponse] = await Promise.all([
        donationAPI.getStats(),
        donationAPI.getRecentDonations(),
        donationAPI.getTiers()
      ]);

      updateState({
        donationStats: statsResponse.data,
        recentDonations: recentResponse.data,
        tiers: tiersResponse.data || DEFAULT_TIERS,
        isLoading: false,
        lastUpdated: new Date().toISOString(),
        error: null
      });
    } catch (err) {
      console.error('Failed to fetch donation data:', err);
      updateState({
        error: err.response?.data?.message || 'Failed to load donation data',
        isLoading: false
      });
    }
  }, [updateState]);

  const updateTiers = useCallback(async (newTiers) => {
    try {
      await donationAPI.updateTiers(newTiers);
      updateState({ tiers: newTiers });
    } catch (err) {
      console.error('Failed to update tiers:', err);
      throw err;
    }
  }, [updateState]);

  return {
    ...state,
    updateState,
    fetchDonationData,
    updateTiers
  };
};

const AdminDonate = ({ className = '' }) => {
  const { user } = useAuth();
  const {
    tiers,
    donationStats,
    recentDonations,
    isLoading,
    error,
    activeTab,
    lastUpdated,
    updateState,
    fetchDonationData,
    updateTiers
  } = useDonationManagement();

  const [donationForm, setDonationForm] = useState({
    selectedAmount: 50,
    customAmount: '',
    isProcessing: false,
    error: null
  });

  // Load data on component mount
  useEffect(() => {
    fetchDonationData();
  }, [fetchDonationData]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(fetchDonationData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDonationData]);

  // Event handlers
  const handleAmountSelection = useCallback((amount) => {
    setDonationForm(prev => ({
      ...prev,
      selectedAmount: amount,
      customAmount: '',
      error: null
    }));
  }, []);

  const handleCustomAmount = useCallback((e) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && value > 0)) {
      setDonationForm(prev => ({
        ...prev,
        customAmount: value,
        selectedAmount: value ? parseInt(value) : 0,
        error: null
      }));
    }
  }, []);

  const handleDonationSuccess = useCallback((paymentIntent, donationData) => {
    setDonationForm(prev => ({ ...prev, isProcessing: false }));
    
    // Refresh data to show updated stats
    fetchDonationData();
    
    // Track conversion
    if (window.gtag) {
      window.gtag('event', 'donation', {
        event_category: 'donation',
        event_label: donationData.donationType,
        value: donationData.amount,
        currency: 'USD',
        transaction_id: paymentIntent.id
      });
    }
  }, [fetchDonationData]);

  const handleDonationError = useCallback((err) => {
    console.error('Donation error:', err);
    setDonationForm(prev => ({
      ...prev,
      isProcessing: false,
      error: err.message || 'Payment failed. Please try again.'
    }));
  }, []);

  const handleRetry = useCallback(() => {
    fetchDonationData();
  }, [fetchDonationData]);

  const handleTabChange = useCallback((tab) => {
    updateState({ activeTab: tab, error: null });
  }, [updateState]);

  // Memoized values
  const currentAmount = donationForm.customAmount ? 
    parseInt(donationForm.customAmount) || 0 : 
    donationForm.selectedAmount;

  const donationOverview = useMemo(() => [
    {
      label: 'Total Raised',
      value: `$${(donationStats?.totalAmount || 0).toLocaleString()}`,
      icon: FaDonate,
      color: 'primary'
    },
    {
      label: 'Total Donors',
      value: (donationStats?.totalDonors || 0).toLocaleString(),
      icon: FaUsers,
      color: 'secondary'
    },
    {
      label: 'Monthly Recurring',
      value: `$${(donationStats?.monthlyRecurring || 0).toLocaleString()}`,
      icon: FaChartLine,
      color: 'success'
    },
    {
      label: 'Campaign Goal',
      value: `$${(donationStats?.campaignGoal || 0).toLocaleString()}`,
      icon: FaHandHoldingHeart,
      color: 'info'
    }
  ], [donationStats]);

  if (isLoading && !donationStats) {
    return (
      <div className="admin-donate-loading">
        <LoadingSpinner 
          message="Loading Donation Dashboard..." 
          size="large"
        />
      </div>
    );
  }

  return (
    <div className={`admin-donate-page ${className}`}>
      {/* Header */}
      <header className="admin-donate-header">
        <div className="header-content">
          <div>
            <h1>Donation Management</h1>
            <p>Manage donations and track giving metrics</p>
          </div>
          <div className="header-actions">
            {lastUpdated && (
              <div className="last-updated">
                Updated: {new Date(lastUpdated).toLocaleTimeString()}
                <button 
                  onClick={fetchDonationData}
                  className="refresh-btn"
                  disabled={isLoading}
                  aria-label="Refresh data"
                >
                  <FaSyncAlt className={isLoading ? 'spinning' : ''} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="admin-donate-error">
          <ErrorMessage 
            message={error}
            onRetry={handleRetry}
            severity="error"
          />
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="donate-tabs">
        {[
          { id: 'overview', label: 'Overview', icon: FaChartLine },
          { id: 'donate', label: 'Donate', icon: FaDonate },
          { id: 'tiers', label: 'Tier Settings', icon: FaHandHoldingHeart },
          { id: 'reports', label: 'Reports', icon: FaPray }
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            <tab.icon />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="admin-donate-content">
        {activeTab === 'overview' && (
          <ErrorBoundary>
            <div className="overview-content">
              {/* Stats Overview */}
              <section className="stats-overview">
                <h2>Donation Overview</h2>
                <div className="stats-grid">
                  {donationOverview.map((stat, index) => (
                    <div key={index} className={`stat-card ${stat.color}`}>
                      <div className="stat-icon">
                        <stat.icon />
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress towards goal */}
                {donationStats?.campaignGoal > 0 && (
                  <div className="goal-progress">
                    <div className="progress-header">
                      <span>Campaign Progress</span>
                      <span>
                        ${(donationStats?.totalAmount || 0).toLocaleString()} of $
                        {(donationStats?.campaignGoal || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{
                          width: `${Math.min(
                            ((donationStats?.totalAmount || 0) / donationStats.campaignGoal) * 100,
                            100
                          )}%`
                        }}
                      />
                    </div>
                    <div className="progress-percentage">
                      {Math.round(((donationStats?.totalAmount || 0) / donationStats.campaignGoal) * 100)}% funded
                    </div>
                  </div>
                )}
              </section>

              {/* Recent Donations */}
              <section className="recent-donations">
                <div className="section-header">
                  <h2>Recent Donations</h2>
                  <button 
                    onClick={fetchDonationData}
                    className="btn btn-outline"
                    disabled={isLoading}
                  >
                    <FaSyncAlt className={isLoading ? 'spinning' : ''} />
                    Refresh
                  </button>
                </div>

                {recentDonations.length > 0 ? (
                  <div className="donations-list">
                    {recentDonations.map(donation => (
                      <div key={donation.id} className="donation-item">
                        <div className="donor-info">
                          <div className="donor-name">
                            {donation.donorName || 'Anonymous'}
                          </div>
                          <div className="donation-date">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="donation-amount">
                          ${donation.amount}
                        </div>
                        <div className="donation-type">
                          <span className={`type-badge ${donation.type}`}>
                            {donation.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-donations">
                    <FaHandHoldingHeart />
                    <p>No recent donations</p>
                  </div>
                )}
              </section>
            </div>
          </ErrorBoundary>
        )}

        {activeTab === 'donate' && (
          <ErrorBoundary>
            <div className="donate-content">
              {/* Donation Form */}
              <section className="donation-form-section">
                <h2>Process Donation</h2>
                <div className="donation-options">
                  <h3>Select Donation Amount (USD)</h3>
                  <div className="amount-tiers">
                    {tiers.map((tier) => (
                      <button
                        key={tier.amount}
                        className={`amount-tier ${
                          donationForm.selectedAmount === tier.amount && !donationForm.customAmount ? 'selected' : ''
                        }`}
                        onClick={() => handleAmountSelection(tier.amount)}
                      >
                        ${tier.amount}
                        {tier.label && <span className="tier-label">{tier.label}</span>}
                      </button>
                    ))}
                  </div>

                  <div className="custom-amount">
                    <label htmlFor="customAmount">Or enter custom amount:</label>
                    <div className="input-group">
                      <span className="currency-symbol">$</span>
                      <input
                        type="number"
                        id="customAmount"
                        min="1"
                        value={donationForm.customAmount}
                        onChange={handleCustomAmount}
                        placeholder="Other amount"
                      />
                    </div>
                  </div>
                </div>

                {/* Donation Form Component */}
                <div className="donation-form-container">
                  <DonationForm 
                    onSuccess={handleDonationSuccess}
                    onError={handleDonationError}
                  />
                </div>

                {donationForm.error && (
                  <ErrorMessage 
                    message={donationForm.error}
                    severity="error"
                  />
                )}

                {donationForm.isProcessing && (
                  <div className="processing-notice">
                    <LoadingSpinner size="small" />
                    <span>Processing donation...</span>
                  </div>
                )}
              </section>

              {/* Simple Donation Widget Preview */}
              <section className="widget-preview">
                <h2>Donation Widget Preview</h2>
                <div className="preview-container">
                  <SimpleDonation
                    title="Support Our Ministry"
                    description="Your generous gift helps us empower generations through faith in South Sudan"
                    onDonationStart={(amount) => console.log('Donation started:', amount)}
                    onDonationSuccess={handleDonationSuccess}
                    onDonationError={handleDonationError}
                  />
                </div>
              </section>
            </div>
          </ErrorBoundary>
        )}

        {activeTab === 'tiers' && (
          <ErrorBoundary>
            <div className="tiers-content">
              <h2>Donation Tier Settings</h2>
              <p>Configure the donation amount options shown to donors.</p>
              
              <div className="tiers-management">
                <div className="tiers-list">
                  {tiers.map((tier, index) => (
                    <div key={index} className="tier-item">
                      <div className="tier-amount">${tier.amount}</div>
                      <input
                        type="text"
                        value={tier.label}
                        onChange={(e) => {
                          const newTiers = [...tiers];
                          newTiers[index].label = e.target.value;
                          updateState({ tiers: newTiers });
                        }}
                        placeholder="Tier label (optional)"
                      />
                      <button
                        onClick={() => {
                          const newTiers = tiers.filter((_, i) => i !== index);
                          updateState({ tiers: newTiers });
                        }}
                        className="btn btn-danger"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="tier-actions">
                  <button
                    onClick={() => {
                      const newTiers = [...tiers, { amount: 0, label: '' }];
                      updateState({ tiers: newTiers });
                    }}
                    className="btn btn-primary"
                  >
                    Add New Tier
                  </button>
                  
                  <button
                    onClick={() => updateTiers(tiers)}
                    className="btn btn-success"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </ErrorBoundary>
        )}

        {activeTab === 'reports' && (
          <ErrorBoundary>
            <div className="reports-content">
              <h2>Donation Reports</h2>
              <p>Advanced reporting and analytics coming soon.</p>
              
              <div className="reports-placeholder">
                <FaChartLine size={48} />
                <h3>Reports Dashboard</h3>
                <p>
                  This section will include detailed analytics, export functionality, 
                  and advanced reporting features for donation data.
                </p>
              </div>
            </div>
          </ErrorBoundary>
        )}
      </main>

      {/* Security Notice */}
      <footer className="donate-footer">
        <div className="security-notice">
          <FaExclamationTriangle />
          <div>
            <strong>Secure Payment Processing</strong>
            <span>All donations are processed securely through Stripe with PCI DSS compliance</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

AdminDonate.propTypes = {
  className: PropTypes.string
};

AdminDonate.defaultProps = {
  className: ''
};

export default AdminDonate;