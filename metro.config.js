
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Use turborepo to restore the cache when possible
config.cacheStores = [
  new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
];

// Simplified resolver configuration for better compatibility
config.resolver = {
  ...config.resolver,
  // Remove problematic aliases that might cause issues
  alias: {},
  // Simplified fallback configuration
  fallback: {},
};

// Configure transformer for better compatibility
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: false, // Changed to false for better compatibility
    },
  }),
};

module.exports = config;
