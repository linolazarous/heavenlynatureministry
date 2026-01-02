// frontend/craco.config.js
const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    configure: (webpackConfig) => {
      // Remove ESLint from production builds (safe)
      if (process.env.NODE_ENV === "production") {
        webpackConfig.plugins = webpackConfig.plugins.filter(
          (plugin) => plugin.constructor?.name !== "ESLintWebpackPlugin"
        );
      }

      // Stable production optimizations
      if (process.env.NODE_ENV === "production") {
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: "all",
            name: false,
          },
          runtimeChunk: "single",
        };
      }

      return webpackConfig;
    },
  },

  eslint: {
    enable: false, // fully disable ESLint in CRACO (no runtime dependency)
  },

  babel: {
    presets: [
      [
        "@babel/preset-react",
        {
          runtime: "automatic",
        },
      ],
    ],
  },
};
