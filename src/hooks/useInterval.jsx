import { useEffect, useRef } from 'react';

/**
 * A custom React hook for setting up intervals
 * 
 * @param {Function} callback - The function to call at each interval
 * @param {number|null} delay - The delay in milliseconds between intervals. 
 *                              Set to null to pause the interval.
 * @param {Object} options - Additional options
 * @param {boolean} options.immediate - Whether to call the callback immediately on mount
 * @param {boolean} options.autoStart - Whether to start the interval automatically
 */
const useInterval = (callback, delay, options = {}) => {
  const { immediate = false, autoStart = true } = options;
  const savedCallback = useRef();
  const intervalId = useRef(null);
  const isActive = useRef(autoStart);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };

    // If immediate is true, call the callback immediately
    if (immediate && isActive.current) {
      tick();
    }

    // Clear previous interval if it exists
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }

    // Set up new interval if delay is provided and active
    if (delay !== null && delay !== undefined && isActive.current) {
      intervalId.current = setInterval(tick, delay);
    }

    // Cleanup on unmount or when delay changes
    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
        intervalId.current = null;
      }
    };
  }, [delay, immediate]);

  // Control functions
  const start = () => {
    if (!isActive.current) {
      isActive.current = true;
      
      if (delay !== null && delay !== undefined) {
        if (intervalId.current) {
          clearInterval(intervalId.current);
        }
        intervalId.current = setInterval(() => {
          if (savedCallback.current) {
            savedCallback.current();
          }
        }, delay);
      }
    }
  };

  const stop = () => {
    isActive.current = false;
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  };

  const restart = (newDelay = delay) => {
    stop();
    isActive.current = true;
    
    if (newDelay !== null && newDelay !== undefined) {
      intervalId.current = setInterval(() => {
        if (savedCallback.current) {
          savedCallback.current();
        }
      }, newDelay);
    }
  };

  const isRunning = () => {
    return isActive.current && intervalId.current !== null;
  };

  return {
    start,
    stop,
    restart,
    isRunning: isRunning()
  };
};

export default useInterval;

/**
 * Example usage:
 * 
 * // Basic usage
 * useInterval(() => {
 *   console.log('This runs every second');
 * }, 1000);
 * 
 * // With controls
 * const { start, stop, restart, isRunning } = useInterval(
 *   () => console.log('Tick'),
 *   1000,
 *   { autoStart: false }
 * );
 * 
 * // Pausable interval
 * const [delay, setDelay] = useState(1000);
 * useInterval(() => {
 *   // Your code here
 * }, delay);
 * 
 * // To pause: setDelay(null)
 * // To resume: setDelay(1000)
 */
