
import { Platform } from "react-native";

// Error logging utility for the Abrakadabra Events App
// Now focused on local logging and Supabase integration

interface ErrorLogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  data?: any;
  source?: string;
  platform: string;
  userAgent?: string;
}

// Store recent errors in memory for diagnostics
const recentErrors: ErrorLogEntry[] = [];
const MAX_STORED_ERRORS = 50;

// Clear error after a delay to prevent memory leaks
const clearErrorAfterDelay = (errorKey: string) => {
  setTimeout(() => {
    const index = recentErrors.findIndex(e => e.timestamp === errorKey);
    if (index > -1 && recentErrors.length > MAX_STORED_ERRORS) {
      recentErrors.splice(index, 1);
    }
  }, 300000); // Clear after 5 minutes
};

// Send error to parent window (for web debugging)
const sendErrorToParent = (level: string, message: string, data?: any) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.parent) {
    try {
      window.parent.postMessage({
        type: 'ABRAKADABRA_ERROR_LOG',
        level,
        message,
        data,
        timestamp: new Date().toISOString(),
        platform: Platform.OS
      }, '*');
    } catch (error) {
      // Ignore postMessage errors
    }
  }
};

// Extract source location from stack trace
const extractSourceLocation = (stack: string): string => {
  try {
    const lines = stack.split('\n');
    for (const line of lines) {
      if (line.includes('.tsx') || line.includes('.ts') || line.includes('.js')) {
        const match = line.match(/([^/\\]+\.(tsx?|jsx?)):\d+:\d+/);
        if (match) {
          return match[1];
        }
      }
    }
    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
};

// Get caller information
const getCallerInfo = (): string => {
  try {
    const stack = new Error().stack || '';
    return extractSourceLocation(stack);
  } catch (error) {
    return 'unknown';
  }
};

// Main logging function
export const logError = (
  level: 'error' | 'warn' | 'info' | 'debug',
  message: string,
  data?: any,
  source?: string
): void => {
  const timestamp = new Date().toISOString();
  const logEntry: ErrorLogEntry = {
    timestamp,
    level,
    message,
    data,
    source: source || getCallerInfo(),
    platform: Platform.OS,
    userAgent: Platform.OS === 'web' ? navigator.userAgent : undefined
  };

  // Add to recent errors
  recentErrors.unshift(logEntry);
  if (recentErrors.length > MAX_STORED_ERRORS) {
    recentErrors.pop();
  }

  // Console logging with appropriate level
  const consoleMessage = `[${level.toUpperCase()}] ${message}`;
  const consoleData = data ? [consoleMessage, data] : [consoleMessage];

  switch (level) {
    case 'error':
      console.error(...consoleData);
      break;
    case 'warn':
      console.warn(...consoleData);
      break;
    case 'info':
      console.info(...consoleData);
      break;
    case 'debug':
      console.debug(...consoleData);
      break;
  }

  // Send to parent for web debugging
  sendErrorToParent(level, message, data);

  // Clear old errors
  clearErrorAfterDelay(timestamp);
};

// Convenience functions
export const logErrorMessage = (message: string, data?: any, source?: string) => {
  logError('error', message, data, source);
};

export const logWarning = (message: string, data?: any, source?: string) => {
  logError('warn', message, data, source);
};

export const logInfo = (message: string, data?: any, source?: string) => {
  logError('info', message, data, source);
};

export const logDebug = (message: string, data?: any, source?: string) => {
  logError('debug', message, data, source);
};

// Get recent errors for diagnostics
export const getRecentErrors = (): ErrorLogEntry[] => {
  return [...recentErrors];
};

// Clear all stored errors
export const clearStoredErrors = (): void => {
  recentErrors.length = 0;
  console.log('🧹 Cleared all stored errors');
};

// Format errors for display
export const formatErrorsForDisplay = (): string => {
  if (recentErrors.length === 0) {
    return 'No hay errores recientes registrados.';
  }

  let report = `📋 ERRORES RECIENTES (${recentErrors.length})\n\n`;
  
  recentErrors.slice(0, 10).forEach((error, index) => {
    const time = new Date(error.timestamp).toLocaleTimeString();
    report += `${index + 1}. [${error.level.toUpperCase()}] ${time}\n`;
    report += `   Mensaje: ${error.message}\n`;
    if (error.source) {
      report += `   Fuente: ${error.source}\n`;
    }
    if (error.data) {
      report += `   Datos: ${JSON.stringify(error.data).substring(0, 100)}...\n`;
    }
    report += '\n';
  });

  if (recentErrors.length > 10) {
    report += `... y ${recentErrors.length - 10} errores más\n`;
  }

  return report;
};

// Error boundary helper
export const handleComponentError = (error: Error, errorInfo: any, componentName: string) => {
  logError('error', `Component error in ${componentName}`, {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack
  }, componentName);
};

// Network error helper
export const handleNetworkError = (error: any, operation: string) => {
  const errorMessage = error.message || 'Unknown network error';
  logError('error', `Network error during ${operation}`, {
    error: errorMessage,
    operation,
    status: error.status,
    statusText: error.statusText
  }, 'NetworkError');
};

// Storage error helper
export const handleStorageError = (error: any, operation: string) => {
  const errorMessage = error.message || 'Unknown storage error';
  logError('error', `Storage error during ${operation}`, {
    error: errorMessage,
    operation
  }, 'StorageError');
};

// Supabase error helper
export const handleSupabaseError = (error: any, operation: string) => {
  const errorMessage = error.message || 'Unknown Supabase error';
  logError('error', `Supabase error during ${operation}`, {
    error: errorMessage,
    operation,
    code: error.code,
    details: error.details
  }, 'SupabaseError');
};

// Initialize error logging - FIXED FUNCTION NAME
export const setupErrorLogging = () => {
  console.log('🚀 Error logging initialized for Abrakadabra Events App');
  
  // Global error handler for unhandled promise rejections
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      logError('error', 'Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise
      }, 'UnhandledRejection');
    });
  }

  logInfo('Error logging system ready', {
    platform: Platform.OS,
    maxStoredErrors: MAX_STORED_ERRORS
  });
};

// Also export the alternative name for compatibility
export const initializeErrorLogging = setupErrorLogging;

// Export default logger
export default {
  error: logErrorMessage,
  warn: logWarning,
  info: logInfo,
  debug: logDebug,
  getRecent: getRecentErrors,
  clear: clearStoredErrors,
  format: formatErrorsForDisplay,
  init: setupErrorLogging,
  setup: setupErrorLogging
};
