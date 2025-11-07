import { useState, useEffect, useCallback } from 'react';
import { StreamAPI } from '../services/StreamAPI'; // Assuming you have this

export const useLiveStreamStatus = () => {
  const [streamState, setStreamState] = useState({
    isLive: false,
    streamTitle: '',
    isLoading: true,
    error: null,
    nextStream: null
  });

  const checkStreamStatus = useCallback(async () => {
    try {
      setStreamState(prev => ({ ...prev, error: null }));
      
      // Replace with actual API call
      // const status = await StreamAPI.getStatus();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      
      // Enhanced logic
      const isLiveNow = day === 0 && hour >= 9 && hour < 12;
      const nextStreamTime = getNextStreamTime(now);
      
      setStreamState(prev => ({
        ...prev,
        isLive: isLiveNow,
        streamTitle: isLiveNow ? "Sunday Worship Service" : "",
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
    nextSunday.setDate(currentTime.getDate() + (7 - currentTime.getDay()));
    nextSunday.setHours(9, 0, 0, 0);
    return nextSunday;
  };

  useEffect(() => {
    checkStreamStatus();
    
    const interval = setInterval(checkStreamStatus, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [checkStreamStatus]);

  const manualRefresh = useCallback(() => {
    setStreamState(prev => ({ ...prev, isLoading: true }));
    checkStreamStatus();
  }, [checkStreamStatus]);

  return { 
    ...streamState, 
    refresh: manualRefresh 
  };
};