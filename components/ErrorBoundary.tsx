
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('🚨 ErrorBoundary caught an error:', error);
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary componentDidCatch:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log the error for debugging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    };

    console.error('🔥 React Error Details:', errorDetails);

    // Send error to parent window if available
    try {
      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'REACT_ERROR',
          error: errorDetails,
          timestamp: new Date().toISOString()
        }, '*');
      }
    } catch (postMessageError) {
      console.error('❌ Failed to send React error to parent:', postMessageError);
    }
  }

  handleRetry = () => {
    console.log('🔄 Retrying after error...');
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined 
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error!} 
            retry={this.handleRetry} 
          />
        );
      }

      // Default error UI
      return (
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>🚨 Oops! Algo salió mal</Text>
            
            <Text style={styles.errorMessage}>
              La aplicación encontró un error inesperado.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>Detalles del error:</Text>
                <Text style={styles.errorDetailsText}>
                  {this.state.error.message}
                </Text>
                {this.state.error.stack && (
                  <Text style={styles.errorStack}>
                    {this.state.error.stack.substring(0, 500)}...
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={this.handleRetry}
            >
              <Text style={styles.retryButtonText}>🔄 Intentar de nuevo</Text>
            </TouchableOpacity>

            <Text style={styles.helpText}>
              Si el problema persiste, reinicia la aplicación.
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.error || '#e74c3c',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  errorDetails: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  errorDetailsText: {
    fontSize: 12,
    color: '#e74c3c',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: colors.primary || '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ErrorBoundary;
