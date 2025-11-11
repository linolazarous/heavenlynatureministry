// ✅ src/components/AuthContext.jsx - Simplified for frontend only
import React, { createContext, useState, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    isLoading: false,
    isAuthenticated: false,
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Simple mock login - just store user in localStorage
  const login = useCallback(async (email, redirectPath = '/') => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      throw new Error('Invalid email address.');
    }

    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUser = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString(),
      };

      // Store in localStorage for persistence
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      
      setAuthState({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
      });

      toast.success(`Welcome back, ${email}!`);
      navigate(location.state?.from || redirectPath, { replace: true });

      return mockUser;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      toast.error('Login failed. Please try again.');
      throw error;
    }
  }, [navigate, location]);

  // Simple logout
  const logout = useCallback(async () => {
    localStorage.removeItem('currentUser');
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
    
    toast.success('You have been logged out successfully.');
    navigate('/login', { state: { from: location.pathname }, replace: true });
  }, [navigate, location]);

  // Check if user is logged in on app start
  const checkAuthStatus = useCallback(() => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  // Initialize auth state on mount
  React.useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const contextValue = {
    ...authState,
    login,
    logout,
    refreshUser: () => checkAuthStatus(), // Simple refresh
    getToken: async () => 'mock-token-' + Date.now(), // Mock token
  };

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

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectPath, { 
        state: { from: location.pathname } 
      });
    }
  }, [isAuthenticated, isLoading, navigate, redirectPath, location]);

  return { isAuthenticated, isLoading };
}
