// src/components/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ livestreamActive, nextStream }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Navigation items matching App.jsx routes
  const navigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Livestream', href: '/livestream', current: location.pathname === '/livestream' },
    { name: 'Donate', href: '/donate', current: location.pathname === '/donate' },
    { name: 'Profile', href: '/profile', current: location.pathname === '/profile' },
  ];

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo-container">
          <Link to="/" aria-label="Home - Heavenly Nature Ministry" onClick={closeMenu}>
            <img
              src="/images/logo.webp"
              alt="Heavenly Nature Ministry Logo"
              width="180"
              height="50"
              loading="lazy"
              className="logo-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            {/* Fallback text logo */}
            <div className="text-logo" style={{display: 'none'}}>
              <span className="logo-text">Heavenly Nature Ministry</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav id="main-navigation" className="main-nav" aria-label="Main navigation">
          <ul className="nav-list">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link 
                  to={item.href} 
                  className={`nav-link ${item.current ? 'nav-link-active' : ''} ${
                    item.name === 'Livestream' && livestreamActive ? 'live-indicator' : ''
                  }`}
                >
                  {item.name}
                  {item.name === 'Livestream' && livestreamActive && (
                    <span className="live-dot" aria-label="Live Stream Active"></span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className={`menu-toggle ${menuOpen ? "open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={toggleMenu}
        >
          <span className="hamburger-box">
            <span className="hamburger-inner"></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      <nav
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? "active" : ""}`}
        aria-label="Mobile navigation"
      >
        <ul className="mobile-nav-list">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link 
                to={item.href} 
                onClick={closeMenu}
                className={`mobile-nav-link ${item.current ? 'mobile-nav-link-active' : ''} ${
                  item.name === 'Donate' ? 'mobile-donate-button' : ''
                } ${
                  item.name === 'Livestream' && livestreamActive ? 'mobile-live-indicator' : ''
                }`}
              >
                {item.name}
                {item.name === 'Livestream' && livestreamActive && (
                  <span className="mobile-live-dot" aria-label="Live Stream Active"></span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Livestream Status in Mobile Menu */}
        {livestreamActive && (
          <div className="mobile-live-status">
            <div className="live-badge-mobile">
              <span className="pulse-dot"></span>
              LIVE NOW - Sunday Service
            </div>
            <Link 
              to="/livestream" 
              onClick={closeMenu}
              className="watch-now-button-mobile"
            >
              Watch Now
            </Link>
          </div>
        )}
      </nav>

      {/* Livestream Alert Banner */}
      {livestreamActive && (
        <div className="livestream-alert-banner">
          <div className="alert-content">
            <div className="live-indicator-group">
              <span className="pulse-dot"></span>
              <strong>LIVE NOW:</strong> Sunday Service is streaming
            </div>
            <Link to="/livestream" className="watch-now-link">
              Join Live Stream →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
