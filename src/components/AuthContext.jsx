// ✅ src/components/AuthContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { magic } from '../services/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ERROR_MESSAGES = {
  AUTH_CHECK_FAILED: 'Unable to verify authentication status.',
  LOGIN_FAILED: 'Login failed. Please try again.',
  LOGOUT_FAILED: 'Logout failed. Please try again.',
  REFRESH_FAILED: 'Failed to refresh user data.',
  TOKEN_FAILED: 'Failed to retrieve authentication token.',
};

const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: (email) => `Welcome back, ${email}!`,
  LOGOUT_SUCCESS: 'You have been logged out successfully.',
};

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

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const safeSetAuthState = useCallback((updater) => {
    if (!isMounted.current) return;
    setAuthState((prev) =>
      typeof updater === 'function'
        ? updater(prev)
        : { ...prev, ...(updater || {}) }
    );
  }, []);

  // Enhanced magic instance checking
  const hasMagicUser = useCallback(() => {
    try {
      return !!(magic && magic.user && typeof magic.user === 'object');
    } catch (error) {
      console.warn('Magic instance check failed:', error);
      return false;
    }
  }, []);

  // Fixed checkAuthStatus function
  const checkAuthStatus = useCallback(
    async (retryCount = 0) => {
      const MAX_RETRIES = 2;

      try {
        // Enhanced safety checks
        if (!magic) {
          console.warn('Magic instance not available');
          safeSetAuthState({ 
            user: null, 
            isLoading: false, 
            isAuthenticated: false 
          });
          return;
        }

        // Check if required methods exist
        if (!magic.user || typeof magic.user.isLoggedIn !== 'function') {
          console.warn('Magic user methods not available');
          safeSetAuthState({ 
            user: null, 
            isLoading: false, 
            isAuthenticated: false 
          });
          return;
        }

        const isLoggedIn = await magic.user.isLoggedIn();
        
        if (isLoggedIn) {
          const userData = await magic.user.getMetadata().catch((err) => {
            console.warn('Failed to get user metadata:', err);
            return null;
          });
          
          safeSetAuthState({
            user: userData,
            isLoading: false,
            isAuthenticated: !!userData,
          });
        } else {
          safeSetAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (err) {
        console.error('Auth check error:', err);
        
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            if (isMounted.current) checkAuthStatus(retryCount + 1);
          }, 1000 * (retryCount + 1));
        } else {
          safeSetAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
          // Don't show toast for initial auth check
          if (retryCount > 0) {
            toast.error(ERROR_MESSAGES.AUTH_CHECK_FAILED);
          }
        }
      }
    },
    [safeSetAuthState]
  );

  // Improved initialization with error boundary
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (!mounted) return;
      
      try {
        // Small delay to ensure everything is loaded
        await new Promise(resolve => setTimeout(resolve, 50));
        await checkAuthStatus();
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mounted) {
          safeSetAuthState({ 
            user: null, 
            isLoading: false, 
            isAuthenticated: false 
          });
        }
      }
    };

    // Use setTimeout to avoid blocking the main thread
    const timer = setTimeout(() => {
      initializeAuth();
    }, 0);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [checkAuthStatus, safeSetAuthState]);

  const login = useCallback(
    async (email, redirectPath = '/') => {
      if (!email || !email.includes('@')) {
        toast.error('Please enter a valid email address.');
        throw new Error('Invalid email address.');
      }

      if (!hasMagicUser() || typeof magic.auth?.loginWithMagicLink !== 'function') {
        toast.error('Authentication service not available.');
        throw new Error('Magic auth not available.');
      }

      try {
        safeSetAuthState({ isLoading: true });

        await magic.auth.loginWithMagicLink({
          email: email.trim(),
          showUI: true,
          redirectURI: new URL('/callback', window.location.origin).href,
        });

        const userData = await magic.user.getMetadata().catch(() => null);
        safeSetAuthState({
          user: userData,
          isLoading: false,
          isAuthenticated: !!userData,
        });

        if (userData?.email) {
          toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS(userData.email));
        }

        if (isMounted.current) {
          navigate(location.state?.from || redirectPath, { replace: true });
        }

        return userData;
      } catch (err) {
        safeSetAuthState({ isLoading: false });
        console.error('Login error:', err);
        toast.error(ERROR_MESSAGES.LOGIN_FAILED);
        throw err;
      }
    },
    [navigate, location, safeSetAuthState, hasMagicUser]
  );

  const logout = useCallback(async () => {
    try {
      safeSetAuthState({ isLoading: true });

      if (hasMagicUser() && typeof magic.user.logout === 'function') {
        await magic.user.logout();
      }

      safeSetAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      toast.success(SUCCESS_MESSAGES.LOGOUT_SUCCESS);

      if (isMounted.current) {
        navigate('/login', { state: { from: location.pathname }, replace: true });
      }
    } catch (err) {
      console.error('Logout error:', err);
      safeSetAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      toast.error(ERROR_MESSAGES.LOGOUT_FAILED);
    }
  }, [navigate, location, safeSetAuthState, hasMagicUser]);

  const refreshUser = useCallback(async () => {
    try {
      if (!hasMagicUser() || typeof magic.user.getMetadata !== 'function') {
        throw new Error('Magic user not available.');
      }

      const userData = await magic.user.getMetadata();
      safeSetAuthState({ user: userData, isAuthenticated: !!userData });

      return userData;
    } catch (err) {
      console.error('Refresh user error:', err);
      if (err?.message?.toLowerCase().includes('not logged in')) {
        safeSetAuthState({ user: null, isAuthenticated: false });
      }
      toast.error(ERROR_MESSAGES.REFRESH_FAILED);
      throw err;
    }
  }, [safeSetAuthState, hasMagicUser]);

  const getToken = useCallback(
    async (options = {}) => {
      const { forceRefresh = false } = options;

      if (!hasMagicUser() || typeof magic.user.getIdToken !== 'function') {
        return null;
      }

      try {
        const token = await magic.user.getIdToken();
        if (!token) throw new Error('No token received');
        return token;
      } catch (err) {
        console.error('Get token error:', err);
        if (forceRefresh) {
          try {
            await refreshUser();
            return await magic.user.getIdToken();
          } catch {
            return null;
          }
        }
        return null;
      }
    },
    [refreshUser, hasMagicUser]
  );

  const contextValue = React.useMemo(
    () => ({ 
      ...authState, 
      login, 
      logout, 
      refreshUser, 
      getToken 
    }),
    [authState, login, logout, refreshUser, getToken]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

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

export default AuthContext;
