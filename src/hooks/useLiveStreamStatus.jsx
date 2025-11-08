// src/hooks/useLiveStreamStatus.jsx
import { useState, useEffect, useCallback } from 'react';

export const useLiveStreamStatus = () => {
  const [streamState, setStreamState] = useState({
    isLive: false,
    streamTitle: '',
    viewerCount: 0,
    isLoading: true,
    error: null,
    nextStream: null
  });

  const checkStreamStatus = useCallback(async () => {
    try {
      setStreamState(prev => ({ ...prev, error: null }));
      
      // Simulate API call - replace with actual API when available
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      // Enhanced livestream logic: Sunday 10:00 AM - 1:00 PM CAT (8:00-11:00 UTC)
      const isLiveNow = day === 0 && hour >= 8 && hour < 11;
      
      // Calculate next stream time
      const nextStreamTime = getNextStreamTime(now);
      
      // Generate mock viewer count when live
      const viewerCount = isLiveNow ? Math.floor(Math.random() * 100) + 50 : 0;
      
      setStreamState(prev => ({
        ...prev,
        isLive: isLiveNow,
        streamTitle: isLiveNow ? "Sunday Worship Service - Heavenly Nature Ministry" : "",
        viewerCount: viewerCount,
        nextStream: nextStreamTime,
        isLoading: false
      }));
    } catch (error) {
      console.error("Error checking stream status:", error);
      setStreamState(prev => ({
        ...prev,
        error: error.message || 'Failed to check stream status',
        isLoading: false
      }));
    }
  }, []);

  const getNextStreamTime = (currentTime) => {
    const nextSunday = new Date(currentTime);
    
    // If today is Sunday but past stream time, get next Sunday
    if (currentTime.getDay() === 0 && currentTime.getHours() >= 11) {
      nextSunday.setDate(currentTime.getDate() + 7);
    } else {
      nextSunday.setDate(currentTime.getDate() + (7 - currentTime.getDay()));
    }
    
    // Set to Sunday 8:00 UTC (10:00 AM CAT)
    nextSunday.setHours(8, 0, 0, 0);
    return nextSunday;
  };

  useEffect(() => {
    checkStreamStatus();
    
    // Check more frequently when live
    const intervalTime = streamState.isLive ? 30000 : 300000; // 30s when live, 5min when not
    const interval = setInterval(checkStreamStatus, intervalTime);
    
    return () => clearInterval(interval);
  }, [checkStreamStatus, streamState.isLive]);

  const manualRefresh = useCallback(() => {
    setStreamState(prev => ({ ...prev, isLoading: true }));
    checkStreamStatus();
  }, [checkStreamStatus]);

  // Format next stream time for display
  const formattedNextStream = streamState.nextStream 
    ? streamState.nextStream.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  return { 
    ...streamState,
    formattedNextStream,
    refresh: manualRefresh 
  };
};

export default useLiveStreamStatus;
