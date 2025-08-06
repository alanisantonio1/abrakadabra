
import '../utils/polyfills'; // Import polyfills first
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
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
  );
}
