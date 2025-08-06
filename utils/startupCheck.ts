
// Startup check to catch common issues early

export const runStartupCheck = async (): Promise<{ success: boolean; errors: string[] }> => {
  const errors: string[] = [];
  
  console.log('🚀 Running startup check...');
  
  try {
    // Check 1: Basic JavaScript environment
    if (typeof console === 'undefined') {
      errors.push('Console object not available');
    }
    
    if (typeof setTimeout === 'undefined') {
      errors.push('setTimeout not available');
    }
    
    if (typeof fetch === 'undefined') {
      errors.push('Fetch API not available');
    }
    
    // Check 2: React Native specific APIs
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      if (!AsyncStorage.default) {
        errors.push('AsyncStorage not properly imported');
      }
    } catch (error) {
      errors.push('AsyncStorage import failed');
    }
    
    // Check 3: Basic storage test
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const testKey = '@startup_test';
      await AsyncStorage.default.setItem(testKey, 'test');
      const value = await AsyncStorage.default.getItem(testKey);
      await AsyncStorage.default.removeItem(testKey);
      
      if (value !== 'test') {
        errors.push('AsyncStorage read/write test failed');
      }
    } catch (error: any) {
      errors.push(`AsyncStorage test failed: ${error.message}`);
    }
    
    // Check 4: JSON operations
    try {
      const testObj = { test: true, number: 123, string: 'hello' };
      const jsonString = JSON.stringify(testObj);
      const parsed = JSON.parse(jsonString);
      
      if (parsed.test !== true || parsed.number !== 123 || parsed.string !== 'hello') {
        errors.push('JSON serialization/deserialization failed');
      }
    } catch (error: any) {
      errors.push(`JSON operations failed: ${error.message}`);
    }
    
    // Check 5: Date operations
    try {
      const now = new Date();
      const isoString = now.toISOString();
      const parsed = new Date(isoString);
      
      if (isNaN(parsed.getTime())) {
        errors.push('Date operations failed');
      }
    } catch (error: any) {
      errors.push(`Date operations failed: ${error.message}`);
    }
    
    // Check 6: Array operations
    try {
      const testArray = [1, 2, 3];
      const filtered = testArray.filter(x => x > 1);
      const mapped = testArray.map(x => x * 2);
      
      if (filtered.length !== 2 || mapped.length !== 3) {
        errors.push('Array operations failed');
      }
    } catch (error: any) {
      errors.push(`Array operations failed: ${error.message}`);
    }
    
    // Check 7: Promise operations
    try {
      await new Promise(resolve => setTimeout(resolve, 1));
      await Promise.resolve('test');
    } catch (error: any) {
      errors.push(`Promise operations failed: ${error.message}`);
    }
    
    const success = errors.length === 0;
    
    if (success) {
      console.log('✅ Startup check passed');
    } else {
      console.error('❌ Startup check failed:', errors);
    }
    
    return { success, errors };
  } catch (error: any) {
    console.error('❌ Startup check crashed:', error);
    errors.push(`Startup check crashed: ${error.message}`);
    return { success: false, errors };
  }
};

// Run startup check and handle results
export const handleStartupCheck = async (): Promise<void> => {
  try {
    const result = await runStartupCheck();
    
    if (!result.success) {
      console.error('🚨 Startup issues detected:', result.errors);
      
      // In development, show detailed errors
      if (__DEV__) {
        console.error('🔧 Development mode - showing detailed startup errors:');
        result.errors.forEach((error, index) => {
          console.error(`${index + 1}. ${error}`);
        });
      }
      
      // Send errors to parent window if available
      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({
            type: 'STARTUP_ERROR',
            errors: result.errors,
            timestamp: new Date().toISOString()
          }, '*');
        } catch (postError) {
          console.error('❌ Failed to send startup errors to parent:', postError);
        }
      }
    }
  } catch (error: any) {
    console.error('❌ Startup check handler failed:', error);
  }
};
