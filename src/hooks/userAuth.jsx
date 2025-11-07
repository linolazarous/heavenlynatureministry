import { useState, useEffect, useCallback } from 'react';
import { AuthAPI } from '../services/AuthAPI';

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  const updateAuthState = useCallback((updates) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        updateAuthState({ isLoading: false });
        return;
      }

      const userData = await AuthAPI.verifyToken(token);
      updateAuthState({ 
        user: userData, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
    } catch (error) {
      console.error('Authentication check failed:', error);
      updateAuthState({ 
        error: error.message, 
        isLoading: false 
      });
      logout();
    }
  }, [updateAuthState]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email, password) => {
    try {
      updateAuthState({ isLoading: true, error: null });
      
      const { user: userData, token } = await AuthAPI.login(email, password);
      localStorage.setItem('authToken', token);
      
      updateAuthState({ 
        user: userData, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
      
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      updateAuthState({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  }, [updateAuthState]);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    updateAuthState({
      user: null,
      isAuthenticated: false,
      error: null
    });
  }, [updateAuthState]);

  const clearError = useCallback(() => {
    updateAuthState({ error: null });
  }, [updateAuthState]);

  return { 
    ...authState, 
    login, 
    logout, 
    clearError,
    refreshAuth: checkAuth 
  };
};