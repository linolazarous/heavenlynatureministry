import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  FaQuoteLeft, 
  FaQuoteRight,
  FaChevronLeft,
  FaChevronRight,
  FaPause,
  FaPlay
} from 'react-icons/fa';
import '../css/Testimonials.css';

// Testimonials data
const TESTIMONIALS_DATA = [
  {
    id: 1,
    quote: "This ministry completely transformed my life. I was lost but now I'm found in Christ. The love and support I received here gave me hope when I had none.",
    author: "Mary K.",
    role: "Ministry Partner",
    location: "Juba, South Sudan",
    date: "2024-01-15"
  },
  {
    id: 2,
    quote: "The children's program saved my family. My kids now have hope, purpose, and a future. They're learning about God's love while getting the education they deserve.",
    author: "James L.",
    role: "Parent",
    location: "Gudele, Juba",
    date: "2024-02-20"
  },
  {
    id: 3,
    quote: "Through this ministry, I discovered my purpose in serving others. The discipleship program equipped me to lead and make a difference in my community.",
    author: "Sarah M.",
    role: "Volunteer Leader",
    location: "Juba Town",
    date: "2024-03-10"
  }
];

// Custom hook for testimonials carousel
const useTestimonialsCarousel = (testimonials, autoPlay = true, interval = 8000) => {
  const [state, setState] = useState({
    currentIndex: 0,
    isPlaying: autoPlay,
    direction: 'next',
    isTransitioning: false
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
    }, 300);
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
    toggleAutoPlay
  };
};

const Testimonials = ({ 
  testimonials = TESTIMONIALS_DATA,
  autoPlay = true,
  interval = 8000,
  showNavigation = true,
  showControls = true,
  className = ''
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
    toggleAutoPlay
  } = useTestimonialsCarousel(testimonials, autoPlay, interval);

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

  if (!testimonials || testimonials.length === 0) {
    return (
      <div className={`testimonials empty ${className}`}>
        <p>No testimonials available at this time.</p>
      </div>
    );
  }

  return (
    <section 
      className={`testimonials ${className} ${isTransitioning ? 'transitioning' : ''}`}
      aria-label="Testimonials"
    >
      <div className="testimonials-container">
        {/* Testimonial Content */}
        <div 
          className={`testimonial-content ${direction}`}
          key={currentTestimonial.id}
        >
          <div className="quote-decoration">
            <FaQuoteLeft className="quote-icon start" aria-hidden="true" />
          </div>
          
          <blockquote className="testimonial">
            <p className="quote-text" aria-live="polite">
              {currentTestimonial.quote}
            </p>
            
            <footer className="testimonial-footer">
              <cite className="testimonial-cite">
                <span className="author">{currentTestimonial.author}</span>
                <span className="role">{currentTestimonial.role}</span>
                {currentTestimonial.location && (
                  <span className="location">{currentTestimonial.location}</span>
                )}
              </cite>
            </footer>
          </blockquote>

          <div className="quote-decoration">
            <FaQuoteRight className="quote-icon end" aria-hidden="true" />
          </div>
        </div>

        {/* Navigation Controls */}
        {showControls && totalTestimonials > 1 && (
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
        {showNavigation && totalTestimonials > 1 && (
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
                aria-label={`View testimonial ${index + 1}`}
                aria-selected={index === currentIndex}
                role="tab"
                disabled={isTransitioning}
              />
            ))}
          </div>
        )}

        {/* Testimonial Counter */}
        {totalTestimonials > 1 && (
          <div className="testimonial-counter" aria-live="polite">
            {currentIndex + 1} of {totalTestimonials}
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
      date: PropTypes.string
    })
  ),
  autoPlay: PropTypes.bool,
  interval: PropTypes.number,
  showNavigation: PropTypes.bool,
  showControls: PropTypes.bool,
  className: PropTypes.string
};

Testimonials.defaultProps = {
  testimonials: TESTIMONIALS_DATA,
  autoPlay: true,
  interval: 8000,
  showNavigation: true,
  showControls: true,
  className: ''
};

export default Testimonials;