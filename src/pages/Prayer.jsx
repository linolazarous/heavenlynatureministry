// src/pages/Prayer.jsx
import React from 'react';
import '../css/Prayer.css';

const Prayer = () => {
  return (
    <div className="prayer-page">
      <h1>Request Prayer</h1>
      <p>Submit your prayer requests and join our global prayer community.</p>

      <section className="prayer-form">
        <form action="/submit-prayer" method="POST">
          <label>Name</label>
          <input type="text" name="name" required />

          <label>Email</label>
          <input type="email" name="email" required />

          <label>Prayer Request</label>
          <textarea name="prayer" rows="5" required></textarea>

          <button type="submit">Submit Prayer Request</button>
        </form>
      </section>

      <section className="prayer-info">
        <h2>Join Our Prayer Community</h2>
        <p>We pray for thousands of people every day. Your prayer request is important to us.</p>
      </section>
    </div>
  );
};

export default Prayer;
