
// Health check utility to diagnose common issues

export interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: string;
}

export interface SystemHealth {
  overall: HealthCheckResult;
  localStorage: HealthCheckResult;
  supabase: HealthCheckResult;
  network: HealthCheckResult;
}

// Check if AsyncStorage is working
export const checkLocalStorage = async (): Promise<HealthCheckResult> => {
  try {
    const testKey = '@health_check_test';
    const testValue = JSON.stringify({ test: true, timestamp: Date.now() });
    
    // Test write
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    await AsyncStorage.default.setItem(testKey, testValue);
    
    // Test read
    const retrieved = await AsyncStorage.default.getItem(testKey);
    
    // Test delete
    await AsyncStorage.default.removeItem(testKey);
    
    if (retrieved === testValue) {
      return {
        status: 'healthy',
        message: 'Local storage is working correctly',
        details: 'Read/write/delete operations successful'
      };
    } else {
      return {
        status: 'error',
        message: 'Local storage data integrity issue',
        details: 'Data retrieved does not match data written'
      };
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: 'Local storage is not working',
      details: error.message || 'Unknown error'
    };
  }
};

// Check network connectivity
export const checkNetwork = async (): Promise<HealthCheckResult> => {
  try {
    // Simple network test using a reliable endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache'
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return {
        status: 'healthy',
        message: 'Network connectivity is working',
        details: `Response time: ${response.headers.get('date')}`
      };
    } else {
      return {
        status: 'warning',
        message: 'Network connectivity issues detected',
        details: `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        status: 'error',
        message: 'Network request timed out',
        details: 'No response after 5 seconds'
      };
    }
    
    return {
      status: 'error',
      message: 'Network connectivity failed',
      details: error.message || 'Unknown network error'
    };
  }
};

// Check Supabase connectivity
export const checkSupabase = async (): Promise<HealthCheckResult> => {
  try {
    const { checkEventsTableExists } = await import('./supabaseSetup');
    const result = await checkEventsTableExists();
    
    if (result.exists) {
      return {
        status: 'healthy',
        message: 'Supabase connection is working',
        details: 'Events table exists and is accessible'
      };
    } else {
      return {
        status: 'warning',
        message: 'Supabase not configured',
        details: 'Events table does not exist. Run setup to configure.'
      };
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: 'Supabase connection error',
      details: error.message || 'Unknown error'
    };
  }
};

// Run comprehensive health check
export const runHealthCheck = async (): Promise<SystemHealth> => {
  console.log('🏥 Running system health check...');
  
  const results = await Promise.allSettled([
    checkLocalStorage(),
    checkSupabase(),
    checkNetwork()
  ]);
  
  const localStorage = results[0].status === 'fulfilled' ? results[0].value : {
    status: 'error' as const,
    message: 'Health check failed',
    details: results[0].status === 'rejected' ? results[0].reason?.message : 'Unknown error'
  };
  
  const supabase = results[1].status === 'fulfilled' ? results[1].value : {
    status: 'error' as const,
    message: 'Health check failed',
    details: results[1].status === 'rejected' ? results[1].reason?.message : 'Unknown error'
  };
  
  const network = results[2].status === 'fulfilled' ? results[2].value : {
    status: 'error' as const,
    message: 'Health check failed',
    details: results[2].status === 'rejected' ? results[2].reason?.message : 'Unknown error'
  };
  
  // Determine overall health
  const allResults = [localStorage, supabase, network];
  const hasError = allResults.some(r => r.status === 'error');
  const hasWarning = allResults.some(r => r.status === 'warning');
  
  let overall: HealthCheckResult;
  if (hasError) {
    overall = {
      status: 'error',
      message: 'System has critical issues',
      details: 'Check individual components for details'
    };
  } else if (hasWarning) {
    overall = {
      status: 'warning',
      message: 'System is working with some limitations',
      details: 'Some features may not work optimally'
    };
  } else {
    overall = {
      status: 'healthy',
      message: 'All systems are working correctly',
      details: 'Full functionality available'
    };
  }
  
  const health: SystemHealth = {
    overall,
    localStorage,
    supabase,
    network
  };
  
  console.log('🏥 Health check completed:', health.overall.status);
  return health;
};

// Format health check results for display
export const formatHealthReport = (health: SystemHealth): string => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };
  
  let report = '🏥 SYSTEM HEALTH REPORT\n\n';
  
  report += `Overall Status: ${getStatusIcon(health.overall.status)} ${health.overall.message}\n`;
  if (health.overall.details) {
    report += `Details: ${health.overall.details}\n`;
  }
  
  report += '\n📋 COMPONENT STATUS:\n\n';
  
  report += `1. Local Storage: ${getStatusIcon(health.localStorage.status)} ${health.localStorage.message}\n`;
  if (health.localStorage.details) {
    report += `   Details: ${health.localStorage.details}\n`;
  }
  
  report += `\n2. Supabase: ${getStatusIcon(health.supabase.status)} ${health.supabase.message}\n`;
  if (health.supabase.details) {
    report += `   Details: ${health.supabase.details}\n`;
  }
  
  report += `\n3. Network: ${getStatusIcon(health.network.status)} ${health.network.message}\n`;
  if (health.network.details) {
    report += `   Details: ${health.network.details}\n`;
  }
  
  report += '\n🔧 RECOMMENDATIONS:\n';
  
  if (health.localStorage.status === 'error') {
    report += '- Restart the app to fix local storage issues\n';
  }
  
  if (health.supabase.status === 'error') {
    report += '- Check internet connection and Supabase configuration\n';
  }
  
  if (health.network.status === 'error') {
    report += '- Check internet connection and firewall settings\n';
  }
  
  if (health.overall.status === 'healthy') {
    report += '- All systems are working correctly! 🎉\n';
  }
  
  return report;
};
