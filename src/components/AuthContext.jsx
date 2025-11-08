import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { magic } from '../services/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Types for better TypeScript-like development (remove if using actual TypeScript)
const AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

const AuthActions = {
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  getToken: async () => null,
};

// Create context with proper default values
export const AuthContext = createContext({
  ...AuthState,
  ...AuthActions,
});

// Error messages for consistent error handling
const ERROR_MESSAGES = {
  AUTH_CHECK_FAILED: 'Unable to verify authentication status',
  LOGIN_FAILED: 'Login failed. Please try again.',
  LOGOUT_FAILED: 'Logout failed. Please try again.',
  REFRESH_FAILED: 'Failed to refresh user data',
  TOKEN_FAILED: 'Failed to retrieve authentication token',
};

// Success messages
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: (email) => `Welcome back, ${email}!`,
  LOGOUT_SUCCESS: 'You have been logged out successfully',
};

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  // Safe state update helper
  const safeSetAuthState = useCallback((updater) => {
    try {
      setAuthState(updater);
    } catch (error) {
      console.error('Error updating auth state:', error);
    }
  }, []);

  // Check auth status on mount with retry logic
  const checkAuthStatus = useCallback(async (retryCount = 0) => {
    const MAX_RETRIES = 2;
    
    try {
      const isLoggedIn = await magic.user.isLoggedIn();
      
      if (isLoggedIn) {
        const userData = await magic.user.getMetadata();
        safeSetAuthState({
          user: userData,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        safeSetAuthState(prev => ({ 
          ...prev, 
          isLoading: false 
        }));
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      
      // Retry logic for transient failures
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying auth check (${retryCount + 1}/${MAX_RETRIES})...`);
        setTimeout(() => checkAuthStatus(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }

      safeSetAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      
      // Only show error toast if this wasn't a silent retry
      if (retryCount === MAX_RETRIES) {
        toast.error(ERROR_MESSAGES.AUTH_CHECK_FAILED);
      }
    }
  }, [safeSetAuthState]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Login handler with enhanced error handling
  const login = async (email, redirectPath = '/') => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      throw new Error('Invalid email address');
    }

    try {
      safeSetAuthState(prev => ({ ...prev, isLoading: true }));
      
      await magic.auth.loginWithMagicLink({ 
        email: email.trim(),
        showUI: true,
        redirectURI: new URL('/callback', window.location.origin).href
      });
      
      const userData = await magic.user.getMetadata();
      
      safeSetAuthState({
        user: userData,
        isLoading: false,
        isAuthenticated: true,
      });
      
      toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS(userData.email));
      
      // Use the redirect path or fall back to the intended destination
      const intendedPath = location.state?.from || redirectPath;
      navigate(intendedPath, { replace: true });
      
      return userData;
    } catch (err) {
      console.error('Login failed:', err);
      safeSetAuthState(prev => ({ ...prev, isLoading: false }));
      
      const errorMessage = err.message?.includes('user denied') 
        ? 'Login was cancelled'
        : ERROR_MESSAGES.LOGIN_FAILED;
      
      toast.error(errorMessage);
      throw err;
    }
  };

  // Logout handler with cleanup
  const logout = async () => {
    try {
      safeSetAuthState(prev => ({ ...prev, isLoading: true }));
      
      await magic.user.logout();
      
      safeSetAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      
      toast.success(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
      
      // Redirect to login page with return url
      navigate('/login', { 
        state: { from: location.pathname },
        replace: true 
      });
    } catch (err) {
      console.error('Logout failed:', err);
      safeSetAuthState(prev => ({ ...prev, isLoading: false }));
      
      // Even if logout fails, clear local state for security
      safeSetAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      
      toast.error(ERROR_MESSAGES.LOGOUT_FAILED);
    }
  };

  // Refresh user data with caching prevention
  const refreshUser = async () => {
    try {
      const userData = await magic.user.getMetadata();
      
      safeSetAuthState(prev => ({
        ...prev,
        user: userData,
        isAuthenticated: !!userData,
      }));
      
      return userData;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      
      // If refresh fails, user might be logged out
      if (err.message?.includes('not logged in')) {
        safeSetAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
      
      toast.error(ERROR_MESSAGES.REFRESH_FAILED);
      throw err;
    }
  };

  // Get auth token with fallback
  const getToken = async (options = {}) => {
    const { forceRefresh = false } = options;
    
    try {
      const token = await magic.user.getIdToken({ 
        lifespan: 900000 // 15 minutes
      });
      
      if (!token) {
        throw new Error('No token received');
      }
      
      return token;
    } catch (err) {
      console.error('Failed to get token:', err);
      
      // If token retrieval fails, try to refresh user session
      if (forceRefresh) {
        try {
          await refreshUser();
          return await magic.user.getIdToken();
        } catch (refreshError) {
          console.error('Token refresh also failed:', refreshError);
        }
      }
      
      return null;
    }
  };

  // Auto-logout on certain errors
  useEffect(() => {
    const handleAuthError = (event) => {
      if (event.detail?.type === 'AUTH_ERROR') {
        console.warn('Auth error detected, logging out...');
        logout();
      }
    };

    window.addEventListener('authError', handleAuthError);
    
    return () => {
      window.removeEventListener('authError', handleAuthError);
    };
  }, []);

  // Periodic token refresh (optional - enable if needed)
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        await getToken({ forceRefresh: true });
      } catch (error) {
        console.warn('Periodic token refresh failed:', error);
      }
    }, 14 * 60 * 1000); // Refresh every 14 minutes

    return () => clearInterval(interval);
  }, [authState.isAuthenticated]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    ...authState,
    login,
    logout,
    refreshUser,
    getToken,
  }), [authState]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Enhanced custom hook with additional safety
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Add runtime validation in development
  if (process.env.NODE_ENV === 'development') {
    if (!context.login || typeof context.login !== 'function') {
      console.error('Auth context is missing required login function');
    }
  }

  return context;
}

// Helper hook for protected routes
export function useRequireAuth(redirectPath = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectPath, { 
        state: { from: location.pathname } 
      });
    }
  }, [isAuthenticated, isLoading, navigate, redirectPath, location]);

  return { isAuthenticated, isLoading };
}
