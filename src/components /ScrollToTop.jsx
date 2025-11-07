import React, { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

// Custom hook for scroll management
const useScrollToTop = (behavior = 'smooth') => {
  const location = useLocation();
  const previousPathname = useRef('');

  const scrollToTop = useCallback((options = {}) => {
    const scrollOptions = {
      top: 0,
      left: 0,
      behavior: options.behavior || behavior,
      ...options
    };

    // Try smooth scrolling first, fallback to instant
    try {
      window.scrollTo(scrollOptions);
    } catch (error) {
      console.warn('Smooth scrolling not supported, using instant scroll');
      window.scrollTo(0, 0);
    }
  }, [behavior]);

  const isSameRouteWithHash = useCallback((currentPath, previousPath) => {
    if (!previousPath) return false;
    
    const currentWithoutHash = currentPath.split('#')[0];
    const previousWithoutHash = previousPath.split('#')[0];
    
    return currentWithoutHash === previousWithoutHash && currentPath.includes('#');
  }, []);

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    // Don't scroll to top if it's the same route with just a hash change
    if (isSameRouteWithHash(currentPath, previousPathname.current)) {
      previousPathname.current = currentPath;
      return;
    }

    // Scroll to top on route change
    scrollToTop();
    previousPathname.current = currentPath;
  }, [location.pathname, location.search, location.hash, scrollToTop, isSameRouteWithHash]);

  return { scrollToTop };
};

const ScrollToTop = ({ 
  children = null, 
  behavior = 'smooth',
  onScroll,
  ...props 
}) => {
  const { scrollToTop } = useScrollToTop(behavior);

  // Optional: Expose scroll function via ref if needed
  React.useImperativeHandle(props.forwardedRef, () => ({
    scrollToTop: (options) => scrollToTop(options)
  }));

  // Call onScroll callback if provided
  useEffect(() => {
    if (onScroll) {
      onScroll();
    }
  }, [location.pathname, onScroll]);

  return children || null;
};

ScrollToTop.propTypes = {
  children: PropTypes.node,
  behavior: PropTypes.oneOf(['smooth', 'instant', 'auto']),
  onScroll: PropTypes.func,
  forwardedRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ])
};

ScrollToTop.defaultProps = {
  behavior: 'smooth'
};

// Forward ref version for class components or direct access
const ScrollToTopWithRef = React.forwardRef((props, ref) => (
  <ScrollToTop {...props} forwardedRef={ref} />
));

ScrollToTopWithRef.displayName = 'ScrollToTop';

export default ScrollToTopWithRef;