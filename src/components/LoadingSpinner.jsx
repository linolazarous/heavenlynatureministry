import React from 'react';
import PropTypes from 'prop-types';
import { FaSpinner } from 'react-icons/fa';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = '#4a6fa5', 
  text = '',
  overlay = false,
  fullScreen = false,
  className = ''
}) => {
  const sizeConfig = {
    small: {
      iconSize: '1.5rem',
      textSize: '0.875rem'
    },
    medium: {
      iconSize: '3rem',
      textSize: '1rem'
    },
    large: {
      iconSize: '5rem',
      textSize: '1.125rem'
    }
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;

  const spinnerContent = (
    <div className={`loading-spinner ${className}`}>
      <div 
        className="spinner-icon"
        style={{ 
          color,
          fontSize: currentSize.iconSize
        }}
        aria-hidden="true"
      >
        <FaSpinner />
      </div>
      {text && (
        <div 
          className="spinner-text"
          style={{ fontSize: currentSize.textSize }}
        >
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-spinner-fullscreen" role="status" aria-live="polite">
        {spinnerContent}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="loading-spinner-overlay" role="status" aria-live="polite">
        {spinnerContent}
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite">
      {spinnerContent}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.string,
  text: PropTypes.string,
  overlay: PropTypes.bool,
  fullScreen: PropTypes.bool,
  className: PropTypes.string
};

export default LoadingSpinner;
