
// React Native polyfills for Node.js compatibility

// Polyfill for process.env if needed
if (typeof global.process === 'undefined') {
  global.process = {
    env: {},
    nextTick: (callback: () => void) => setTimeout(callback, 0),
    version: 'v16.0.0',
    platform: 'react-native',
  } as any;
}

// Polyfill for Buffer if needed
if (typeof global.Buffer === 'undefined') {
  global.Buffer = {
    from: (str: string, encoding?: string) => {
      if (encoding === 'base64') {
        return { toString: () => atob(str) };
      }
      return { toString: () => str };
    },
    alloc: (size: number) => new Uint8Array(size),
  } as any;
}

// Polyfill for btoa/atob if needed (usually available in React Native)
if (typeof global.btoa === 'undefined') {
  global.btoa = (str: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let result = '';
    let i = 0;
    
    while (i < str.length) {
      const a = str.charCodeAt(i++);
      const b = i < str.length ? str.charCodeAt(i++) : 0;
      const c = i < str.length ? str.charCodeAt(i++) : 0;
      
      const bitmap = (a << 16) | (b << 8) | c;
      
      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += chars.charAt((bitmap >> 6) & 63);
      result += chars.charAt(bitmap & 63);
    }
    
    const padding = str.length % 3;
    return padding ? result.slice(0, padding - 3) + '==='.substring(padding) : result;
  };
}

if (typeof global.atob === 'undefined') {
  global.atob = (str: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let result = '';
    let i = 0;
    
    str = str.replace(/[^A-Za-z0-9+/]/g, '');
    
    while (i < str.length) {
      const encoded1 = chars.indexOf(str.charAt(i++));
      const encoded2 = chars.indexOf(str.charAt(i++));
      const encoded3 = chars.indexOf(str.charAt(i++));
      const encoded4 = chars.indexOf(str.charAt(i++));
      
      const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;
      
      result += String.fromCharCode((bitmap >> 16) & 255);
      if (encoded3 !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
      if (encoded4 !== 64) result += String.fromCharCode(bitmap & 255);
    }
    
    return result;
  };
}

// Export empty object to make this a module
export {};
