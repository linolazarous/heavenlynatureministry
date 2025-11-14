import { useState, useEffect, useCallback } from 'react';
import { authService } from './authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
      return { success: true };
    } catch (err) {
      console.error('Login failed', err);
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  return { user, isLoading, login, logout, isAuthenticated: !!user };
};
