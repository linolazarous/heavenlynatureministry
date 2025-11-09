import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  FaQuoteLeft, 
  FaQuoteRight,
  FaChevronLeft,
  FaChevronRight,
  FaPause,
  FaPlay,
  FaStar
} from 'react-icons/fa';
import './Testimonials.css';

// Testimonials data
const TESTIMONIALS_DATA = [
  {
    id: 1,
    quote: "This ministry completely transformed my life. I was lost but now I'm found in Christ. The love and support I received here gave me hope when I had none.",
    author: "Mary K.",
    role: "Ministry Partner",
    location: "Juba, South Sudan",
    date: "2024-01-15",
    rating: 5
  },
  {
    id: 2,
    quote: "The children's program saved my family. My kids now have hope, purpose, and a future. They're learning about God's love while getting the education they deserve.",
    author: "James L.",
    role: "Parent",
    location: "Gudele, Juba",
    date: "2024-02-20",
    rating: 5
  },
  {
    id: 3,
    quote: "Through this ministry, I discovered my purpose in serving others. The discipleship program equipped me to lead and make a difference in my community.",
    author: "Sarah M.",
    role: "Volunteer Leader",
    location: "Juba Town",
    date: "2024-03-10",
    rating: 5
  },
  {
    id: 4,
    quote: "The worship services have been a source of strength and encouragement. I've grown spiritually and found a community that feels like family.",
    author: "David P.",
    role: "Church Member",
    location: "Munuki, Juba",
    date: "2024-03-25",
    rating: 5
  },
  {
    id: 5,
    quote: "As a youth, this ministry provided me with guidance and direction. The mentorship program helped me navigate life's challenges with faith.",
    author: "Grace A.",
    role: "Youth Member",
    location: "Juba",
    date: "2024-04-05",
    rating: 5
  }
];

// Custom hook for testimonials carousel
const useTestimonialsCarousel = (testimonials, autoPlay = true, interval = 8000) => {
  const [state, setState] = useState({
    currentIndex: 0,
    isPlaying: autoPlay,
    direction: 'next',
    isTransitioning: false,
    touchStartX: 0
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const totalTestimonials = testimonials.length;

  const navigateTo = useCallback((newIndex, direction = 'next') => {
    if (state.isTransitioning) return;
    
    updateState({ 
      isTransitioning: true,
      direction 
    });

    // Allow transition to complete before updating index
    setTimeout(() => {
      updateState({ 
        currentIndex: newIndex,
        isTransitioning: false
      });
    }, 500);
  }, [state.isTransitioning, updateState]);

  const nextTestimonial = useCallback(() => {
    const newIndex = (state.currentIndex + 1) % totalTestimonials;
    navigateTo(newIndex, 'next');
  }, [state.currentIndex, totalTestimonials, navigateTo]);

  const prevTestimonial = useCallback(() => {
    const newIndex = state.currentIndex === 0 ? totalTestimonials - 1 : state.currentIndex - 1;
    navigateTo(newIndex, 'prev');
  }, [state.currentIndex, totalTestimonials, navigateTo]);

  const goToTestimonial = useCallback((index) => {
    if (index === state.currentIndex) return;
    
    const direction = index > state.currentIndex ? 'next' : 'prev';
    navigateTo(index, direction);
  }, [state.currentIndex, navigateTo]);

  const toggleAutoPlay = useCallback(() => {
    updateState(prev => ({ 
      ...prev, 
      isPlaying: !prev.isPlaying 
    }));
  }, [updateState]);

  // Touch handlers for mobile swipe
  const handleTouchStart = useCallback((e) => {
    updateState({ touchStartX: e.touches[0].clientX });
  }, [updateState]);

  const handleTouchEnd = useCallback((e) => {
    if (!state.touchStartX) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = state.touchStartX - touchEndX;

    // Minimum swipe distance
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextTestimonial();
      } else {
        prevTestimonial();
      }
    }

    updateState({ touchStartX: 0 });
  }, [state.touchStartX, nextTestimonial, prevTestimonial, updateState]);

  // Auto-play effect
  useEffect(() => {
    if (!state.isPlaying || totalTestimonials <= 1) return;

    const intervalId = setInterval(nextTestimonial, interval);

    return () => clearInterval(intervalId);
  }, [state.isPlaying, nextTestimonial, interval, totalTestimonials]);

  return {
    ...state,
    totalTestimonials,
    nextTestimonial,
    prevTestimonial,
    goToTestimonial,
    toggleAutoPlay,
    handleTouchStart,
    handleTouchEnd
  };
};

