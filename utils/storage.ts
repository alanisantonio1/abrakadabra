
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  loadEventsFromGoogleSheets, 
  saveEventToGoogleSheets,
  updateEventInGoogleSheets,
  deleteEventFromGoogleSheets,
  runGoogleSheetsDiagnostics as runGSDiagnostics
} from './googleSheetsRN';
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

// Load events from both Google Sheets and local storage
export const loadEvents = async (): Promise<Event[]> => {
  try {
    console.log('📥 Loading events from all sources...');
    
    // Try to load from Google Sheets first
    let googleEvents: Event[] = [];
    try {
      googleEvents = await loadEventsFromGoogleSheets();
      console.log('📊 Google Sheets events:', googleEvents.length);
    } catch (error) {
      console.warn('⚠️ Failed to load from Google Sheets:', error);
    }
    
    // Load from local storage as backup
    const localEvents = await loadEventsFromLocalStorage();
    console.log('📱 Local storage events:', localEvents.length);
    
    // If we have Google Sheets data, use it and update local storage
    if (googleEvents.length > 0) {
      await saveEventsToLocalStorage(googleEvents);
      console.log('✅ Using Google Sheets data and updated local storage');
      return googleEvents;
    }
    
    // Otherwise, use local storage data
    console.log('📱 Using local storage data as fallback');
    return localEvents;
  } catch (error) {
    console.error('❌ Error loading events:', error);
    
    // Final fallback to local storage
    try {
      const localEvents = await loadEventsFromLocalStorage();
      console.log('📱 Final fallback to local storage:', localEvents.length);
      return localEvents;
    } catch (localError) {
      console.error('❌ Error loading from local storage:', localError);
      return [];
    }
  }
};

// Save event to both Google Sheets and local storage
export const saveEvent = async (event: Event): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('💾 Saving event:', event.id);
    
    // Always save to local storage first
    const currentEvents = await loadEventsFromLocalStorage();
    const updatedEvents = [...currentEvents, event];
    await saveEventsToLocalStorage(updatedEvents);
    console.log('✅ Event saved to local storage');
    
    // Try to save to Google Sheets
    try {
      const googleResult = await saveEventToGoogleSheets(event);
      
      if (googleResult.success) {
        console.log('✅ Event saved to Google Sheets');
        return { 
          success: true, 
          message: 'Evento guardado exitosamente en Google Sheets y almacenamiento local' 
        };
      } else {
        console.warn('⚠️ Failed to save to Google Sheets:', googleResult.error);
        return { 
          success: true, 
          message: `Evento guardado localmente. Error en Google Sheets: ${googleResult.error}` 
        };
      }
    } catch (googleError) {
      console.warn('⚠️ Google Sheets save failed:', googleError);
      return { 
        success: true, 
        message: `Evento guardado localmente. Google Sheets no disponible: ${googleError}` 
      };
    }
  } catch (error) {
    console.error('❌ Error saving event:', error);
    return { 
      success: false, 
      message: `Error guardando evento: ${error}` 
    };
  }
};

// Update event in both Google Sheets and local storage
export const updateEvent = async (updatedEvent: Event): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🔄 Updating event:', updatedEvent.id);
    
    // Update in local storage first
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
    
    // Try to update in Google Sheets
    try {
      const googleResult = await updateEventInGoogleSheets(updatedEvent);
      
      if (googleResult.success) {
        console.log('✅ Event updated in Google Sheets');
        return { 
          success: true, 
          message: 'Evento actualizado exitosamente en Google Sheets y almacenamiento local' 
        };
      } else {
        console.warn('⚠️ Failed to update in Google Sheets:', googleResult.error);
        return { 
          success: true, 
          message: `Evento actualizado localmente. Error en Google Sheets: ${googleResult.error}` 
        };
      }
    } catch (googleError) {
      console.warn('⚠️ Google Sheets update failed:', googleError);
      return { 
        success: true, 
        message: `Evento actualizado localmente. Google Sheets no disponible: ${googleError}` 
      };
    }
  } catch (error) {
    console.error('❌ Error updating event:', error);
    return { 
      success: false, 
      message: `Error actualizando evento: ${error}` 
    };
  }
};

// Delete event from both Google Sheets and local storage
export const deleteEvent = async (eventToDelete: Event): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🗑️ Deleting event:', eventToDelete.id);
    
    // Delete from local storage first
    const currentEvents = await loadEventsFromLocalStorage();
    const filteredEvents = currentEvents.filter(e => e.id !== eventToDelete.id);
    await saveEventsToLocalStorage(filteredEvents);
    console.log('✅ Event deleted from local storage');
    
    // Try to delete from Google Sheets
    try {
      const googleResult = await deleteEventFromGoogleSheets(eventToDelete);
      
      if (googleResult.success) {
        console.log('✅ Event deleted from Google Sheets');
        return { 
          success: true, 
          message: 'Evento eliminado exitosamente de Google Sheets y almacenamiento local' 
        };
      } else {
        console.warn('⚠️ Failed to delete from Google Sheets:', googleResult.error);
        return { 
          success: true, 
          message: `Evento eliminado localmente. Error en Google Sheets: ${googleResult.error}` 
        };
      }
    } catch (googleError) {
      console.warn('⚠️ Google Sheets delete failed:', googleError);
      return { 
        success: true, 
        message: `Evento eliminado localmente. Google Sheets no disponible: ${googleError}` 
      };
    }
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    return { 
      success: false, 
      message: `Error eliminando evento: ${error}` 
    };
  }
};

// Test database connections
export const testDatabaseConnections = async (): Promise<string> => {
  try {
    console.log('🧪 Testing database connections...');
    
    let report = '🔍 PRUEBA DE CONEXIONES DE BASE DE DATOS\n\n';
    
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
    
    // Test Google Sheets
    report += '\n2. Google Sheets:\n';
    const googleDiagnostics = await runGSDiagnostics();
    report += googleDiagnostics;
    
    report += '\n\n📊 RESUMEN:';
    report += '\n✅ Almacenamiento Local: Siempre disponible como respaldo';
    report += '\n⚠️ Google Sheets: Funcionalidad limitada en React Native';
    report += '\n🔄 Sincronización: Automática cuando Google Sheets esté disponible';
    
    return report;
  } catch (error) {
    return `❌ Error en prueba de conexiones: ${error}`;
  }
};

// Run Google Sheets diagnostics
export const runGoogleSheetsDiagnostics = async (): Promise<string> => {
  return await runGSDiagnostics();
};
