
// Global error logging for runtime errors

import { Platform } from "react-native";

// Simple debouncing to prevent duplicate errors
const recentErrors: { [key: string]: boolean } = {};
const clearErrorAfterDelay = (errorKey: string) => {
  setTimeout(() => delete recentErrors[errorKey], 5000); // Increased delay
};

// Function to send errors to parent window (React frontend)
const sendErrorToParent = (level: string, message: string, data: any) => {
  // Create a simple key to identify duplicate errors
  const errorKey = `${level}:${message.substring(0, 100)}`;

  // Skip if we've seen this exact error recently
  if (recentErrors[errorKey]) {
    return;
  }

  // Mark this error as seen and schedule cleanup
  recentErrors[errorKey] = true;
  clearErrorAfterDelay(errorKey);

  try {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'EXPO_ERROR',
        level: level,
        message: message,
        data: data,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        source: 'abrakadabra-events-app'
      }, '*');
    } else {
      // Fallback to console if no parent window
      console.error('🚨 ERROR (no parent):', level, message, data);
    }
  } catch (error) {
    console.error('❌ Failed to send error to parent:', error);
  }
};

// Function to extract meaningful source location from stack trace
const extractSourceLocation = (stack: string): string => {
  if (!stack) return '';

  // Look for various patterns in the stack trace
  const patterns = [
    // Pattern for app files: app/filename.tsx:line:column
    /at .+\/(app\/[^:)]+):(\d+):(\d+)/,
    // Pattern for components: components/filename.tsx:line:column
    /at .+\/(components\/[^:)]+):(\d+):(\d+)/,
    // Pattern for utils: utils/filename.tsx:line:column
    /at .+\/(utils\/[^:)]+):(\d+):(\d+)/,
    // Pattern for any .tsx/.ts files
    /at .+\/([^/]+\.tsx?):(\d+):(\d+)/,
    // Pattern for bundle files with source maps
    /at .+\/([^/]+\.bundle[^:]*):(\d+):(\d+)/,
    // Pattern for any JavaScript file
    /at .+\/([^/\s:)]+\.[jt]sx?):(\d+):(\d+)/
  ];

  for (const pattern of patterns) {
    const match = stack.match(pattern);
    if (match) {
      return ` | Source: ${match[1]}:${match[2]}:${match[3]}`;
    }
  }

  // If no specific pattern matches, try to find any file reference
  const fileMatch = stack.match(/at .+\/([^/\s:)]+\.[jt]sx?):(\d+)/);
  if (fileMatch) {
    return ` | Source: ${fileMatch[1]}:${fileMatch[2]}`;
  }

  return '';
};

// Function to get caller information from stack trace
const getCallerInfo = (): string => {
  try {
    const stack = new Error().stack || '';
    const lines = stack.split('\n');

    // Skip the first few lines (Error, getCallerInfo, console override)
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];
      if (line.indexOf('app/') !== -1 || line.indexOf('components/') !== -1 || 
          line.indexOf('utils/') !== -1 || line.indexOf('.tsx') !== -1 || line.indexOf('.ts') !== -1) {
        const match = line.match(/at .+\/([^/\s:)]+\.[jt]sx?):(\d+):(\d+)/);
        if (match) {
          return ` | Called from: ${match[1]}:${match[2]}:${match[3]}`;
        }
      }
    }
  } catch (error) {
    // Silently fail if stack trace parsing fails
  }

  return '';
};

export const setupErrorLogging = () => {
  // Only setup error logging in development or web environment
  if (typeof window === 'undefined' && !__DEV__) {
    return;
  }

  // Capture unhandled errors in web environment
  if (typeof window !== 'undefined') {
    // Override window.onerror to catch JavaScript errors
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      try {
        const sourceFile = source ? source.split('/').pop() : 'unknown';
        const errorData = {
          message: String(message),
          source: `${sourceFile}:${lineno}:${colno}`,
          line: lineno,
          column: colno,
          error: error?.stack || String(error),
          timestamp: new Date().toISOString()
        };

        console.error('🚨 RUNTIME ERROR:', errorData);
        sendErrorToParent('error', 'JavaScript Runtime Error', errorData);
      } catch (loggingError) {
        console.error('❌ Error in error logging:', loggingError);
      }

      // Call original handler if it exists
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      
      return false; // Don't prevent default error handling
    };

    // Capture unhandled promise rejections (web only)
    if (Platform.OS === 'web') {
      const originalUnhandledRejection = window.onunhandledrejection;
      window.addEventListener('unhandledrejection', (event) => {
        try {
          const errorData = {
            reason: String(event.reason),
            timestamp: new Date().toISOString()
          };

          console.error('🚨 UNHANDLED PROMISE REJECTION:', errorData);
          sendErrorToParent('error', 'Unhandled Promise Rejection', errorData);
        } catch (loggingError) {
          console.error('❌ Error in promise rejection logging:', loggingError);
        }

        // Call original handler if it exists
        if (originalUnhandledRejection) {
          originalUnhandledRejection.call(window, event);
        }
      });
    }
  }

  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  // Enhanced console.error override for critical errors
  console.error = (...args: any[]) => {
    try {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');

      // Check if this is a critical error that should be reported
      const isCritical = message.toLowerCase().includes('error') || 
                        message.includes('❌') || 
                        message.includes('🚨') ||
                        message.includes('failed') ||
                        message.includes('exception');

      if (isCritical) {
        const stack = new Error().stack || '';
        const sourceInfo = extractSourceLocation(stack);
        const callerInfo = getCallerInfo();

        // Create enhanced message with source information
        const enhancedMessage = message + sourceInfo + callerInfo;

        // Send to parent for critical errors
        sendErrorToParent('error', 'Console Error', enhancedMessage);
      }

      // Always call original console.error
      originalConsoleError('🔥 ERROR:', new Date().toISOString(), ...args);
    } catch (loggingError) {
      // Fallback to original console.error if logging fails
      originalConsoleError('❌ Error logging failed:', loggingError);
      originalConsoleError(...args);
    }
  };

  // Enhanced console.warn override for warnings
  console.warn = (...args: any[]) => {
    try {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');

      // Check if this is an important warning
      const isImportant = message.toLowerCase().includes('deprecated') || 
                         message.includes('⚠️') ||
                         message.includes('warning') ||
                         message.includes('failed');

      if (isImportant) {
        const stack = new Error().stack || '';
        const sourceInfo = extractSourceLocation(stack);

        // Create enhanced message with source information
        const enhancedMessage = message + sourceInfo;

        // Send to parent for important warnings
        sendErrorToParent('warn', 'Console Warning', enhancedMessage);
      }

      // Always call original console.warn
      originalConsoleWarn('⚠️ WARNING:', new Date().toISOString(), ...args);
    } catch (loggingError) {
      // Fallback to original console.warn if logging fails
      originalConsoleWarn('❌ Warning logging failed:', loggingError);
      originalConsoleWarn(...args);
    }
  };

  console.log('✅ Enhanced error logging setup completed');
};
