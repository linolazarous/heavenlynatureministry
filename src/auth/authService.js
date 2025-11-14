import apiClient from '../api/apiClient';

export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user } = response.data;

    // Save JWT to localStorage
    localStorage.setItem('jwtToken', token);
    return user;
  },

  logout: () => {
    localStorage.removeItem('jwtToken');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) return null;

    try {
      // Decode JWT payload (basic)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { id: payload.sub, email: payload.email, name: payload.name };
    } catch (err) {
      console.error('Invalid JWT', err);
      return null;
    }
  },

  isAuthenticated: () => !!localStorage.getItem('jwtToken')
};
