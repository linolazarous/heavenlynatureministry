import React from 'react';
import { Link } from 'react-router-dom';

const Success = () => {
  return (
    <div className="success-page">
      <div className="container">
        <h1>Thank You!</h1>
        <p>Your donation was successful. We appreciate your support.</p>
        <Link to="/" className="cta-button">Return Home</Link>
      </div>
    </div>
  );
};

export default Success;
