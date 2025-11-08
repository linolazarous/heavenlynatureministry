// src/services/auth.jsx
import { useState, useEffect, useCallback } from 'react';

// Mock authentication system (replace with your actual auth provider)
export const initializeAuth = () => {
  console.log('Auth system initialized');
  return {
    currentUser: () => {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    }
  };
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
    
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
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
    try {
      const identity = initializeAuth();

      // Check current user
      const currentUser = identity.currentUser();
      if (currentUser) {
        updateAuthState(currentUser);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      handleError(err);
    }
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
          createdAt: new Date().toISOString()
        };
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
          ...userData
        };
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

  const logout = useCallback(() => {
    setIsLoading(true);
    handleLogout();
    setIsLoading(false);
  }, [handleLogout]);

  const refreshUser = useCallback(async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser) {
      updateAuthState(currentUser);
      return { user: currentUser, token: 'mock-token' };
    }
    return null;
  }, [updateAuthState]);

  const getToken = useCallback(async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return currentUser ? 'mock-token' : null;
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

// Mock auth instance
export const auth = {
  open: () => console.log('Auth modal would open here'),
  close: () => console.log('Auth modal would close here'),
  currentUser: () => JSON.parse(localStorage.getItem('currentUser') || 'null')
};

// Mock default export
const mockAuth = {
  init: () => console.log('Mock auth initialized'),
  open: () => console.log('Mock auth open'),
  close: () => console.log('Mock auth close'),
  currentUser: () => JSON.parse(localStorage.getItem('currentUser') || 'null'),
  on: (event, callback) => console.log(`Mock auth event: ${event}`),
  off: (event, callback) => console.log(`Mock auth event off: ${event}`),
  login: (email, password) => console.log('Mock login'),
  logout: () => console.log('Mock logout'),
  signup: (email, password, data) => console.log('Mock signup')
};

export default mockAuth;
