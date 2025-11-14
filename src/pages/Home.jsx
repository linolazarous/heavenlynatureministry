// src/pages/Home.jsx
import React from 'react';
import HeroSection from '../components/HeroSection';
import EventCalendar from '../components/EventCalendar';
import '../css/HomePage.css';

const Home = () => {
  const impactCards = [
    { title: 'Community Outreach', stat: '12+', description: 'Transforming lives through faith and service', color: 'primary' },
    { title: 'Lives Impacted', stat: '5,000+', description: 'Bringing hope and healing to generations', color: 'secondary' },
    { title: 'Prayer Support', stat: '1,200+', description: 'Join our global prayer community', color: 'prayer' },
    { title: 'Generous Support', stat: '$250,000', description: 'Partner with us in ministry', color: 'donate' }
  ];

  const actionCards = [
    { title: 'Give Generously', description: 'Support our mission', href: '/donate', color: 'donate' },
    { title: 'Upcoming Events', description: 'See what\'s happening', href: '/events', color: 'events' },
    { title: 'Request Prayer', description: 'Share your prayer needs', href: '/prayer', color: 'prayer' }
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
        <h2>Our Impact Together</h2>
        <div className="impact-grid">
          {impactCards.map((card, idx) => (
            <div key={idx} className={`impact-card ${card.color}`}>
              <h3>{card.title}</h3>
              <p className="stat">{card.stat}</p>
              <p>{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="actions-section">
        <h2>Get Involved Today</h2>
        <div className="actions-grid">
          {actionCards.map((card, idx) => (
            <a key={idx} href={card.href} className={`action-card ${card.color}`}>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </a>
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
