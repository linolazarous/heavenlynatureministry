import apiClient from '../api/apiClient';

export const authService = {
  login: async (email, password) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('jwtToken', data.token);
    return data.user;
  },
  logout: () => localStorage.removeItem('jwtToken'),
  getCurrentUser: () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { id: payload.sub, name: payload.name, email: payload.email };
    } catch {
      return null;
    }
  }
};
