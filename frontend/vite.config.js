import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env variables (Vite-style)
  const env = loadEnv(mode, process.cwd(), "");

  const isDev = mode !== "production";
  const enableHealthCheck = env.VITE_ENABLE_HEALTH_CHECK === "true";

  return {
    plugins: [
      react({
        // React Fast Refresh + strict mode support
        fastRefresh: true,
      }),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@/components": path.resolve(__dirname, "src/components"),
        "@/components/ui": path.resolve(__dirname, "src/components/ui"),
        "@/lib": path.resolve(__dirname, "src/lib"),
        "@/hooks": path.resolve(__dirname, "src/hooks"),
      },
    },

    css: {
      postcss: "./postcss.config.js",
    },

    server: {
      port: 5173,
      strictPort: true,
      open: true,
    },

    build: {
      outDir: "dist",
      sourcemap: isDev,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        external: ["@stripe/stripe-js"], // Add this line
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            router: ["react-router-dom"],
          },
        },
      },
    },

    preview: {
      port: 4173,
      strictPort: true,
    },

    define: {
      __DEV__: isDev,
      __HEALTH_CHECK_ENABLED__: enableHealthCheck,
    },
  };
});
