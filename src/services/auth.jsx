// src/services/auth.js
import { Magic } from 'magic-sdk';
import { OAuthExtension } from '@magic-ext/oauth';

// Initialize Magic with proper error handling
let magic;

try {
  magic = new Magic(
    import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY || 
    process.env.REACT_APP_MAGIC_PUBLISHABLE_KEY || 
    'pk_test_your_test_key_here',
    {
      extensions: [new OAuthExtension()],
      network: {
        rpcUrl: 'https://polygon-rpc.com/',
        chainId: 137,
      },
    }
  );
  console.log('✅ Magic SDK initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Magic SDK:', error);
  // Fallback to mock only in development
  if (import.meta.env.DEV) {
    magic = initializeMockMagic();
    console.warn('⚠️ Using mock Magic in development');
  } else {
    throw new Error('Magic SDK initialization failed in production');
  }
}

// Mock for development/fallback
function initializeMockMagic() {
  console.log('🔧 Using mock Magic authentication');
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
          publicAddress: `0x${Date.now().toString(16)}`,
        };
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        localStorage.setItem('authToken', `mock-token-${Date.now()}`);
        return mockUser;
      },
    },
  };
}

export { magic };
