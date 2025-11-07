import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // Shortcut for imports
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: mode !== 'production', // Only dev has source maps
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,    // Remove all console logs
          drop_debugger: true,   // Remove debugger statements
        },
        format: {
          comments: false,       // Strip comments for production
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor code for caching
            vendor: ['react', 'react-dom', 'react-router-dom', 'aos'],
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
      assetsInlineLimit: 4096, // Inline assets smaller than 4kb
      cssCodeSplit: true,      // Split CSS for caching
    },
    server: {
      host: true,
      port: parseInt(process.env.PORT || '3000', 10),
      open: true,
      strictPort: true,        // Fail if port is in use
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
    },
    define: {
      'process.env': { ...env }, // Allow access to VITE_ env vars
    },
    base: env.VITE_BASE_PATH || '/', // Ensure correct base path on Render
    logLevel: 'info',
  };
});
