// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Simple configuration - remove all complex options
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
});
