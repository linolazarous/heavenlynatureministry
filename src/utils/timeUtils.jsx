/**
 * Comprehensive time utility functions for the Heavenly Nature Ministry application
 */

/**
 * Format milliseconds into a time string
 * @param {number} milliseconds - Time in milliseconds
 * @param {Object} options - Formatting options
 * @param {boolean} options.showHours - Whether to always show hours
 * @param {boolean} options.compact - Use compact format (hh:mm:ss)
 * @returns {string} Formatted time string
 */
export const formatTime = (milliseconds, options = {}) => {
  const { showHours = false, compact = false } = options;
  
  if (typeof milliseconds !== 'number' || milliseconds < 0) {
    console.warn('Invalid milliseconds value:', milliseconds);
    return compact ? '00:00' : '00:00:00';
  }

  try {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (compact) {
      if (hours > 0 || showHours) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  } catch (error) {
    console.error('Error formatting time:', error);
    return compact ? '00:00' : '00:00:00';
  }
};

/**
 * Parse a time string into a Date object
 * @param {string} timeString - Time string in format "HH:MM" or "HH:MM:SS"
 * @param {Date} baseDate - Base date to use (defaults to current date)
 * @returns {Date} Date object with the parsed time
 */
export const parseTimeString = (timeString, baseDate = new Date()) => {
  if (!timeString || typeof timeString !== 'string') {
    throw new Error('Invalid time string provided');
  }

  try {
    const timeParts = timeString.split(':').map(part => {
      const num = parseInt(part, 10);
      if (isNaN(num) || num < 0) {
        throw new Error(`Invalid time part: ${part}`);
      }
      return num;
    });

    if (timeParts.length < 2 || timeParts.length > 3) {
      throw new Error('Time string must be in format "HH:MM" or "HH:MM:SS"');
    }

    const [hours, minutes, seconds = 0] = timeParts;
    
    if (hours > 23 || minutes > 59 || seconds > 59) {
      throw new Error('Time values out of valid range');
    }

    const date = new Date(baseDate);
    date.setHours(hours, minutes, seconds, 0);
    return date;
  } catch (error) {
    console.error('Error parsing time string:', error);
    throw new Error(`Failed to parse time string "${timeString}": ${error.message}`);
  }
};

/**
 * Format a Date object into a readable time string
 * @param {Date} date - Date object to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.includeSeconds - Whether to include seconds
 * @param {boolean} options.use12Hour - Whether to use 12-hour format
 * @returns {string} Formatted time string
 */
export const formatTimeFromDate = (date, options = {}) => {
  const { includeSeconds = false, use12Hour = false } = options;
  
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid Date object provided');
  }

  try {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    if (use12Hour) {
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      
      if (includeSeconds) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
      }
      return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    if (includeSeconds) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting date to time:', error);
    return '00:00';
  }
};

/**
 * Calculate time difference between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date (defaults to now)
 * @returns {Object} Object with time difference components
 */
export const getTimeDifference = (startDate, endDate = new Date()) => {
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
    throw new Error('Invalid Date objects provided');
  }

  const difference = endDate.getTime() - startDate.getTime();
  const isPast = difference < 0;
  const absoluteDifference = Math.abs(difference);

  const days = Math.floor(absoluteDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absoluteDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absoluteDifference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absoluteDifference % (1000 * 60)) / 1000);

  return {
    totalMilliseconds: difference,
    days,
    hours,
    minutes,
    seconds,
    isPast,
    isFuture: !isPast
  };
};

/**
 * Format a duration in milliseconds to human readable string
 * @param {number} milliseconds - Duration in milliseconds
 * @param {Object} options - Formatting options
 * @param {boolean} options.compact - Use compact format
 * @returns {string} Human readable duration
 */
export const formatDuration = (milliseconds, options = {}) => {
  const { compact = false } = options;
  
  if (typeof milliseconds !== 'number' || milliseconds < 0) {
    return compact ? '0s' : '0 seconds';
  }

  const { days, hours, minutes, seconds } = getTimeDifference(new Date(), new Date(Date.now() + milliseconds));

  if (compact) {
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }

  const parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);

  return parts.join(' ');
};

/**
 * Check if a time string represents a valid time
 * @param {string} timeString - Time string to validate
 * @returns {boolean} Whether the time string is valid
 */
export const isValidTimeString = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return false;
  
  try {
    parseTimeString(timeString);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get the next occurrence of a specific time
 * @param {string} timeString - Target time string
 * @param {Date} fromDate - Date to start from (defaults to now)
 * @returns {Date} Next occurrence of the target time
 */
export const getNextOccurrence = (timeString, fromDate = new Date()) => {
  const targetTime = parseTimeString(timeString, fromDate);
  
  if (targetTime.getTime() <= fromDate.getTime()) {
    // If the time has already passed today, move to tomorrow
    targetTime.setDate(targetTime.getDate() + 1);
  }
  
  return targetTime;
};

/**
 * Calculate countdown to a target date
 * @param {Date} targetDate - Target date for countdown
 * @returns {Object} Countdown information
 */
export const getCountdown = (targetDate) => {
  if (!(targetDate instanceof Date)) {
    throw new Error('Invalid target date provided');
  }

  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();
  
  if (difference <= 0) {
    return {
      expired: true,
      totalMilliseconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: '00:00:00'
    };
  }

  return {
    expired: false,
    ...getTimeDifference(now, targetDate),
    formatted: formatTime(difference, { showHours: true })
  };
};

export default {
  formatTime,
  parseTimeString,
  formatTimeFromDate,
  getTimeDifference,
  formatDuration,
  isValidTimeString,
  getNextOccurrence,
  getCountdown
};