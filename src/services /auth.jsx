import { useState, useEffect, useCallback } from 'react';
import netlifyIdentity from 'netlify-identity-widget';

// Initialize Netlify Identity
export const initializeAuth = () => {
  try {
    netlifyIdentity.init({
      container: '#netlify-identity-widget',
      locale: 'en'
    });
    
    // Set API URL for Netlify Functions
    netlifyIdentity.on('init', (user) => {
      console.log('Netlify Identity initialized', user ? 'with user' : 'without user');
    });

    return netlifyIdentity;
  } catch (error) {
    console.error('Failed to initialize Netlify Identity:', error);
    throw new Error('Authentication system initialization failed');
  }
};

// Custom hook for authentication state
export const useNetlifyAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const updateAuthState = useCallback((currentUser) => {
    setUser(currentUser);
    setIsLoading(false);
    setError(null);
  }, []);

  const handleLogin = useCallback((user) => {
    updateAuthState(user);
    console.log('User logged in:', user.email);
  }, [updateAuthState]);

  const handleLogout = useCallback(() => {
    updateAuthState(null);
    console.log('User logged out');
  }, [updateAuthState]);

  const handleError = useCallback((err) => {
    setError(err.message || 'Authentication error');
    setIsLoading(false);
    console.error('Auth error:', err);
  }, []);

  useEffect(() => {
    try {
      const identity = initializeAuth();

      // Set up event listeners
      identity.on('login', handleLogin);
      identity.on('logout', handleLogout);
      identity.on('error', handleError);

      // Check current user
      const currentUser = identity.currentUser();
      if (currentUser) {
        updateAuthState(currentUser);
      } else {
        setIsLoading(false);
      }

      // Cleanup
      return () => {
        identity.off('login', handleLogin);
        identity.off('logout', handleLogout);
        identity.off('error', handleError);
      };
    } catch (err) {
      handleError(err);
    }
  }, [handleLogin, handleLogout, handleError, updateAuthState]);

  const login = useCallback((email, password) => {
    setIsLoading(true);
    setError(null);
    
    return new Promise((resolve, reject) => {
      netlifyIdentity.login(email, password, true)
        .then((user) => {
          handleLogin(user);
          resolve(user);
        })
        .catch((error) => {
          handleError(error);
          reject(error);
        });
    });
  }, [handleLogin, handleError]);

  const signup = useCallback((email, password, userData = {}) => {
    setIsLoading(true);
    setError(null);
    
    return new Promise((resolve, reject) => {
      netlifyIdentity.signup(email, password, userData)
        .then((user) => {
          handleLogin(user);
          resolve(user);
        })
        .catch((error) => {
          handleError(error);
          reject(error);
        });
    });
  }, [handleLogin, handleError]);

  const logout = useCallback(() => {
    setIsLoading(true);
    netlifyIdentity.logout();
  }, []);

  const refreshUser = useCallback(() => {
    const currentUser = netlifyIdentity.currentUser();
    if (currentUser) {
      return currentUser.jwt().then((token) => {
        updateAuthState(currentUser);
        return { user: currentUser, token };
      });
    }
    return Promise.resolve(null);
  }, [updateAuthState]);

  const getToken = useCallback(async () => {
    const currentUser = netlifyIdentity.currentUser();
    if (currentUser) {
      try {
        const token = await currentUser.jwt();
        return token;
      } catch (error) {
        console.error('Error getting token:', error);
        return null;
      }
    }
    return null;
  }, []);

  return {
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    refreshUser,
    getToken,
    isAuthenticated: !!user
  };
};

// Export Netlify Identity instance
export const auth = {
  open: () => netlifyIdentity.open(),
  close: () => netlifyIdentity.close(),
  currentUser: () => netlifyIdentity.currentUser()
};

export default netlifyIdentity;