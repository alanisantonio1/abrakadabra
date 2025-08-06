
// Test React Native compatibility
export const testReactNativeCompatibility = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🧪 Testing React Native compatibility...');
    
    // Test 1: Basic fetch
    const testUrl = 'https://jsonplaceholder.typicode.com/posts/1';
    const response = await fetch(testUrl);
    const data = await response.json();
    
    if (!response.ok || !data.id) {
      throw new Error('Fetch test failed');
    }
    
    // Test 2: JSON operations
    const testObject = { test: 'data', timestamp: Date.now() };
    const jsonString = JSON.stringify(testObject);
    const parsedObject = JSON.parse(jsonString);
    
    if (parsedObject.test !== 'data') {
      throw new Error('JSON test failed');
    }
    
    // Test 3: Base64 operations
    const testString = 'Hello, React Native!';
    const encoded = btoa(testString);
    const decoded = atob(encoded);
    
    if (decoded !== testString) {
      throw new Error('Base64 test failed');
    }
    
    console.log('✅ React Native compatibility tests passed');
    return {
      success: true,
      message: 'All React Native compatibility tests passed successfully'
    };
  } catch (error) {
    console.error('❌ React Native compatibility test failed:', error);
    return {
      success: false,
      message: `Compatibility test failed: ${error}`
    };
  }
};

// Test Google Sheets API without Node.js dependencies
export const testGoogleSheetsAPI = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🧪 Testing Google Sheets API compatibility...');
    
    const SPREADSHEET_ID = '13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s';
    const API_KEY = 'AIzaSyBFupSOezwzthb-vvb3PgTcYf1GrTa3rsc';
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok && data.properties) {
      console.log('✅ Google Sheets API test passed');
      return {
        success: true,
        message: `Google Sheets API working. Sheet title: ${data.properties.title}`
      };
    } else {
      throw new Error(`API test failed: ${data.error?.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ Google Sheets API test failed:', error);
    return {
      success: false,
      message: `Google Sheets API test failed: ${error}`
    };
  }
};

// Run all compatibility tests
export const runAllCompatibilityTests = async (): Promise<string> => {
  let report = '🧪 REACT NATIVE COMPATIBILITY TESTS\n';
  report += '=' .repeat(40) + '\n\n';
  
  // Test 1: React Native compatibility
  const rnTest = await testReactNativeCompatibility();
  report += `1. React Native Compatibility: ${rnTest.success ? '✅ PASS' : '❌ FAIL'}\n`;
  report += `   ${rnTest.message}\n\n`;
  
  // Test 2: Google Sheets API
  const apiTest = await testGoogleSheetsAPI();
  report += `2. Google Sheets API: ${apiTest.success ? '✅ PASS' : '❌ FAIL'}\n`;
  report += `   ${apiTest.message}\n\n`;
  
  report += '=' .repeat(40) + '\n';
  report += 'SUMMARY:\n';
  report += `✅ Tests Passed: ${[rnTest.success, apiTest.success].filter(Boolean).length}/2\n`;
  report += `❌ Tests Failed: ${[rnTest.success, apiTest.success].filter(t => !t).length}/2\n`;
  
  if (rnTest.success && apiTest.success) {
    report += '\n🎉 All compatibility tests passed! The app should work correctly.';
  } else {
    report += '\n⚠️ Some tests failed. Check the details above.';
  }
  
  return report;
};
