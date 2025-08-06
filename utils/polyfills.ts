
// Simplified React Native polyfills for better compatibility

// Only add essential polyfills that are actually needed
console.log('🔧 Loading polyfills...');

// Ensure global object exists
if (typeof global === 'undefined') {
  (globalThis as any).global = globalThis;
}

// Basic process polyfill if needed
if (typeof global !== 'undefined' && typeof global.process === 'undefined') {
  global.process = {
    env: {},
    nextTick: (callback: () => void) => setTimeout(callback, 0),
    version: 'v16.0.0',
    platform: 'react-native',
    argv: [],
    cwd: () => '/',
    exit: () => {},
  } as any;
}

// Ensure process.env exists
if (typeof global !== 'undefined' && global.process && !global.process.env) {
  global.process.env = {};
}

// Only add btoa/atob if they don't exist (they usually do in React Native)
if (typeof global !== 'undefined') {
  if (typeof global.btoa === 'undefined') {
    global.btoa = (str: string) => {
      try {
        // Simple base64 encoding
        return Buffer.from(str, 'binary').toString('base64');
      } catch (error) {
        console.warn('btoa polyfill error:', error);
        return str;
      }
    };
  }

  if (typeof global.atob === 'undefined') {
    global.atob = (str: string) => {
      try {
        // Simple base64 decoding
        return Buffer.from(str, 'base64').toString('binary');
      } catch (error) {
        console.warn('atob polyfill error:', error);
        return str;
      }
    };
  }
}

console.log('✅ Polyfills loaded successfully');

// Export empty object to make this a module
export {};
