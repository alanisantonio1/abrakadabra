
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '../types';
import { 
  loadEventsFromGoogleSheets, 
  saveEventToGoogleSheets,
  updateEventInGoogleSheets,
  deleteEventFromGoogleSheets,
  runGoogleSheetsDiagnostics as runGSDiagnostics
} from './googleSheets';
import { getConfigurationStatus } from './serviceAccountConfig';

const EVENTS_KEY = 'abrakadabra_events';

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
    let googleSheetsEvents: Event[] = [];
    try {
      googleSheetsEvents = await loadEventsFromGoogleSheets();
      console.log('📊 Google Sheets events:', googleSheetsEvents.length);
    } catch (error) {
      console.warn('⚠️ Failed to load from Google Sheets:', error);
    }
    
    // Load from local storage as backup
    const localEvents = await loadEventsFromLocalStorage();
    console.log('📱 Local storage events:', localEvents.length);
    
    // If we have Google Sheets events, use those and update local storage
    if (googleSheetsEvents.length > 0) {
      await saveEventsToLocalStorage(googleSheetsEvents);
      console.log('✅ Using Google Sheets events and updated local storage');
      return googleSheetsEvents;
    }
    
    // Otherwise, use local storage events
    console.log('✅ Using local storage events');
    return localEvents;
  } catch (error) {
    console.error('❌ Error loading events:', error);
    // Fallback to local storage
    return await loadEventsFromLocalStorage();
  }
};

// Save event to both Google Sheets and local storage
export const saveEvent = async (event: Event): Promise<{ 
  googleSheets: boolean; 
  localStorage: boolean; 
  message: string 
}> => {
  try {
    console.log('💾 Saving event to all storage systems:', event.id);
    
    let googleSheetsSuccess = false;
    let googleSheetsError = '';
    
    // Try to save to Google Sheets
    try {
      const result = await saveEventToGoogleSheets(event);
      googleSheetsSuccess = result.success;
      if (!result.success) {
        googleSheetsError = result.error || 'Error desconocido';
        console.warn('⚠️ Google Sheets save failed:', googleSheetsError);
      } else {
        console.log('✅ Event saved to Google Sheets successfully');
      }
    } catch (error) {
      console.error('❌ Error saving to Google Sheets:', error);
      googleSheetsError = `Error de conexión: ${error}`;
    }
    
    // Always save to local storage as backup
    let localStorageSuccess = false;
    try {
      const existingEvents = await loadEventsFromLocalStorage();
      const updatedEvents = [...existingEvents, event];
      await saveEventsToLocalStorage(updatedEvents);
      localStorageSuccess = true;
      console.log('✅ Event saved to local storage successfully');
    } catch (error) {
      console.error('❌ Error saving to local storage:', error);
    }
    
    // Generate appropriate message
    let message = '';
    if (googleSheetsSuccess && localStorageSuccess) {
      message = '✅ Evento guardado exitosamente en Google Sheets y localmente';
    } else if (googleSheetsSuccess) {
      message = '✅ Evento guardado en Google Sheets (error en almacenamiento local)';
    } else if (localStorageSuccess) {
      const configStatus = getConfigurationStatus();
      if (!configStatus.configured) {
        message = '⚠️ Evento guardado localmente. Cuenta de servicio no configurada para Google Sheets.';
      } else {
        message = `⚠️ Evento guardado localmente. Error en Google Sheets: ${googleSheetsError}`;
      }
    } else {
      message = '❌ Error guardando evento en todos los sistemas';
    }
    
    return {
      googleSheets: googleSheetsSuccess,
      localStorage: localStorageSuccess,
      message
    };
  } catch (error) {
    console.error('❌ Error in saveEvent:', error);
    return {
      googleSheets: false,
      localStorage: false,
      message: `❌ Error crítico: ${error}`
    };
  }
};

