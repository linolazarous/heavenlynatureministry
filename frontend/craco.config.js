// craco.config.js
const path = require("path");
require("dotenv").config();

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {
      // Remove ESLint plugin from production builds
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.plugins = webpackConfig.plugins.filter(
          (plugin) => plugin.constructor.name !== 'ESLintWebpackPlugin'
        );
      }
      
      // Add ignored patterns to reduce watched directories
      webpackConfig.watchOptions = {
        ...webpackConfig.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/build/**',
          '**/dist/**',
          '**/coverage/**',
          '**/public/**',
        ],
      };
      
      return webpackConfig;
    },
  },
  eslint: {
    enable: process.env.NODE_ENV !== 'production', // Disable ESLint in production
    mode: 'extends',
    configure: (eslintConfig) => {
      eslintConfig.rules = {
        ...eslintConfig.rules,
        'no-duplicate-imports': 'off',
        'no-unused-vars': 'warn',
        'react/react-in-jsx-scope': 'off',
      };
      return eslintConfig;
    },
  },
};
