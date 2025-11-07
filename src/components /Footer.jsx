// src/components/Footer.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  // Footer navigation matching main app routes
  const footerLinks = [
    { name: 'Home', path: '/', icon: 'fas fa-home' },
    { name: 'Livestream', path: '/livestream', icon: 'fas fa-broadcast-tower' },
    { name: 'Donate', path: '/donate', icon: 'fas fa-donate' },
    { name: 'Profile', path: '/profile', icon: 'fas fa-user' },
  ];

  const serviceLinks = [
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms & Conditions', path: '/terms' },
    { name: 'Contact Support', path: '/contact' },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-grid">
          {/* Ministry Info */}
          <div className="footer-section footer-about">
            <div className="footer-logo">
              <img
                src="/images/logo-white.webp"
                alt="Heavenly Nature Ministry Logo"
                width="180"
                height="50"
                loading="lazy"
                className="footer-logo-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              {/* Fallback text logo */}
              <div className="footer-text-logo" style={{display: 'none'}}>
                <span className="footer-logo-text">Heavenly Nature Ministry</span>
              </div>
            </div>
            <p className="footer-mission">
              "Empowering South Sudan's vulnerable children through
              Christ-centered transformation—spiritually, physically, and mentally—
              to build self-reliant, God-fearing generations."
            </p>
            <div className="social-links">
              <a
                href="https://www.facebook.com/share/12LD7tYTe1z/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="social-link"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="https://www.youtube.com/@HeavenlyNatureMinistryInc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="social-link"
              >
                <i className="fab fa-youtube"></i>
              </a>
              <a
                href="https://wa.me/211926006202"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="social-link"
              >
                <i className="fab fa-whatsapp"></i>
              </a>
              <a
                href="mailto:info@heavenlynature.org"
                aria-label="Email"
                className="social-link"
              >
                <i className="fas fa-envelope"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section footer-navigation">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links-list">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className={`footer-link ${location.pathname === link.path ? 'active' : ''}`}
                  >
                    <i className={link.icon}></i>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Times */}
          <div className="footer-section footer-services">
            <h3 className="footer-heading">Service Times</h3>
            <div className="service-times">
              <div className="service-time-item">
                <i className="far fa-clock service-icon"></i>
                <div className="service-details">
                  <strong>Sunday Service</strong>
                  <span>10:00 AM - 1:00 PM CAT</span>
                </div>
              </div>
              <div className="service-time-item">
                <i className="far fa-clock service-icon"></i>
                <div className="service-details">
                  <strong>Bible Study</strong>
                  <span>Mon, Thu, Fri @ 4:00 PM</span>
                </div>
              </div>
              <div className="service-time-item">
                <i className="fas fa-pray service-icon"></i>
                <div className="service-details">
                  <strong>Prayer Meeting</strong>
                  <span>Wednesday @ 6:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="footer-section footer-contact">
            <h3 className="footer-heading">Contact Info</h3>
            <div className="contact-info">
              <div className="contact-item">
                <i className="fas fa-map-marker-alt contact-icon"></i>
                <div className="contact-details">
                  <strong>Location</strong>
                  <span>Juba, South Sudan</span>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone contact-icon"></i>
                <div className="contact-details">
                  <strong>Phone</strong>
                  <a href="tel:+211926006202">+211 926 006 202</a>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope contact-icon"></i>
                <div className="contact-details">
                  <strong>Email</strong>
                  <a href="mailto:info@heavenlynature.org">info@heavenlynature.org</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; {currentYear} Heavenly Nature Ministry. All Rights Reserved.</p>
            </div>
            <div className="legal-links">
              {serviceLinks.map((link, index) => (
                <React.Fragment key={link.name}>
                  <Link to={link.path} className="legal-link">
                    {link.name}
                  </Link>
                  {index < serviceLinks.length - 1 && (
                    <span className="link-separator">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
