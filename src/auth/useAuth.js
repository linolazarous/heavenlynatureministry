import { useState, useEffect, useCallback } from 'react';
import { authService } from './authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await authService.login(email, password);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return { user, isAuthenticated: !!user, login, logout };
};
