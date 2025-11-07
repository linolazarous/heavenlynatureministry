import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: mode !== 'production', // Enable source maps only in dev
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // 🚀 Removes console.* for cleaner production
          drop_debugger: true,
        },
        format: {
          comments: false, // Remove comments from build
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor and app code for better caching
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
      assetsInlineLimit: 4096, // Inline small assets (4kb)
    },
    server: {
      host: true,
      port: parseInt(process.env.PORT || '3000', 10),
      open: true,
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
    },
    define: {
      'process.env': env, // ✅ Allow VITE_ prefixed env vars
    },
  };
});
