import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  FaDonate, 
  FaHandHoldingHeart, 
  FaChartLine,
  FaUsers,
  FaPray,
  FaSyncAlt,
  FaExclamationTriangle,
  FaLock,
  FaHeart,
  FaCheckCircle,
  FaShieldAlt
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
  { amount: 25, label: 'Supporter', description: 'Helps provide basic resources' },
  { amount: 50, label: 'Partner', description: 'Supports ongoing ministry work' },
  { amount: 100, label: 'Builder', description: 'Builds lasting impact in communities' },
  { amount: 250, label: 'Leader', description: 'Leads transformative change' },
  { amount: 500, label: 'Visionary', description: 'Fuels visionary projects' }
];

const IMPACT_STATEMENTS = [
  "$25 provides Bibles for 5 families",
  "$50 supports a child's education for one month",
  "$100 funds community outreach programs",
  "$250 helps build clean water facilities",
  "$500 empowers local ministry leaders"
];

// Custom hook for donation management
const useDonationManagement = () => {
  const [state, setState] = useState({
    tiers: DEFAULT_TIERS,
    donationStats: null,
    recentDonations: [],
    isLoading: true,
    error: null,
    activeTab: 'one-time',
    lastUpdated: null,
    impactStatement: IMPACT_STATEMENTS[0]
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const fetchDonationData = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });
      
      const [statsResponse, recentResponse, tiersResponse] = await Promise.all([
        donationAPI.getPublicStats(),
        donationAPI.getRecentPublicDonations(),
        donationAPI.getPublicTiers()
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

  const rotateImpactStatement = useCallback(() => {
    const currentIndex = IMPACT_STATEMENTS.indexOf(state.impactStatement);
    const nextIndex = (currentIndex + 1) % IMPACT_STATEMENTS.length;
    updateState({ impactStatement: IMPACT_STATEMENTS[nextIndex] });
  }, [state.impactStatement, updateState]);

  return {
    ...state,
    updateState,
    fetchDonationData,
    rotateImpactStatement
  };
};

const Donate = ({ className = '' }) => {
  const { user, isAuthenticated } = useAuth();
  const {
    tiers,
    donationStats,
    recentDonations,
    isLoading,
    error,
    activeTab,
    lastUpdated,
    impactStatement,
    updateState,
    fetchDonationData,
    rotateImpactStatement
  } = useDonationManagement();

  const [donationForm, setDonationForm] = useState({
    selectedAmount: 50,
    customAmount: '',
    isProcessing: false,
    error: null,
    showSuccess: false,
    successData: null
  });

  // Load data on component mount
  useEffect(() => {
    fetchDonationData();
  }, [fetchDonationData]);

  // Rotate impact statements every 8 seconds
  useEffect(() => {
    const interval = setInterval(rotateImpactStatement, 8000);
    return () => clearInterval(interval);
  }, [rotateImpactStatement]);

  // Event handlers
  const handleAmountSelection = useCallback((amount) => {
    setDonationForm(prev => ({
      ...prev,
      selectedAmount: amount,
      customAmount: '',
      error: null,
      showSuccess: false
    }));
  }, []);

  const handleCustomAmount = useCallback((e) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && value > 0)) {
      setDonationForm(prev => ({
        ...prev,
        customAmount: value,
        selectedAmount: value ? parseInt(value) : 0,
        error: null,
        showSuccess: false
      }));
    }
  }, []);

  const handleDonationSuccess = useCallback((paymentIntent, donationData) => {
    setDonationForm(prev => ({ 
      ...prev, 
      isProcessing: false,
      showSuccess: true,
      successData: donationData
    }));
    
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

    // Scroll to success message
    setTimeout(() => {
      const successElement = document.getElementById('donation-success');
      if (successElement) {
        successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, [fetchDonationData]);

  const handleDonationError = useCallback((err) => {
    console.error('Donation error:', err);
    setDonationForm(prev => ({
      ...prev,
      isProcessing: false,
      error: err.message || 'Payment failed. Please try again.',
      showSuccess: false
    }));
  }, []);

  const handleRetry = useCallback(() => {
    fetchDonationData();
  }, [fetchDonationData]);

  const handleTabChange = useCallback((tab) => {
    updateState({ activeTab: tab, error: null });
  }, [updateState]);

  const handleNewDonation = useCallback(() => {
    setDonationForm({
      selectedAmount: 50,
      customAmount: '',
      isProcessing: false,
      error: null,
      showSuccess: false,
      successData: null
    });
  }, []);

  // Memoized values
  const currentAmount = donationForm.customAmount ? 
    parseInt(donationForm.customAmount) || 0 : 
    donationForm.selectedAmount;

  const selectedTier = useMemo(() => 
    tiers.find(tier => tier.amount === donationForm.selectedAmount) || {},
    [tiers, donationForm.selectedAmount]
  );

  const donationOverview = useMemo(() => [
    {
      label: 'Total Impact',
      value: `$${(donationStats?.totalAmount || 0).toLocaleString()}`,
      icon: FaDonate,
      color: 'primary',
      description: 'Total funds raised'
    },
    {
      label: 'Generous Donors',
      value: (donationStats?.totalDonors || 0).toLocaleString(),
      icon: FaUsers,
      color: 'secondary',
      description: 'Community supporters'
    },
    {
      label: 'Monthly Supporters',
      value: (donationStats?.monthlyDonors || 0).toLocaleString(),
      icon: FaChartLine,
      color: 'success',
      description: 'Ongoing partnerships'
    },
    {
      label: 'Current Goal',
      value: `$${(donationStats?.campaignGoal || 0).toLocaleString()}`,
      icon: FaHandHoldingHeart,
      color: 'info',
      description: 'Campaign target'
    }
  ], [donationStats]);

  if (isLoading && !donationStats) {
    return (
      <div className="donate-loading">
        <LoadingSpinner 
          message="Loading Donation Information..." 
          size="large"
        />
      </div>
    );
  }

  return (
    <div className={`donate-page ${className}`}>
      {/* Hero Section */}
      <section className="donate-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Support Our Ministry</h1>
            <p className="hero-subtitle">
              Your generous gift empowers generations through faith and transforms communities in South Sudan
            </p>
            <div className="impact-statement">
              <FaHeart className="impact-icon" />
              <span className="impact-text">{impactStatement}</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="giving-hand">
              <FaHandHoldingHeart />
            </div>
          </div>
        </div>
      </section>

      {/* Error Display */}
      {error && (
        <div className="donate-error">
          <ErrorMessage 
            message={error}
            onRetry={handleRetry}
            severity="error"
          />
        </div>
      )}

      {/* Success Message */}
      {donationForm.showSuccess && donationForm.successData && (
        <div id="donation-success" className="donation-success">
          <div className="success-content">
            <FaCheckCircle className="success-icon" />
            <div className="success-message">
              <h3>Thank You for Your Generous Gift!</h3>
              <p>
                Your donation of <strong>${donationForm.successData.amount}</strong> has been received. 
                You should receive a confirmation email shortly.
              </p>
              <div className="success-actions">
                <button onClick={handleNewDonation} className="btn btn-primary">
                  Make Another Donation
                </button>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="btn btn-outline"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="donate-content-wrapper">
        {/* Main Content */}
        <main className="donate-main-content">
          {/* Donation Options */}
          <section className="donation-options-section">
            <div className="section-header">
              <h2>Make a Difference Today</h2>
              <p>Choose how you'd like to support our mission</p>
            </div>

            {/* Donation Type Tabs */}
            <nav className="donation-tabs">
              {[
                { id: 'one-time', label: 'One-Time Gift', icon: FaDonate },
                { id: 'monthly', label: 'Monthly Support', icon: FaChartLine },
                { id: 'prayer', label: 'Prayer Support', icon: FaPray }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`donation-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  <tab.icon />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Amount Selection */}
            <div className="amount-selection">
              <h3>Select Your Gift Amount</h3>
              <div className="amount-tiers">
                {tiers.map((tier) => (
                  <div
                    key={tier.amount}
                    className={`amount-tier-card ${
                      donationForm.selectedAmount === tier.amount && !donationForm.customAmount ? 'selected' : ''
                    }`}
                    onClick={() => handleAmountSelection(tier.amount)}
                  >
                    <div className="tier-amount">${tier.amount}</div>
                    <div className="tier-label">{tier.label}</div>
                    {tier.description && (
                      <div className="tier-description">{tier.description}</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="custom-amount-section">
                <label htmlFor="customAmount" className="custom-amount-label">
                  Or enter a custom amount:
                </label>
                <div className="custom-amount-input">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    id="customAmount"
                    min="1"
                    max="10000"
                    value={donationForm.customAmount}
                    onChange={handleCustomAmount}
                    placeholder="Enter amount"
                    className="custom-amount-field"
                  />
                </div>
              </div>
            </div>

            {/* Donation Form */}
            {activeTab !== 'prayer' && (
              <ErrorBoundary>
                <div className="donation-form-section">
                  <div className="selected-amount-display">
                    <div className="amount-summary">
                      <span className="amount-label">Your {activeTab === 'monthly' ? 'Monthly' : 'One-Time'} Gift:</span>
                      <span className="amount-value">${currentAmount}</span>
                    </div>
                    {selectedTier.label && (
                      <div className="tier-badge">{selectedTier.label}</div>
                    )}
                  </div>

                  <DonationForm 
                    amount={currentAmount}
                    type={activeTab}
                    onSuccess={handleDonationSuccess}
                    onError={handleDonationError}
                    isProcessing={donationForm.isProcessing}
                  />

                  {donationForm.error && (
                    <ErrorMessage 
                      message={donationForm.error}
                      severity="error"
                    />
                  )}

                  {donationForm.isProcessing && (
                    <div className="processing-overlay">
                      <LoadingSpinner size="medium" />
                      <p>Processing your secure donation...</p>
                    </div>
                  )}
                </div>
              </ErrorBoundary>
            )}

            {/* Prayer Support */}
            {activeTab === 'prayer' && (
              <div className="prayer-support-section">
                <div className="prayer-content">
                  <FaPray className="prayer-icon" />
                  <h3>Join Our Prayer Team</h3>
                  <p>
                    Your prayers are powerful and essential to our ministry. 
                    Join our prayer team to receive monthly prayer requests and updates.
                  </p>
                  <form className="prayer-form">
                    <div className="form-group">
                      <label htmlFor="prayer-name">Your Name</label>
                      <input
                        type="text"
                        id="prayer-name"
                        placeholder="Enter your name"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="prayer-email">Email Address</label>
                      <input
                        type="email"
                        id="prayer-email"
                        placeholder="Enter your email"
                        className="form-input"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Join Prayer Team
                    </button>
                  </form>
                </div>
              </div>
            )}
          </section>

          {/* Impact Stats */}
          <section className="impact-stats-section">
            <h2>Your Impact in Action</h2>
            <div className="stats-grid">
              {donationOverview.map((stat, index) => (
                <div key={index} className={`impact-stat ${stat.color}`}>
                  <div className="stat-icon">
                    <stat.icon />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                    <div className="stat-description">{stat.description}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            {donationStats?.campaignGoal > 0 && (
              <div className="campaign-progress">
                <div className="progress-header">
                  <span>Current Campaign Progress</span>
                  <span>
                    ${(donationStats?.totalAmount || 0).toLocaleString()} of $
                    {(donationStats?.campaignGoal || 0).toLocaleString()}
                  </span>
                </div>
                <div className="progress-bar-container">
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
                  {Math.round(((donationStats?.totalAmount || 0) / donationStats.campaignGoal) * 100)}% towards our goal
                </div>
              </div>
            )}
          </section>
        </main>

        {/* Sidebar */}
        <aside className="donate-sidebar">
          {/* Recent Supporters */}
          <div className="recent-supporters">
            <h3>Recent Supporters</h3>
            {recentDonations.length > 0 ? (
              <div className="supporters-list">
                {recentDonations.slice(0, 8).map((donation, index) => (
                  <div key={index} className="supporter-item">
                    <div className="supporter-info">
                      <div className="supporter-name">
                        {donation.donorName || 'Anonymous Supporter'}
                      </div>
                      <div className="supporter-amount">
                        ${donation.amount}
                      </div>
                    </div>
                    <div className="supporter-time">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-supporters">
                <FaHandHoldingHeart />
                <p>Be the first to support our mission!</p>
              </div>
            )}
          </div>

          {/* Security Badge */}
          <div className="security-badge">
            <div className="security-header">
              <FaLock className="security-icon" />
              <span>Secure Donation</span>
            </div>
            <div className="security-features">
              <div className="security-item">
                <FaShieldAlt />
                <span>256-bit SSL Encryption</span>
              </div>
              <div className="security-item">
                <FaCheckCircle />
                <span>PCI DSS Compliant</span>
              </div>
              <div className="security-item">
                <FaExclamationTriangle />
                <span>Your data is protected</span>
              </div>
            </div>
          </div>

          {/* Quick Donation Widget */}
          <div className="quick-donation-widget">
            <h3>Quick Donate</h3>
            <SimpleDonation
              title="Fast & Secure"
              description="Support our mission in just a few clicks"
              onDonationStart={(amount) => console.log('Quick donation:', amount)}
              onDonationSuccess={handleDonationSuccess}
              onDonationError={handleDonationError}
              compact={true}
            />
          </div>
        </aside>
      </div>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="testimonials-header">
          <h2>Stories of Impact</h2>
          <p>See how your support changes lives</p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              "Because of generous donors, our community now has access to clean water and the Gospel message."
            </div>
            <div className="testimonial-author">- Pastor John, South Sudan</div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              "The support we received helped build a school where children can learn and grow in faith."
            </div>
            <div className="testimonial-author">- Teacher Sarah, Local Community</div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              "Monthly donations provide consistent support that allows us to plan for long-term impact."
            </div>
            <div className="testimonial-author">- Ministry Leader David</div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Is my donation tax-deductible?</h4>
            <p>Yes, Heavenly Nature Ministry is a registered 501(c)(3) nonprofit organization. All donations are tax-deductible to the extent allowed by law.</p>
          </div>
          <div className="faq-item">
            <h4>How will my donation be used?</h4>
            <p>Your gift supports our mission in South Sudan, including community development, education programs, and spreading the Gospel message.</p>
          </div>
          <div className="faq-item">
            <h4>Can I make a recurring donation?</h4>
            <p>Yes! You can choose monthly support when making your donation to provide consistent funding for our programs.</p>
          </div>
          <div className="faq-item">
            <h4>Is my payment information secure?</h4>
            <p>Absolutely. We use industry-standard SSL encryption and PCI-compliant payment processing to protect your information.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

Donate.propTypes = {
  className: PropTypes.string
};

Donate.defaultProps = {
  className: ''
};

export default Donate;
