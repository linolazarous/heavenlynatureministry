import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ livestreamActive }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Livestream', href: '/livestream' },
    { name: 'Donate', href: '/donate' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="site-header">
      <div className="header-container">
        <Link to="/" onClick={closeMenu} className="logo-link">
          <img src="/images/logo.webp" alt="Heavenly Nature Ministry Logo" width="180" height="50" />
        </Link>

        {/* Desktop nav */}
        <nav className="main-nav">
          <ul>
            {navigation.map(item => (
              <li key={item.name}>
                <Link 
                  to={item.href} 
                  className={location.pathname === item.href ? 'active' : ''}
                >
                  {item.name}
                  {item.name === 'Livestream' && livestreamActive && <span className="live-dot"></span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile menu toggle */}
        <button onClick={toggleMenu} className={`menu-toggle ${menuOpen ? 'open' : ''}`}>
          <span className="hamburger-box"><span className="hamburger-inner"></span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="mobile-menu">
          <ul>
            {navigation.map(item => (
              <li key={item.name}>
                <Link to={item.href} onClick={closeMenu}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
