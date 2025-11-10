// src/components/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { magic } from '../services/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

// Create context with proper default values
export const AuthContext = createContext({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  getToken: async () => null,
});

export function AuthProvider({ children }) {
  const isMounted = useRef(true);
  const [authState, setAuthState] = useState({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Ensure we don't update state after unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Safe state update helper which supports both object and functional updaters
  const safeSetAuthState = useCallback((updater) => {
    if (!isMounted.current) return;
    try {
      if (typeof updater === 'function') {
        setAuthState((prev) => {
          try {
            return updater(prev);
          } catch (e) {
            console.error('Error in functional auth state updater:', e);
            return prev;
          }
        });
      } else {
        setAuthState((prev) => ({ ...(prev || {}), ...(updater || {}) }));
      }
    } catch (error) {
      console.error('Error updating auth state:', error);
    }
  }, []);

  // Helper: safe check for magic user API availability
  const hasMagicUser = () => !!(magic && magic.user && typeof magic.user === 'object');

  // Check auth status on mount with retry logic
  const checkAuthStatus = useCallback(async (retryCount = 0) => {
    const MAX_RETRIES = 2;

    try {
      // Guard: magic may not be initialized during SSR or early mount
      if (!hasMagicUser() || typeof magic.user.isLoggedIn !== 'function') {
        // If Magic isn't available yet, set loading false after a short delay to avoid indefinite spinner
        safeSetAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const isLoggedIn = await magic.user.isLoggedIn();

      if (isLoggedIn) {
        // getMetadata may throw; guard it
        let userData = null;
        try {
          userData = await magic.user.getMetadata();
        } catch (err) {
          console.warn('getMetadata failed during auth check, treating as not logged in:', err);
        }

        safeSetAuthState({
          user: userData || null,
          isLoading: false,
          isAuthenticated: !!userData,
        });
      } else {
        safeSetAuthState(prev => ({ ...prev, isLoading: false, isAuthenticated: false, user: null }));
      }
    } catch (err) {
      console.error('Auth check failed:', err);

      // Retry logic for transient failures
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying auth check (${retryCount + 1}/${MAX_RETRIES})...`);
        setTimeout(() => {
          // Only retry if still mounted
          if (isMounted.current) checkAuthStatus(retryCount + 1);
        }, 1000 * (retryCount + 1));
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
    // intentionally no dependencies other than checkAuthStatus
  }, [checkAuthStatus]);

  // Login handler with enhanced error handling
  const login = useCallback(async (email, redirectPath = '/') => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      throw new Error('Invalid email address');
    }

    if (!hasMagicUser() || typeof magic.auth?.loginWithMagicLink !== 'function') {
      toast.error(ERROR_MESSAGES.LOGIN_FAILED);
      throw new Error('Magic auth not available');
    }

    try {
      safeSetAuthState(prev => ({ ...prev, isLoading: true }));

      await magic.auth.loginWithMagicLink({
        email: email.trim(),
        showUI: true,
        redirectURI: new URL('/callback', window.location.origin).href,
      });

      // After loginWithMagicLink the flow may redirect; guard against missing API
      let userData = null;
      try {
        if (hasMagicUser() && typeof magic.user.getMetadata === 'function') {
          userData = await magic.user.getMetadata();
        }
      } catch (e) {
        console.warn('Failed to fetch user metadata after login:', e);
      }

      safeSetAuthState({
        user: userData || null,
        isLoading: false,
        isAuthenticated: !!userData,
      });

      if (userData?.email) {
        toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS(userData.email));
      } else {
        // Generic success toast if email isn't available
        toast.success('Logged in successfully');
      }

      // Use the redirect path or fall back to the intended destination
      const intendedPath = location.state?.from || redirectPath;
      // Only navigate if still mounted
      if (isMounted.current) {
        navigate(intendedPath, { replace: true });
      }

      return userData;
    } catch (err) {
      console.error('Login failed:', err);
      safeSetAuthState(prev => ({ ...prev, isLoading: false }));

      const errorMessage = err?.message?.includes('user denied')
        ? 'Login was cancelled'
        : ERROR_MESSAGES.LOGIN_FAILED;

      toast.error(errorMessage);
      throw err;
    }
  }, [navigate, location, safeSetAuthState]);

  // Logout handler with cleanup
  const logout = useCallback(async () => {
    try {
      safeSetAuthState(prev => ({ ...prev, isLoading: true }));

      if (hasMagicUser() && typeof magic.user.logout === 'function') {
        await magic.user.logout();
      } else {
        console.warn('Magic logout not available; clearing client state anyway.');
      }

      safeSetAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      toast.success(SUCCESS_MESSAGES.LOGOUT_SUCCESS);

      // Redirect to login page with return url
      if (isMounted.current) {
        navigate('/login', {
          state: { from: location.pathname },
          replace: true,
        });
      }
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
  }, [navigate, location, safeSetAuthState]);

  // Refresh user data with caching prevention
  const refreshUser = useCallback(async () => {
    try {
      if (!hasMagicUser() || typeof magic.user.getMetadata !== 'function') {
        throw new Error('Magic user metadata not available');
      }

      const userData = await magic.user.getMetadata();

      safeSetAuthState(prev => ({
        ...prev,
        user: userData,
        isAuthenticated: !!userData,
      }));

      return userData;
    } catch (err) {
      console.error('Failed to refresh user:', err);

      // If refresh fails and indicates not logged in, clear state
      if (err?.message?.toLowerCase().includes('not logged in')) {
        safeSetAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }

      toast.error(ERROR_MESSAGES.REFRESH_FAILED);
      throw err;
    }
  }, [safeSetAuthState]);

  // Get auth token with fallback and optional force refresh
  const getToken = useCallback(async (options = {}) => {
    const { forceRefresh = false } = options;

    if (!hasMagicUser() || typeof magic.user.getIdToken !== 'function') {
      console.warn('Magic token API unavailable');
      return null;
    }

    try {
      const token = await magic.user.getIdToken();
      if (!token) {
        throw new Error('No token received');
      }
      return token;
    } catch (err) {
      console.error('Failed to get token:', err);

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
  }, [refreshUser]);

  // Auto-logout on certain errors (keep this defensive)
  useEffect(() => {
    const handleAuthError = (event) => {
      if (event?.detail?.type === 'AUTH_ERROR') {
        console.warn('Auth error detected, logging out...');
        // do not await - fire and forget
        logout();
      }
    };

    window.addEventListener('authError', handleAuthError);

    return () => {
      window.removeEventListener('authError', handleAuthError);
    };
  }, [logout]);

  // Periodic token refresh (optional - enable if needed)
  useEffect(() => {
    let interval;
    if (authState.isAuthenticated) {
      interval = setInterval(async () => {
        try {
          await getToken({ forceRefresh: true });
        } catch (error) {
          console.warn('Periodic token refresh failed:', error);
        }
      }, 14 * 60 * 1000); // Refresh every 14 minutes
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [authState.isAuthenticated, getToken]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    ...authState,
    login,
    logout,
    refreshUser,
    getToken,
  }), [authState, login, logout, refreshUser, getToken]);

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
    // Only redirect when we have a definitive auth state
    if (typeof isLoading === 'boolean' && !isLoading && !isAuthenticated) {
      navigate(redirectPath, {
        state: { from: location.pathname },
      });
    }
    // We intentionally don't navigate while loading is true
  }, [isAuthenticated, isLoading, navigate, redirectPath, location]);

  return { isAuthenticated, isLoading };
}
