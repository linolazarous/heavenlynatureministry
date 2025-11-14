// src/components/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const Header = ({ livestreamActive }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Livestream', href: '/livestream' },
    { name: 'Donate', href: '/donate' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo-container">
          <Link to="/" onClick={closeMenu}>
            <img
              src="/images/logo.webp"
              alt="Heavenly Nature Ministry Logo"
              width="180"
              height="50"
              className="logo-image"
            />
          </Link>
        </div>

        <nav className="main-nav">
          <ul className="nav-list">
            {navigation.map(item => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={location.pathname === item.href ? 'nav-link-active' : ''}
                >
                  {item.name}
                  {item.name === 'Livestream' && livestreamActive && (
                    <span className="live-dot" aria-label="Live Stream Active"></span>
                  )}
                </Link>
              </li>
            ))}
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/profile">Profile</Link>
                </li>
                <li>
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/login">Login</Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className={`menu-toggle ${menuOpen ? "open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          <span className="hamburger-box"><span className="hamburger-inner"></span></span>
        </button>
      </div>

      {/* Livestream alert */}
      {livestreamActive && (
        <div className="livestream-alert-banner">
          <span className="pulse-dot"></span>
          LIVE NOW - Sunday Service
          <Link to="/livestream">Join Live →</Link>
        </div>
      )}
    </header>
  );
};

export default Header;