// Star Rating Component
const StarRating = ({ rating, maxRating = 5 }) => {
  return (
    <div className="star-rating" aria-label={`Rating: ${rating} out of ${maxRating} stars`}>
      {[...Array(maxRating)].map((_, index) => (
        <FaStar
          key={index}
          className={`star ${index < rating ? 'filled' : 'empty'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  maxRating: PropTypes.number
};

const Testimonials = ({ 
  testimonials = TESTIMONIALS_DATA,
  autoPlay = true,
  interval = 8000,
  showNavigation = true,
  showControls = true,
  showRating = true,
  className = '',
  title = "What People Are Saying"
}) => {
  const {
    currentIndex,
    isPlaying,
    direction,
    isTransitioning,
    totalTestimonials,
    nextTestimonial,
    prevTestimonial,
    goToTestimonial,
    toggleAutoPlay,
    handleTouchStart,
    handleTouchEnd
  } = useTestimonialsCarousel(testimonials, autoPlay, interval);

  const containerRef = useRef(null);

  const currentTestimonial = useMemo(() => 
    testimonials[currentIndex],
    [testimonials, currentIndex]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevTestimonial();
      if (e.key === 'ArrowRight') nextTestimonial();
      if (e.key === ' ') {
        e.preventDefault();
        toggleAutoPlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevTestimonial, nextTestimonial, toggleAutoPlay]);

  // Format date
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  if (!testimonials || testimonials.length === 0) {
    return (
      <section className={`testimonials empty ${className}`}>
        <div className="testimonials-container">
          <h2 className="testimonials-title">{title}</h2>
          <p className="no-testimonials">No testimonials available at this time.</p>
        </div>
      </section>
    );
  }

  return (
    <section 
      className={`testimonials ${className}`}
      aria-label="Testimonials"
      ref={containerRef}
    >
      <div className="testimonials-container">
        <h2 className="testimonials-title">{title}</h2>
        
        <div 
          className={`testimonial-content ${direction} ${isTransitioning ? 'transitioning' : ''}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="region"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="quote-decoration">
            <FaQuoteLeft className="quote-icon start" aria-hidden="true" />
          </div>
          
          <blockquote className="testimonial">
            <div className="testimonial-body">
              {showRating && currentTestimonial.rating && (
                <StarRating rating={currentTestimonial.rating} />
              )}
              
              <p className="quote-text">
                {currentTestimonial.quote}
              </p>
            </div>
            
            <footer className="testimonial-footer">
              <cite className="testimonial-cite">
                <span className="author">{currentTestimonial.author}</span>
                <div className="cite-details">
                  <span className="role">{currentTestimonial.role}</span>
                  {currentTestimonial.location && (
                    <span className="location">{currentTestimonial.location}</span>
                  )}
                  {currentTestimonial.date && (
                    <span className="date">{formatDate(currentTestimonial.date)}</span>
                  )}
                </div>
              </cite>
            </footer>
          </blockquote>

          <div className="quote-decoration">
            <FaQuoteRight className="quote-icon end" aria-hidden="true" />
          </div>
        </div>

        {/* Controls Container */}
        {(showControls || showNavigation) && totalTestimonials > 1 && (
          <div className="testimonials-controls-container">
            {/* Navigation Controls */}
            {showControls && (
              <div className="testimonial-controls">
                <button
                  className="control-btn prev-btn"
                  onClick={prevTestimonial}
                  aria-label="Previous testimonial"
                  disabled={isTransitioning}
                >
                  <FaChevronLeft aria-hidden="true" />
                </button>

                <button
                  className={`control-btn play-pause-btn ${isPlaying ? 'playing' : 'paused'}`}
                  onClick={toggleAutoPlay}
                  aria-label={isPlaying ? 'Pause testimonials' : 'Play testimonials'}
                >
                  {isPlaying ? <FaPause aria-hidden="true" /> : <FaPlay aria-hidden="true" />}
                </button>

                <button
                  className="control-btn next-btn"
                  onClick={nextTestimonial}
                  aria-label="Next testimonial"
                  disabled={isTransitioning}
                >
                  <FaChevronRight aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Navigation Dots */}
            {showNavigation && (
              <div 
                className="testimonial-nav"
                role="tablist"
                aria-label="Testimonial navigation"
              >
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`nav-dot ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => goToTestimonial(index)}
                    aria-label={`View testimonial ${index + 1} of ${totalTestimonials}`}
                    aria-selected={index === currentIndex}
                    role="tab"
                    disabled={isTransitioning}
                  />
                ))}
              </div>
            )}

            {/* Testimonial Counter */}
            <div className="testimonial-counter" aria-live="polite">
              {currentIndex + 1} / {totalTestimonials}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

Testimonials.propTypes = {
  testimonials: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      quote: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      role: PropTypes.string,
      location: PropTypes.string,
      date: PropTypes.string,
      rating: PropTypes.number
    })
  ),
  autoPlay: PropTypes.bool,
  interval: PropTypes.number,
  showNavigation: PropTypes.bool,
  showControls: PropTypes.bool,
  showRating: PropTypes.bool,
  className: PropTypes.string,
  title: PropTypes.string
};

Testimonials.defaultProps = {
  testimonials: TESTIMONIALS_DATA,
  autoPlay: true,
  interval: 8000,
  showNavigation: true,
  showControls: true,
  showRating: true,
  className: '',
  title: "What People Are Saying"
};

export default Testimonials;
