// src/services/authService.jsx
import { useState, useEffect, useCallback } from 'react';

// Mock Magic authentication system
export const initializeMagic = () => {
  console.log('Magic authentication initialized');
  return {
    user: {
      isLoggedIn: async () => {
        const userStr = localStorage.getItem('currentUser');
        return !!userStr;
      },
      getMetadata: async () => {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
      },
      getIdToken: async (options = {}) => {
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) return null;
        
        // Mock token generation
        return `mock-token-${Date.now()}`;
      },
      logout: async () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        return true;
      }
    },
    auth: {
      loginWithMagicLink: async ({ email, showUI = true, redirectURI }) => {
        // Mock magic link login
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (email && email.includes('@')) {
          const mockUser = {
            id: Date.now().toString(),
            email: email,
            name: email.split('@')[0],
            role: 'user',
            createdAt: new Date().toISOString(),
            issuer: `mock-issuer-${Date.now()}`
          };
          
          localStorage.setItem('currentUser', JSON.stringify(mockUser));
          localStorage.setItem('authToken', `mock-token-${Date.now()}`);
          
          return mockUser;
        } else {
          throw new Error('Invalid email address');
        }
      }
    }
  };
};

// Create and export the magic instance
export const magic = initializeMagic();

// Custom hook for authentication state
export const useNetlifyAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const updateAuthState = useCallback((currentUser) => {
    setUser(currentUser);
    setIsLoading(false);
    setError(null);
    
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    }
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
    const checkAuthStatus = async () => {
      try {
        const isLoggedIn = await magic.user.isLoggedIn();
        
        if (isLoggedIn) {
          const userData = await magic.user.getMetadata();
          updateAuthState(userData);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        handleError(err);
      }
    };

    checkAuthStatus();
  }, [handleError, updateAuthState]);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock login - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email && password) {
        const mockUser = {
          id: '1',
          email: email,
          name: email.split('@')[0],
          role: 'user',
          createdAt: new Date().toISOString(),
          issuer: `mock-issuer-${Date.now()}`
        };
        
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        localStorage.setItem('authToken', `mock-token-${Date.now()}`);
        
        handleLogin(mockUser);
        return mockUser;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleLogin, handleError]);

  const signup = useCallback(async (email, password, userData = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock signup - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email && password) {
        const mockUser = {
          id: Date.now().toString(),
          email: email,
          name: userData.name || email.split('@')[0],
          role: 'user',
          createdAt: new Date().toISOString(),
          issuer: `mock-issuer-${Date.now()}`,
          ...userData
        };
        
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        localStorage.setItem('authToken', `mock-token-${Date.now()}`);
        
        handleLogin(mockUser);
        return mockUser;
      } else {
        throw new Error('Invalid registration data');
      }
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleLogin, handleError]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await magic.user.logout();
      handleLogout();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout, handleError]);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await magic.user.getMetadata();
      if (userData) {
        updateAuthState(userData);
        return { user: userData, token: await magic.user.getIdToken() };
      }
      return null;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [updateAuthState, handleError]);

  const getToken = useCallback(async () => {
    try {
      return await magic.user.getIdToken();
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
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

// Main auth service export
export const authService = {
  // Current user methods
  currentUser: () => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // Authentication methods
  login: async (email, password) => {
    // Mock login implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email && password) {
      const mockUser = {
        id: '1',
        email: email,
        name: email.split('@')[0],
        role: 'user',
        createdAt: new Date().toISOString(),
        issuer: `mock-issuer-${Date.now()}`
      };
      
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      localStorage.setItem('authToken', `mock-token-${Date.now()}`);
      
      return mockUser;
    } else {
      throw new Error('Invalid credentials');
    }
  },
  
  signup: async (email, password, userData = {}) => {
    // Mock signup implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email && password) {
      const mockUser = {
        id: Date.now().toString(),
        email: email,
        name: userData.name || email.split('@')[0],
        role: 'user',
        createdAt: new Date().toISOString(),
        issuer: `mock-issuer-${Date.now()}`,
        ...userData
      };
      
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      localStorage.setItem('authToken', `mock-token-${Date.now()}`);
      
      return mockUser;
    } else {
      throw new Error('Invalid registration data');
    }
  },
  
  logout: async () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    return true;
  },
  
  // Token methods
  getToken: async () => {
    return localStorage.getItem('authToken');
  },
  
  // Utility methods
  isAuthenticated: () => {
    return !!localStorage.getItem('currentUser');
  },
  
  // User management
  updateUser: (userData) => {
    const currentUser = authService.currentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  }
};

// Mock auth instance for backward compatibility
export const auth = {
  open: () => console.log('Auth modal would open here'),
  close: () => console.log('Auth modal would close here'),
  currentUser: () => authService.currentUser()
};

// Default export for backward compatibility
const mockAuth = {
  init: () => console.log('Mock auth initialized'),
  open: () => console.log('Mock auth open'),
  close: () => console.log('Mock auth close'),
  currentUser: () => authService.currentUser(),
  on: (event, callback) => console.log(`Mock auth event: ${event}`),
  off: (event, callback) => console.log(`Mock auth event off: ${event}`),
  login: (email, password) => authService.login(email, password),
  logout: () => authService.logout(),
  signup: (email, password, data) => authService.signup(email, password, data)
};

export default authService;
