import { useState, useCallback, useRef } from 'react';
import { BroadcastAPI } from '../services/BroadcastAPI';

const initialBroadcastState = {
  showNotes: false,
  notes: '',
  showBible: false,
  bibleVerse: '',
  bibleReference: '',
  translation: 'NIV',
  lowerThird: {
    visible: false,
    title: '',
    subtitle: '',
    color: '#4a6fa5'
  },
  countdown: {
    visible: false,
    targetTime: null,
    title: ''
  },
  preset: null
};

export const useBroadcast = () => {
  const [broadcastState, setBroadcastState] = useState(initialBroadcastState);
  const [isSyncing, setIsSyncing] = useState(false);
  const debounceRef = useRef(null);

  const updateBroadcast = useCallback((updates) => {
    setBroadcastState(prev => {
      const newState = { ...prev, ...updates };
      
      // Debounced auto-save to server
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(async () => {
        try {
          setIsSyncing(true);
          await BroadcastAPI.updateState(newState);
        } catch (err) {
          console.error('Failed to update server state:', err);
        } finally {
          setIsSyncing(false);
        }
      }, 500);
      
      return newState;
    });
  }, []);

  const syncWithServer = useCallback(async (serverState) => {
    try {
      setIsSyncing(true);
      setBroadcastState(serverState);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const resetBroadcast = useCallback(() => {
    setBroadcastState(initialBroadcastState);
  }, []);

  return { 
    broadcastState, 
    updateBroadcast, 
    syncWithServer, 
    resetBroadcast,
    isSyncing 
  };
};