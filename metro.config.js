
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Use turborepo to restore the cache when possible
config.cacheStores = [
  new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
];

// Add resolver configuration for React Native compatibility
config.resolver = {
  ...config.resolver,
  alias: {
    // Polyfill Node.js modules for React Native
    'crypto': 'react-native-crypto',
    'stream': 'stream-browserify',
    'buffer': '@craftzdog/react-native-buffer',
  },
  fallback: {
    // Provide fallbacks for Node.js modules
    'fs': false,
    'path': false,
    'os': false,
    'crypto': false,
    'stream': false,
    'buffer': false,
    'util': false,
    'assert': false,
    'url': false,
    'querystring': false,
  },
};

// Configure transformer to handle polyfills
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;
