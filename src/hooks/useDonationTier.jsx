import { useState, useEffect, useCallback } from 'react';
import { DonationAPI } from '../services/DonationAPI'; // Assuming you have this

const defaultTiers = [
  { amount: 25, label: 'Basic Support' },
  { amount: 50, label: 'Regular Gift' },
  { amount: 100, label: 'Generous Donor' },
  { amount: 250, label: 'Ministry Partner' }
];

export const useDonationTiers = () => {
  const [state, setState] = useState({
    tiers: [],
    loading: true,
    error: null
  });

  const fetchTiers = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Replace with actual API call when available
      // const tiers = await DonationAPI.getTiers();
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      setState({
        tiers: defaultTiers,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error('Failed to fetch donation tiers:', err);
      setState({
        tiers: defaultTiers, // Fallback to defaults
        loading: false,
        error: err.message || 'Failed to load donation tiers'
      });
    }
  }, []);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  const refetch = useCallback(() => {
    fetchTiers();
  }, [fetchTiers]);

  return { 
    tiers: state.tiers, 
    loading: state.loading, 
    error: state.error,
    refetch 
  };
};
