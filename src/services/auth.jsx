// src/services/auth.jsx
console.log('Magic authentication initialized');

export const initializeMagic = () => {
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
      getIdToken: async () => {
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) return null;
        return `mock-token-${Date.now()}`;
      },
      logout: async () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        return true;
      },
    },
    auth: {
      loginWithMagicLink: async ({ email }) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!email || !email.includes('@')) throw new Error('Invalid email');
        const mockUser = {
          id: Date.now().toString(),
          email,
          name: email.split('@')[0],
          createdAt: new Date().toISOString(),
          issuer: `mock-issuer-${Date.now()}`,
        };
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        localStorage.setItem('authToken', `mock-token-${Date.now()}`);
        return mockUser;
      },
    },
  };
};

// ✅ Export a single mock instance
export const magic = initializeMagic();