// Update event in both Google Sheets and local storage
export const updateEvent = async (updatedEvent: Event): Promise<void> => {
  try {
    console.log('🔄 Updating event in all storage systems:', updatedEvent.id);
    
    // Try to update in Google Sheets
    try {
      const result = await updateEventInGoogleSheets(updatedEvent);
      if (result.success) {
        console.log('✅ Event updated in Google Sheets successfully');
      } else {
        console.warn('⚠️ Google Sheets update failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Error updating in Google Sheets:', error);
    }
    
    // Update in local storage
    try {
      const existingEvents = await loadEventsFromLocalStorage();
      const eventIndex = existingEvents.findIndex(e => e.id === updatedEvent.id);
      
      if (eventIndex !== -1) {
        existingEvents[eventIndex] = updatedEvent;
        await saveEventsToLocalStorage(existingEvents);
        console.log('✅ Event updated in local storage successfully');
      } else {
        console.warn('⚠️ Event not found in local storage, adding as new');
        existingEvents.push(updatedEvent);
        await saveEventsToLocalStorage(existingEvents);
      }
    } catch (error) {
      console.error('❌ Error updating in local storage:', error);
    }
  } catch (error) {
    console.error('❌ Error in updateEvent:', error);
    throw error;
  }
};

// Delete event from both Google Sheets and local storage
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting event from all storage systems:', eventId);
    
    // Load the event to get its details for Google Sheets deletion
    const events = await loadEventsFromLocalStorage();
    const eventToDelete = events.find(e => e.id === eventId);
    
    if (!eventToDelete) {
      console.warn('⚠️ Event not found for deletion:', eventId);
      return;
    }
    
    // Try to delete from Google Sheets
    try {
      const result = await deleteEventFromGoogleSheets(eventToDelete);
      if (result.success) {
        console.log('✅ Event deleted from Google Sheets successfully');
      } else {
        console.warn('⚠️ Google Sheets deletion failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Error deleting from Google Sheets:', error);
    }
    
    // Delete from local storage
    try {
      const updatedEvents = events.filter(e => e.id !== eventId);
      await saveEventsToLocalStorage(updatedEvents);
      console.log('✅ Event deleted from local storage successfully');
    } catch (error) {
      console.error('❌ Error deleting from local storage:', error);
    }
  } catch (error) {
    console.error('❌ Error in deleteEvent:', error);
    throw error;
  }
};

// Test database connections
export const testDatabaseConnections = async (): Promise<string> => {
  try {
    console.log('🧪 Testing all database connections...');
    
    let report = '🔍 PRUEBA DE CONEXIONES\n\n';
    
    // Test Google Sheets
    report += '📊 GOOGLE SHEETS:\n';
    const googleSheetsReport = await runGSDiagnostics();
    report += googleSheetsReport;
    
    // Test local storage
    report += '\n\n📱 ALMACENAMIENTO LOCAL:\n';
    try {
      const localEvents = await loadEventsFromLocalStorage();
      report += `✅ Almacenamiento local funcionando\n`;
      report += `📊 Eventos en almacenamiento local: ${localEvents.length}\n`;
      
      // Test write to local storage
      const testEvent: Event = {
        id: 'test_local_' + Date.now(),
        date: '2024-12-31',
        time: '15:00',
        customerName: 'Test Local',
        customerPhone: '+52 55 0000 0000',
        childName: 'Test Niño Local',
        packageType: 'Abra',
        totalAmount: 1000,
        deposit: 500,
        remainingAmount: 500,
        isPaid: false,
        notes: 'Prueba de almacenamiento local',
        createdAt: new Date().toISOString()
      };
      
      await saveEventsToLocalStorage([...localEvents, testEvent]);
      report += `✅ Escritura en almacenamiento local: OK\n`;
      
      // Clean up test event
      await saveEventsToLocalStorage(localEvents);
      report += `✅ Limpieza de prueba: OK\n`;
    } catch (error) {
      report += `❌ Error en almacenamiento local: ${error}\n`;
    }
    
    // Service account status
    report += '\n\n🔐 CUENTA DE SERVICIO:\n';
    const configStatus = getConfigurationStatus();
    report += `Configurada: ${configStatus.configured ? '✅ SÍ' : '❌ NO'}\n`;
    report += `Email: ${configStatus.serviceAccountEmail}\n`;
    report += `Client ID: ${configStatus.clientId}\n`;
    
    if (!configStatus.configured) {
      report += `Campos faltantes: ${configStatus.missingFields.join(', ')}\n`;
    }
    
    report += '\n✅ Prueba de conexiones completada';
    
    return report;
  } catch (error) {
    return `❌ Error en prueba de conexiones: ${error}`;
  }
};

// Run Google Sheets diagnostics
export const runGoogleSheetsDiagnostics = async (): Promise<string> => {
  return await runGSDiagnostics();
};
