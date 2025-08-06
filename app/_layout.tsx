
import '../utils/polyfills'; // Import polyfills first
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { handleStartupCheck } from '../utils/startupCheck';
import ErrorBoundary from '../components/ErrorBoundary';

export default function RootLayout() {
  useEffect(() => {
    // Run startup checks and setup error logging
    const initializeApp = async () => {
      try {
        // Run startup check first
        await handleStartupCheck();
        console.log('✅ Startup check completed');
        
        // Setup error logging
        setupErrorLogging();
        console.log('✅ Error logging initialized');
        
        console.log('🎉 App initialization completed successfully');
      } catch (error: any) {
        console.error('❌ App initialization failed:', error);
        
        // Try to setup basic error logging even if startup check fails
        try {
          setupErrorLogging();
        } catch (loggingError) {
          console.error('❌ Even error logging setup failed:', loggingError);
        }
      }
    };
    
    initializeApp();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#8B5CF6',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              title: 'Abrakadabra Events',
              headerShown: true
            }} 
          />
          <Stack.Screen 
            name="schedule" 
            options={{ 
              title: 'Agendar Evento',
              headerShown: true
            }} 
          />
          <Stack.Screen 
            name="events" 
            options={{ 
              title: 'Eventos',
              headerShown: true
            }} 
          />
          <Stack.Screen 
            name="packages" 
            options={{ 
              title: 'Paquetes',
              headerShown: true
            }} 
          />
          <Stack.Screen 
            name="event/[id]" 
            options={{ 
              title: 'Detalle del Evento',
              headerShown: true
            }} 
          />
        </Stack>
        <StatusBar style="light" />
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
