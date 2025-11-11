// src/hooks/useAuth.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { AuthAPI } from '../services/AuthAPI';

/**
 * Custom hook for authentication management
 * Handles login, logout, token verification, and auth state
 */
export const useAuth = () => {
  const isMounted = useRef(true);
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Safe state updates to prevent memory leaks
  const updateAuthState = useCallback((updates) => {
    if (!isMounted.current) return;
    setAuthState(prev => ({ ...prev, ...updates }));
  }, []);

  // Check authentication status on mount
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        updateAuthState({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          error: null 
        });
        return;
      }

      // Verify token with API
      const userData = await AuthAPI.verifyToken(token);
      
      updateAuthState({ 
        user: userData, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
      
    } catch (error) {
      console.error('Authentication check failed:', error);
      
      // Auto-logout on token verification failure
      localStorage.removeItem('authToken');
      
      updateAuthState({ 
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session expired. Please login again.'
      });
    }
  }, [updateAuthState]);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      updateAuthState({ 
        isLoading: true, 
        error: null 
      });
      
      const { user: userData, token } = await AuthAPI.login(email, password);
      
      // Store token securely
      localStorage.setItem('authToken', token);
      
      updateAuthState({ 
        user: userData, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
      
      return { success: true, user: userData };
      
    } catch (error) {
      // Enhanced error handling
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Login failed. Please check your credentials and try again.';
      
      updateAuthState({ 
        error: errorMessage, 
        isLoading: false 
      });
      
      return { success: false, error: errorMessage };
    }
  }, [updateAuthState]);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    updateAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }, [updateAuthState]);

  // Clear error messages
  const clearError = useCallback(() => {
    updateAuthState({ error: null });
  }, [updateAuthState]);

  // Auto-check auth on component mount
  useEffect(() => {
    isMounted.current = true;
    
    const initializeAuth = async () => {
      await checkAuth();
    };
    
    initializeAuth();

    return () => {
      isMounted.current = false;
    };
  }, [checkAuth]);

  // Optional: Auto-refresh token before expiry
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const refreshInterval = setInterval(() => {
      checkAuth().catch(console.error);
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(refreshInterval);
  }, [authState.isAuthenticated, checkAuth]);

  return { 
    // State
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    
    // Actions
    login,
    logout,
    clearError,
    refreshAuth: checkAuth,
    
    // Convenience getters
    hasError: !!authState.error,
    isLoggedIn: authState.isAuthenticated && !authState.isLoading
  };
};

// Optional: Create a provider-friendly version
export const useAuthProvider = () => {
  return useAuth();
};

export default useAuth;
