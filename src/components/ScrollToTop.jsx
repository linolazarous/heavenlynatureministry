// src/components/ScrollToTop.jsx
import React, { useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = ({ children = null, behavior = 'smooth', onScroll }, ref) => {
  const location = useLocation();
  const previousPathname = useRef('');

  // Scroll function
  const scrollToTop = useCallback((options = {}) => {
    const scrollOptions = { top: 0, left: 0, behavior: options.behavior || behavior };
    try {
      window.scrollTo(scrollOptions);
    } catch {
      window.scrollTo(0, 0); // fallback for unsupported browsers
    }
  }, [behavior]);

  // Detect if same route with only a hash change
  const isSameRouteWithHash = useCallback((currentPath, previousPath) => {
    if (!previousPath) return false;
    return currentPath.split('#')[0] === previousPath.split('#')[0] && currentPath.includes('#');
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    const currentPath = location.pathname + location.search + location.hash;

    if (!isSameRouteWithHash(currentPath, previousPathname.current)) {
      scrollToTop();
    }

    previousPathname.current = currentPath;
  }, [location.pathname, location.search, location.hash, scrollToTop, isSameRouteWithHash]);

  // Expose scroll function via ref
  useImperativeHandle(ref, () => ({
    scrollToTop: (options) => scrollToTop(options),
  }));

  // Optional callback on scroll
  useEffect(() => {
    if (onScroll) onScroll();
  }, [onScroll]);

  return children || null;
};

const ScrollToTopWithRef = forwardRef(ScrollToTop);
ScrollToTopWithRef.displayName = 'ScrollToTop';

export default ScrollToTopWithRef;
