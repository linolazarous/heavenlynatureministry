// src/pages/Donation.jsx
import React from 'react';
import '../css/Donation.css';

const Donation = () => {
  return (
    <div className="donation-page">
      <h1>Give Generously</h1>
      <p>Your support helps us reach more communities and impact more lives.</p>

      <section className="donation-options">
        <a href="/donate/one-time" className="donation-btn">One-Time Donation</a>
        <a href="/donate/monthly" className="donation-btn">Monthly Support</a>
      </section>

      <section className="donation-info">
        <h2>How Donations Are Used</h2>
        <ul>
          <li>Community Outreach Programs</li>
          <li>Prayer and Counseling Services</li>
          <li>Livestream & Ministry Operations</li>
        </ul>
      </section>
    </div>
  );
};

export default Donation;
