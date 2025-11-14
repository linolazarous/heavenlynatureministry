// src/pages/About.jsx
import React from 'react';
import '../css/About.css';

const About = () => {
  return (
    <div className="about-page">
      <h1>About Heavenly Nature Ministry</h1>
      <p>We are dedicated to spreading faith, hope, and love across South Sudan and beyond.</p>

      <section className="about-mission">
        <h2>Our Mission</h2>
        <p>To empower communities, support the vulnerable, and provide spiritual guidance through prayer and service.</p>
      </section>

      <section className="about-vision">
        <h2>Our Vision</h2>
        <p>To be a beacon of hope and a global community that uplifts lives through faith-driven initiatives.</p>
      </section>
    </div>
  );
};

export default About;
