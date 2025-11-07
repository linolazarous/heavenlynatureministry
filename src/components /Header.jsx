// heavenlynatureministry/components/Header.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo-container">
          <Link to="/" aria-label="Home - Heavenly Nature Ministry">
            <img
              src="/images/logo.webp"
              alt="Heavenly Nature Ministry Logo"
              width="180"
              height="50"
              loading="lazy"
            />
          </Link>
        </div>

        <nav id="main-navigation" className="main-nav" aria-label="Main navigation">
          <ul className="nav-list">
            <li><Link to="#about" className="nav-link">About Us</Link></li>
            <li><Link to="#mission" className="nav-link">Our Mission</Link></li>
            <li><Link to="#events" className="nav-link">Events</Link></li>
            <li><Link to="#gallery" className="nav-link">Gallery</Link></li>
            <li><Link to="#contact" className="nav-link">Contact</Link></li>
            <li><Link to="#donate" className="nav-link donate-button">Donate</Link></li>
          </ul>
        </nav>

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
          <li><Link to="#about" onClick={closeMenu} className="mobile-nav-link">About Us</Link></li>
          <li><Link to="#mission" onClick={closeMenu} className="mobile-nav-link">Our Mission</Link></li>
          <li><Link to="#events" onClick={closeMenu} className="mobile-nav-link">Events</Link></li>
          <li><Link to="#gallery" onClick={closeMenu} className="mobile-nav-link">Gallery</Link></li>
          <li><Link to="#donate" onClick={closeMenu} className="mobile-nav-link donate-button">Donate</Link></li>
          <li><Link to="#contact" onClick={closeMenu} className="mobile-nav-link">Contact</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;