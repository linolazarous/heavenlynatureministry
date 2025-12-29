import { useState, useEffect } from 'react';
import axios from 'axios';

export const useAdminAuth = () => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/auth/check');
      if (response.data.authenticated) {
        setAdminUser(response.data.user);
      } else {
        localStorage.removeItem('admin_session_token');
        localStorage.removeItem('admin_user');
      }
    } catch (error) {
      console.error('Error checking admin auth:', error);
      localStorage.removeItem('admin_session_token');
      localStorage.removeItem('admin_user');
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/admin/login', {
        username,
        password
      });

      if (response.data.session_token) {
        localStorage.setItem('admin_session_token', response.data.session_token);
        localStorage.setItem('admin_user', JSON.stringify(response.data));
        setAdminUser(response.data);
        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const adminLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_session_token');
      localStorage.removeItem('admin_user');
      setAdminUser(null);
    }
  };

  return {
    adminUser,
    loading,
    adminLogin,
    adminLogout,
    checkAdminAuth
  };
};
