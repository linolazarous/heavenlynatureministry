// heavenlynatureministry/components/Footer.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  useEffect(() => {
    document.getElementById("current-year").textContent = new Date().getFullYear();
  }, []);

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-about">
            <img
              src="/images/logo-white.webp"
              alt="Heavenly Nature Ministry Logo"
              width="180"
              height="50"
              loading="lazy"
            />
            <p>
              "Empowering South Sudan's vulnerable children through
              Christ-centered transformation—spiritually, physically, and mentally—
              to build self-reliant, God-fearing generations."
            </p>
            <div className="social-icons">
              <a
                href="https://www.facebook.com/share/12LD7tYTe1z/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook"></i>
              </a>

              <a
                href="https://www.youtube.com/@HeavenlyNatureMinistryInc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <i className="fab fa-youtube"></i>
              </a>

              <a
                href="https://wa.me/211926006202"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>

          <nav className="footer-links" aria-label="Footer navigation">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="#about"><i className="fas fa-chevron-right"></i> About Us</Link></li>
              <li><Link to="#mission"><i className="fas fa-chevron-right"></i> Our Mission</Link></li>
              <li><Link to="#events"><i className="fas fa-chevron-right"></i> Events</Link></li>
              <li><Link to="#gallery"><i className="fas fa-chevron-right"></i> Gallery</Link></li>
              <li><Link to="#donate"><i className="fas fa-chevron-right"></i> Donate</Link></li>
              <li><Link to="#contact"><i className="fas fa-chevron-right"></i> Contact</Link></li>
            </ul>
          </nav>

          <div className="footer-contact">
            <h3>Service Times</h3>
            <p><i className="far fa-clock"></i> Sunday: 9:00 AM - 1:00 PM</p>
            <p><i className="far fa-clock"></i> Bible Study: Mon, Thu, Fri @ 4PM</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; <span id="current-year"></span> Heavenly Nature Ministry. All Rights Reserved.</p>
          <div className="legal-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <span className="separator">|</span>
            <Link to="/terms-and-conditions">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;