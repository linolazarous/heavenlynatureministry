// src/pages/Home.jsx
import React from 'react';
import HeroSection from '../components/HeroSection';
import EventCalendar from '../components/EventCalendar';
import '../css/HomePage.css';

const Home = () => {
  const impactCards = [
    { title: 'Community Outreach', stat: '12+', description: 'Transforming lives', color: 'primary' },
    { title: 'Lives Impacted', stat: '5,000+', description: 'Hope and healing', color: 'secondary' },
    { title: 'Prayer Support', stat: '1,200+', description: 'Join our prayer community', color: 'prayer' },
    { title: 'Generous Support', stat: '$250,000', description: 'Partner with us', color: 'donate' }
  ];

  return (
    <div className="home-page">
      <HeroSection 
        title="Welcome to Heavenly Nature Ministry"
        subtitle="Empowering generations through faith, hope, and love in South Sudan"
        ctaText="Watch Latest Sermon"
        ctaLink="/sermons"
        secondaryCtaText="Learn About Our Mission"
        secondaryCtaLink="/about"
        backgroundImage="/images/hero-bg.jpg"
      />

      <section className="impact-section">
        <div className="impact-grid">
          {impactCards.map((card, idx) => (
            <div key={idx} className={`impact-card ${card.color}`}>
              <h3>{card.title}</h3>
              <p>{card.stat}</p>
              <p>{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="calendar-section">
        <EventCalendar />
      </section>
    </div>
  );
};

export default Home;
