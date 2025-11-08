// src/components/HeroSection.jsx
import React from 'react';

const HeroSection = ({ 
  title = "Welcome to Heavenly Nature Ministry",
  subtitle = "\"We are one\" — Empowering South Sudan's vulnerable children through Christ-centered transformation—spiritually, physically, and mentally.",
  ctaText = "Help Our Mission", 
  ctaLink = "#donate",
  secondaryCtaText = "Get In Touch",
  secondaryCtaLink = "#contact",
  isLive = false,
  liveLabel = "Live Now",
  backgroundImage = "/images/hero-bg.jpg"
}) => {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-overlay"></div>
      <div className="hero-content" data-aos="fade-up">
        {/* Live Stream Badge */}
        {isLive && (
          <div className="live-badge" data-aos="fade-down">
            <span className="live-pulse"></span>
            {liveLabel}
          </div>
        )}
        
        <h1 id="hero-heading">{title}</h1>
        <p className="hero-tagline">{subtitle}</p>
        
        <div className="hero-buttons">
          <a href={ctaLink} className="cta-button">
            <i className="fas fa-hand-holding-heart"></i> {ctaText}
          </a>
          <a href={secondaryCtaLink} className="cta-button outline">
            <i className="fas fa-envelope"></i> {secondaryCtaText}
          </a>
        </div>
      </div>

      <style jsx>{`
        .hero {
          position: relative;
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(26, 75, 140, 0.9) 0%, rgba(42, 157, 143, 0.8) 100%),
                      url('${backgroundImage}') center/cover no-repeat;
          color: white;
          text-align: center;
          padding: 4rem 2rem;
          overflow: hidden;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #e53e3e;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 2rem;
          animation: pulse 2s infinite;
        }

        .live-pulse {
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: livePulse 1.5s infinite;
        }

        h1 {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1.2;
          font-family: 'Playfair Display', serif;
        }

        .hero-tagline {
          font-size: 1.25rem;
          margin-bottom: 2.5rem;
          line-height: 1.6;
          opacity: 0.95;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 1.1rem;
        }

        .cta-button:not(.outline) {
          background: #e53e3e;
          color: white;
          border: 2px solid #e53e3e;
        }

        .cta-button:not(.outline):hover {
          background: #c53030;
          border-color: #c53030;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(229, 62, 62, 0.3);
        }

        .cta-button.outline {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .cta-button.outline:hover {
          background: white;
          color: #1a4b8c;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);
        }

        @keyframes livePulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.7;
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(229, 62, 62, 0);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero {
            min-height: 70vh;
            padding: 3rem 1rem;
          }

          h1 {
            font-size: 2.5rem;
          }

          .hero-tagline {
            font-size: 1.125rem;
          }

          .hero-buttons {
            flex-direction: column;
            align-items: center;
          }

          .cta-button {
            width: 100%;
            max-width: 300px;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          h1 {
            font-size: 2rem;
          }

          .hero-tagline {
            font-size: 1rem;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
