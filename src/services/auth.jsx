// src/services/auth.jsx - Simple mock (optional)
console.log('🔧 Using mock authentication');

export const mockAuth = {
  login: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const user = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  },
  logout: async () => {
    localStorage.removeItem('currentUser');
    return true;
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
};
