import React from 'react';
import { Link } from 'react-router-dom';

const Cancel = () => {
  return (
    <div className="cancel-page">
      <div className="container">
        <h1>Donation Cancelled</h1>
        <p>Your donation was cancelled. If this was a mistake, you can try again.</p>
        <Link to="/donate" className="cta-button">Try Again</Link>
      </div>
    </div>
  );
};

export default Cancel;
