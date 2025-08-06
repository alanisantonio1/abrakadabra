
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.danger,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  errorDetails: {
    backgroundColor: colors.lightGray,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    color: colors.gray,
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  reportButtonText: {
    color: colors.white,
    fontSize: 14,
  },
});

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('🚨 ErrorBoundary caught an error:', error);
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary componentDidCatch:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log error details for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  handleRetry = () => {
    console.log('🔄 Retrying after error...');
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReportError = () => {
    console.log('📧 Reporting error...');
    // In a real app, you might send this to an error reporting service
    const errorReport = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };
    
    console.log('Error report:', errorReport);
    
    // For now, just log it
    alert('Error reportado. Revisa la consola para más detalles.');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component
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
        <View style={styles.container}>
          <Text style={styles.title}>🚨 ¡Oops! Algo salió mal</Text>
          
          <Text style={styles.message}>
            La aplicación encontró un error inesperado. Esto puede deberse a:
            {'\n\n'}
            • Problemas de conectividad
            {'\n'}
            • Error en los datos
            {'\n'}
            • Problema temporal del sistema
            {'\n\n'}
            Intenta recargar la aplicación o contacta al soporte técnico si el problema persiste.
          </Text>

          {this.state.error && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorText}>
                Error: {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack?.substring(0, 500)}
                {this.state.error.stack && this.state.error.stack.length > 500 ? '...' : ''}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
            <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.reportButton} onPress={this.handleReportError}>
            <Text style={styles.reportButtonText}>📧 Reportar Error</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
