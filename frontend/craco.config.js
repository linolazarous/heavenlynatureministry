// frontend/craco.config.js
const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {
      // Remove ESLint plugin for production builds
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.plugins = webpackConfig.plugins.filter(
          (plugin) => plugin.constructor.name !== 'ESLintWebpackPlugin'
        );
      }
      
      // Optimize bundle splitting
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
              },
            },
          },
          runtimeChunk: {
            name: 'runtime',
          },
        };
      }
      
      return webpackConfig;
    },
  },
  eslint: {
    enable: process.env.NODE_ENV !== 'production',
  },
  babel: {
    presets: [
      [
        '@babel/preset-react',
        {
          runtime: 'automatic',
        },
      ],
    ],
  },
};
