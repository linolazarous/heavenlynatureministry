import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '@/api/axios';
import axios from 'axios';

// Create separate contexts for better separation
const UserAuthContext = createContext(null);
const AdminAuthContext = createContext(null);

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within UserAuthProvider');
  }
  return context;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

// User authentication provider
export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    const token = localStorage.getItem('user_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      // Set default Authorization header for user routes
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/user-login', { 
        email, 
        password 
      });
      
      const { access_token, user: userData } = response.data;
      
      // Store user token separately from admin token
      localStorage.setItem('user_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set Authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const register = async (email, password, full_name, phone) => {
    try {
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        full_name,
        phone,
      });
      
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('user_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set Authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    // Only remove user-specific items
    localStorage.removeItem('user_token');
    localStorage.removeItem('user');
    
    // Remove Authorization header
    delete api.defaults.headers.common['Authorization'];
    
    setUser(null);
  };

  const isUser = () => user?.role === 'user';

  return (
    <UserAuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isUser,
        loading,
        checkUserAuth
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

// Admin authentication provider
export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    const sessionToken = localStorage.getItem('admin_session_token');
    const savedAdminUser = localStorage.getItem('admin_user');
    
    if (sessionToken && savedAdminUser) {
      try {
        // Verify session with backend
        const response = await axios.get('/api/auth/check', {
          headers: {
            'Authorization': `Bearer ${sessionToken}`
          }
        });
        
        if (response.data.authenticated) {
          setAdminUser(JSON.parse(savedAdminUser));
        } else {
          // Clear invalid session
          localStorage.removeItem('admin_session_token');
          localStorage.removeItem('admin_user');
        }
      } catch (error) {
        console.error('Admin auth check failed:', error);
        localStorage.removeItem('admin_session_token');
        localStorage.removeItem('admin_user');
      }
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/admin/login', { 
        username, 
        password 
      });
      
      const { session_token, ...adminData } = response.data;
      
      localStorage.setItem('admin_session_token', session_token);
      localStorage.setItem('admin_user', JSON.stringify(adminData));
      
      // Note: Admin routes use session_token via interceptors, not Authorization header
      
      setAdminUser(adminData);
      
      return { success: true, admin: adminData };
    } catch (error) {
      console.error('Admin login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear admin session regardless
      localStorage.removeItem('admin_session_token');
      localStorage.removeItem('admin_user');
      setAdminUser(null);
    }
  };

  const isAdmin = () => adminUser?.role === 'admin' || adminUser?.role === 'super_admin';

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        login,
        logout,
        isAdmin,
        loading,
        checkAdminAuth
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

// Combined provider for convenience
export const CombinedAuthProvider = ({ children }) => {
  return (
    <AdminAuthProvider>
      <UserAuthProvider>
        {children}
      </UserAuthProvider>
    </AdminAuthProvider>
  );
};

// Hook to use both auth contexts
export const useAuth = () => {
  return {
    user: useUserAuth(),
    admin: useAdminAuth()
  };
};
