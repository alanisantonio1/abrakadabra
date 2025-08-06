
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '../types';

const EVENTS_KEY = '@abrakadabra_events';

// Load events from local storage
const loadEventsFromLocalStorage = async (): Promise<Event[]> => {
  try {
    console.log('📱 Loading events from local storage...');
    const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    
    if (eventsJson) {
      const events = JSON.parse(eventsJson);
      console.log('✅ Loaded events from local storage:', events.length);
      return events;
    }
    
    console.log('📱 No events found in local storage');
    return [];
  } catch (error) {
    console.error('❌ Error loading events from local storage:', error);
    return [];
  }
};

// Save events to local storage
const saveEventsToLocalStorage = async (events: Event[]): Promise<void> => {
  try {
    console.log('💾 Saving events to local storage:', events.length);
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    console.log('✅ Events saved to local storage');
  } catch (error) {
    console.error('❌ Error saving events to local storage:', error);
  }
};

// Generate unique event ID
export const generateEventId = (): string => {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Load events (only from local storage now)
export const loadEvents = async (): Promise<Event[]> => {
  try {
    console.log('📥 Loading events from local storage...');
    const localEvents = await loadEventsFromLocalStorage();
    console.log('📱 Local storage events:', localEvents.length);
    return localEvents;
  } catch (error) {
    console.error('❌ Error loading events:', error);
    return [];
  }
};

// Save event (only to local storage now)
export const saveEvent = async (event: Event): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('💾 Saving event:', event.id);
    
    // Save to local storage
    const currentEvents = await loadEventsFromLocalStorage();
    const updatedEvents = [...currentEvents, event];
    await saveEventsToLocalStorage(updatedEvents);
    console.log('✅ Event saved to local storage');
    
    return { 
      success: true, 
      message: 'Evento guardado exitosamente en almacenamiento local' 
    };
  } catch (error) {
    console.error('❌ Error saving event:', error);
    return { 
      success: false, 
      message: `Error guardando evento: ${error}` 
    };
  }
};

// Update event (only in local storage now)
export const updateEvent = async (updatedEvent: Event): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🔄 Updating event:', updatedEvent.id);
    
    // Update in local storage
    const currentEvents = await loadEventsFromLocalStorage();
    const eventIndex = currentEvents.findIndex(e => e.id === updatedEvent.id);
    
    if (eventIndex !== -1) {
      currentEvents[eventIndex] = updatedEvent;
      await saveEventsToLocalStorage(currentEvents);
      console.log('✅ Event updated in local storage');
    } else {
      console.warn('⚠️ Event not found in local storage, adding as new');
      currentEvents.push(updatedEvent);
      await saveEventsToLocalStorage(currentEvents);
    }
    
    return { 
      success: true, 
      message: 'Evento actualizado exitosamente en almacenamiento local' 
    };
  } catch (error) {
    console.error('❌ Error updating event:', error);
    return { 
      success: false, 
      message: `Error actualizando evento: ${error}` 
    };
  }
};

// Delete event (only from local storage now)
export const deleteEvent = async (eventToDelete: Event): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🗑️ Deleting event:', eventToDelete.id);
    
    // Delete from local storage
    const currentEvents = await loadEventsFromLocalStorage();
    const filteredEvents = currentEvents.filter(e => e.id !== eventToDelete.id);
    await saveEventsToLocalStorage(filteredEvents);
    console.log('✅ Event deleted from local storage');
    
    return { 
      success: true, 
      message: 'Evento eliminado exitosamente del almacenamiento local' 
    };
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    return { 
      success: false, 
      message: `Error eliminando evento: ${error}` 
    };
  }
};

// Test local storage connection
export const testDatabaseConnections = async (): Promise<string> => {
  try {
    console.log('🧪 Testing local storage connection...');
    
    let report = '🔍 PRUEBA DE ALMACENAMIENTO LOCAL\n\n';
    
    // Test local storage
    try {
      const testEvent: Event = {
        id: 'test_' + Date.now(),
        date: '2024-12-31',
        time: '15:00',
        customerName: 'Test Cliente',
        customerPhone: '+52 55 1234 5678',
        childName: 'Test Niño',
        packageType: 'Abra',
        totalAmount: 1000,
        deposit: 500,
        remainingAmount: 500,
        isPaid: false,
        notes: 'Test event',
        createdAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('@test_key', JSON.stringify(testEvent));
      const retrieved = await AsyncStorage.getItem('@test_key');
      await AsyncStorage.removeItem('@test_key');
      
      if (retrieved) {
        report += '1. Almacenamiento Local: ✅ FUNCIONANDO\n';
        report += '   - Escritura: OK\n';
        report += '   - Lectura: OK\n';
        report += '   - Eliminación: OK\n';
      } else {
        report += '1. Almacenamiento Local: ❌ ERROR\n';
      }
    } catch (error) {
      report += '1. Almacenamiento Local: ❌ ERROR\n';
      report += `   - Error: ${error}\n`;
    }
    
    // Load current events count
    try {
      const events = await loadEventsFromLocalStorage();
      report += `   - Eventos almacenados: ${events.length}\n`;
    } catch (error) {
      report += `   - Error cargando eventos: ${error}\n`;
    }
    
    report += '\n\n📊 RESUMEN:';
    report += '\n✅ Almacenamiento Local: Único sistema de almacenamiento';
    report += '\n🔄 Flujo: Solo almacenamiento local';
    report += '\n⚠️ Nota: Supabase y Google Sheets han sido removidos';
    
    report += '\n\n🎯 CARACTERÍSTICAS ACTUALES:';
    report += '\n✅ Almacenamiento local confiable';
    report += '\n✅ Sin dependencias externas';
    report += '\n✅ Funcionamiento offline completo';
    report += '\n✅ Datos persistentes en el dispositivo';
    
    return report;
  } catch (error) {
    return `❌ Error en prueba de almacenamiento: ${error}`;
  }
};

// Legacy function for compatibility (no longer needed)
export const runGoogleSheetsDiagnostics = async (): Promise<string> => {
  return '⚠️ Google Sheets ha sido removido del sistema.\n\nLa aplicación ahora funciona únicamente con almacenamiento local.\n\nTodos los eventos se guardan de forma segura en el dispositivo.';
};

// Legacy function for compatibility (no longer needed)
export const syncGoogleSheetsToSupabase = async (): Promise<{ success: boolean; synced: number; message: string }> => {
  return {
    success: true,
    synced: 0,
    message: '⚠️ Sincronización no disponible. Supabase y Google Sheets han sido removidos del sistema.'
  };
};
