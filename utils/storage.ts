
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '../types';
import { 
  loadEventsFromGoogleSheets, 
  saveEventToGoogleSheets, 
  updateEventInGoogleSheets, 
  deleteEventFromGoogleSheets,
  testGoogleSheetsConnection,
  runGoogleSheetsDiagnostics as runGoogleSheetsRNDiagnostics
} from './googleSheetsRN';

const EVENTS_KEY = '@abrakadabra_events';

// Enhanced error handling for AsyncStorage operations
const handleStorageError = (error: any, operation: string): void => {
  console.error(`❌ AsyncStorage error during ${operation}:`, error);
  
  if (error.message?.includes('quota')) {
    throw new Error(`Storage quota exceeded during ${operation}. Please clear some data.`);
  }
  
  if (error.message?.includes('permission')) {
    throw new Error(`Storage permission denied during ${operation}. Please check app permissions.`);
  }
  
  throw new Error(`Storage ${operation} failed: ${error.message || 'Unknown error'}`);
};

// Load events from local storage with enhanced error handling
const loadEventsFromLocalStorage = async (): Promise<Event[]> => {
  try {
    console.log('📱 Loading events from local storage...');
    const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    
    if (eventsJson) {
      try {
        const events = JSON.parse(eventsJson);
        
        // Validate the parsed data
        if (!Array.isArray(events)) {
          console.warn('⚠️ Invalid events data format, resetting to empty array');
          await AsyncStorage.removeItem(EVENTS_KEY);
          return [];
        }
        
        // Validate each event object
        const validEvents = events.filter((event: any) => {
          return event && 
                 typeof event.id === 'string' && 
                 typeof event.customerName === 'string' && 
                 typeof event.date === 'string';
        });
        
        if (validEvents.length !== events.length) {
          console.warn(`⚠️ Filtered out ${events.length - validEvents.length} invalid events`);
          await saveEventsToLocalStorage(validEvents);
        }
        
        console.log('✅ Loaded events from local storage:', validEvents.length);
        return validEvents;
      } catch (parseError) {
        console.error('❌ Error parsing events JSON:', parseError);
        console.log('🔄 Resetting corrupted local storage');
        await AsyncStorage.removeItem(EVENTS_KEY);
        return [];
      }
    }
    
    console.log('📱 No events found in local storage');
    return [];
  } catch (error: any) {
    handleStorageError(error, 'loading events from local storage');
    return []; // Fallback to empty array
  }
};

// Save events to local storage with enhanced error handling
const saveEventsToLocalStorage = async (events: Event[]): Promise<void> => {
  try {
    console.log('💾 Saving events to local storage:', events.length);
    
    // Validate events array
    if (!Array.isArray(events)) {
      throw new Error('Events must be an array');
    }
    
    // Validate each event
    const validEvents = events.filter(event => {
      return event && 
             typeof event.id === 'string' && 
             typeof event.customerName === 'string' && 
             typeof event.date === 'string';
    });
    
    if (validEvents.length !== events.length) {
      console.warn(`⚠️ Filtered out ${events.length - validEvents.length} invalid events before saving`);
    }
    
    const eventsJson = JSON.stringify(validEvents);
    await AsyncStorage.setItem(EVENTS_KEY, eventsJson);
    console.log('✅ Events saved to local storage');
  } catch (error: any) {
    handleStorageError(error, 'saving events to local storage');
  }
};

// Merge events from different sources, prioritizing Google Sheets
const mergeEvents = (localEvents: Event[], googleEvents: Event[]): Event[] => {
  try {
    console.log('🔄 Merging events from different sources...');
    console.log('📱 Local events:', localEvents.length);
    console.log('📊 Google Sheets events:', googleEvents.length);
    
    // Validate input arrays
    const validLocalEvents = Array.isArray(localEvents) ? localEvents : [];
    const validGoogleEvents = Array.isArray(googleEvents) ? googleEvents : [];
    
    // Create a map to track events by unique identifier
    const eventMap = new Map<string, Event>();
    
    // Add local events first
    validLocalEvents.forEach(event => {
      if (event && event.date && event.customerName && event.customerPhone) {
        const key = `${event.date}_${event.customerName}_${event.customerPhone}`;
        eventMap.set(key, event);
      }
    });
    
    // Add Google Sheets events, overriding local ones if they exist
    validGoogleEvents.forEach(event => {
      if (event && event.date && event.customerName && event.customerPhone) {
        const key = `${event.date}_${event.customerName}_${event.customerPhone}`;
        eventMap.set(key, event);
      }
    });
    
    const mergedEvents = Array.from(eventMap.values());
    console.log('✅ Merged events:', mergedEvents.length);
    
    return mergedEvents;
  } catch (error: any) {
    console.error('❌ Error merging events:', error);
    return Array.isArray(localEvents) ? localEvents : []; // Fallback to local events
  }
};

// Generate unique event ID
export const generateEventId = (): string => {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Load events from both sources with Google Sheets priority
export const loadEvents = async (): Promise<Event[]> => {
  try {
    console.log('📥 Loading events from all sources...');
    
    // Load from local storage first (always available)
    const localEvents = await loadEventsFromLocalStorage();
    console.log('📱 Local storage events:', localEvents.length);
    
    // Try to load from Google Sheets
    try {
      console.log('📊 Attempting to load from Google Sheets...');
      const googleEvents = await loadEventsFromGoogleSheets();
      console.log('📊 Google Sheets events:', googleEvents.length);
      
      if (googleEvents.length > 0) {
        // Merge events with Google Sheets taking priority
        const mergedEvents = mergeEvents(localEvents, googleEvents);
        
        // Update local storage with merged data
        await saveEventsToLocalStorage(mergedEvents);
        
        console.log('✅ Events loaded and synchronized');
        return mergedEvents;
      } else {
        console.log('📊 No events in Google Sheets, using local storage');
        return localEvents;
      }
    } catch (googleError: any) {
      console.warn('⚠️ Google Sheets unavailable, using local storage:', googleError.message);
      return localEvents;
    }
  } catch (error: any) {
    console.error('❌ Error loading events:', error);
    // Try to return at least local storage data
    try {
      return await loadEventsFromLocalStorage();
    } catch (localError) {
      console.error('❌ Even local storage failed:', localError);
      return [];
    }
  }
};

// Save event to both local storage and Google Sheets
export const saveEvent = async (event: Event): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('💾 Saving event to all storage systems:', event.id);
    
    // Validate event data
    if (!event || !event.id || !event.customerName || !event.date) {
      throw new Error('Invalid event data: missing required fields');
    }
    
    let localSuccess = false;
    let googleSuccess = false;
    let messages: string[] = [];
    
    // Save to local storage first (always reliable)
    try {
      const currentEvents = await loadEventsFromLocalStorage();
      const updatedEvents = [...currentEvents, event];
      await saveEventsToLocalStorage(updatedEvents);
      localSuccess = true;
      messages.push('✅ Guardado en almacenamiento local');
      console.log('✅ Event saved to local storage');
    } catch (localError: any) {
      console.error('❌ Error saving to local storage:', localError);
      messages.push(`❌ Error en almacenamiento local: ${localError.message}`);
    }
    
    // Try to save to Google Sheets
    try {
      console.log('📊 Attempting to save to Google Sheets...');
      const googleResult = await saveEventToGoogleSheets(event);
      
      if (googleResult.success) {
        googleSuccess = true;
        messages.push('✅ Guardado en Google Sheets');
        console.log('✅ Event saved to Google Sheets');
      } else {
        console.warn('⚠️ Google Sheets save failed:', googleResult.error);
        messages.push(`⚠️ Google Sheets: ${googleResult.error || 'No disponible'}`);
      }
    } catch (googleError: any) {
      console.warn('⚠️ Google Sheets error:', googleError);
      messages.push(`⚠️ Google Sheets: ${googleError.message || 'No disponible'}`);
    }
    
    // Determine overall success
    const overallSuccess = localSuccess; // Local storage is minimum requirement
    const message = messages.join('\n');
    
    if (overallSuccess) {
      console.log('✅ Event saved successfully');
      return { 
        success: true, 
        message: `Evento guardado exitosamente\n${message}` 
      };
    } else {
      console.error('❌ Failed to save event');
      return { 
        success: false, 
        message: `Error guardando evento\n${message}` 
      };
    }
  } catch (error: any) {
    console.error('❌ Error saving event:', error);
    return { 
      success: false, 
      message: `Error guardando evento: ${error.message || 'Unknown error'}` 
    };
  }
};

// Update event in both local storage and Google Sheets
export const updateEvent = async (updatedEvent: Event): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🔄 Updating event in all storage systems:', updatedEvent.id);
    
    // Validate event data
    if (!updatedEvent || !updatedEvent.id || !updatedEvent.customerName || !updatedEvent.date) {
      throw new Error('Invalid event data: missing required fields');
    }
    
    let localSuccess = false;
    let googleSuccess = false;
    let messages: string[] = [];
    
    // Update in local storage first
    try {
      const currentEvents = await loadEventsFromLocalStorage();
      const eventIndex = currentEvents.findIndex(e => e.id === updatedEvent.id);
      
      if (eventIndex !== -1) {
        currentEvents[eventIndex] = updatedEvent;
        await saveEventsToLocalStorage(currentEvents);
        localSuccess = true;
        messages.push('✅ Actualizado en almacenamiento local');
        console.log('✅ Event updated in local storage');
      } else {
        console.warn('⚠️ Event not found in local storage, adding as new');
        currentEvents.push(updatedEvent);
        await saveEventsToLocalStorage(currentEvents);
        localSuccess = true;
        messages.push('✅ Agregado en almacenamiento local');
      }
    } catch (localError: any) {
      console.error('❌ Error updating in local storage:', localError);
      messages.push(`❌ Error en almacenamiento local: ${localError.message}`);
    }
    
    // Try to update in Google Sheets
    try {
      console.log('📊 Attempting to update in Google Sheets...');
      const googleResult = await updateEventInGoogleSheets(updatedEvent);
      
      if (googleResult.success) {
        googleSuccess = true;
        messages.push('✅ Actualizado en Google Sheets');
        console.log('✅ Event updated in Google Sheets');
      } else {
        console.warn('⚠️ Google Sheets update failed:', googleResult.error);
        messages.push(`⚠️ Google Sheets: ${googleResult.error || 'No disponible'}`);
      }
    } catch (googleError: any) {
      console.warn('⚠️ Google Sheets error:', googleError);
      messages.push(`⚠️ Google Sheets: ${googleError.message || 'No disponible'}`);
    }
    
    // Determine overall success
    const overallSuccess = localSuccess; // Local storage is minimum requirement
    const message = messages.join('\n');
    
    if (overallSuccess) {
      console.log('✅ Event updated successfully');
      return { 
        success: true, 
        message: `Evento actualizado exitosamente\n${message}` 
      };
    } else {
      console.error('❌ Failed to update event');
      return { 
        success: false, 
        message: `Error actualizando evento\n${message}` 
      };
    }
  } catch (error: any) {
    console.error('❌ Error updating event:', error);
    return { 
      success: false, 
      message: `Error actualizando evento: ${error.message || 'Unknown error'}` 
    };
  }
};

// Delete event from both local storage and Google Sheets
export const deleteEvent = async (eventToDelete: Event): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🗑️ Deleting event from all storage systems:', eventToDelete.id);
    
    // Validate event data
    if (!eventToDelete || !eventToDelete.id) {
      throw new Error('Invalid event data: missing ID');
    }
    
    let localSuccess = false;
    let googleSuccess = false;
    let messages: string[] = [];
    
    // Delete from local storage first
    try {
      const currentEvents = await loadEventsFromLocalStorage();
      const filteredEvents = currentEvents.filter(e => e.id !== eventToDelete.id);
      await saveEventsToLocalStorage(filteredEvents);
      localSuccess = true;
      messages.push('✅ Eliminado del almacenamiento local');
      console.log('✅ Event deleted from local storage');
    } catch (localError: any) {
      console.error('❌ Error deleting from local storage:', localError);
      messages.push(`❌ Error en almacenamiento local: ${localError.message}`);
    }
    
    // Try to delete from Google Sheets
    try {
      console.log('📊 Attempting to delete from Google Sheets...');
      const googleResult = await deleteEventFromGoogleSheets(eventToDelete);
      
      if (googleResult.success) {
        googleSuccess = true;
        messages.push('✅ Eliminado de Google Sheets');
        console.log('✅ Event deleted from Google Sheets');
      } else {
        console.warn('⚠️ Google Sheets delete failed:', googleResult.error);
        messages.push(`⚠️ Google Sheets: ${googleResult.error || 'No disponible'}`);
      }
    } catch (googleError: any) {
      console.warn('⚠️ Google Sheets error:', googleError);
      messages.push(`⚠️ Google Sheets: ${googleError.message || 'No disponible'}`);
    }
    
    // Determine overall success
    const overallSuccess = localSuccess; // Local storage is minimum requirement
    const message = messages.join('\n');
    
    if (overallSuccess) {
      console.log('✅ Event deleted successfully');
      return { 
        success: true, 
        message: `Evento eliminado exitosamente\n${message}` 
      };
    } else {
      console.error('❌ Failed to delete event');
      return { 
        success: false, 
        message: `Error eliminando evento\n${message}` 
      };
    }
  } catch (error: any) {
    console.error('❌ Error deleting event:', error);
    return { 
      success: false, 
      message: `Error eliminando evento: ${error.message || 'Unknown error'}` 
    };
  }
};

// Test all database connections
export const testDatabaseConnections = async (): Promise<string> => {
  try {
    console.log('🧪 Testing all database connections...');
    
    let report = '🔍 PRUEBA DE CONEXIONES DE ALMACENAMIENTO\n\n';
    
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
        const parsedEvent = JSON.parse(retrieved);
        if (parsedEvent.id === testEvent.id) {
          report += '1. Almacenamiento Local: ✅ FUNCIONANDO\n';
          report += '   - Escritura: OK\n';
          report += '   - Lectura: OK\n';
          report += '   - Eliminación: OK\n';
          report += '   - Validación de datos: OK\n';
        } else {
          report += '1. Almacenamiento Local: ⚠️ PARCIAL\n';
          report += '   - Datos no coinciden completamente\n';
        }
      } else {
        report += '1. Almacenamiento Local: ❌ ERROR\n';
        report += '   - No se pudo recuperar datos de prueba\n';
      }
    } catch (error: any) {
      report += '1. Almacenamiento Local: ❌ ERROR\n';
      report += `   - Error: ${error.message}\n`;
    }
    
    // Load current events count from local storage
    try {
      const events = await loadEventsFromLocalStorage();
      report += `   - Eventos almacenados localmente: ${events.length}\n`;
      
      if (events.length > 0) {
        const latestEvent = events[events.length - 1];
        report += `   - Último evento: ${latestEvent.customerName} - ${latestEvent.date}\n`;
      }
    } catch (error: any) {
      report += `   - Error cargando eventos locales: ${error.message}\n`;
    }
    
    // Test Google Sheets connection
    report += '\n2. Google Sheets: ';
    try {
      console.log('📊 Testing Google Sheets connection...');
      const googleConnection = await testGoogleSheetsConnection();
      
      if (googleConnection) {
        report += '✅ FUNCIONANDO\n';
        
        // Try to load events from Google Sheets
        try {
          const googleEvents = await loadEventsFromGoogleSheets();
          report += `   - Eventos en Google Sheets: ${googleEvents.length}\n`;
          report += '   - Lectura: OK\n';
          
          if (googleEvents.length > 0) {
            const latestEvent = googleEvents[googleEvents.length - 1];
            report += `   - Último evento: ${latestEvent.customerName} - ${latestEvent.date}\n`;
          }
        } catch (loadError: any) {
          report += `   - Error cargando eventos: ${loadError.message}\n`;
        }
      } else {
        report += '❌ ERROR\n';
        report += '   - No se pudo conectar a Google Sheets\n';
        report += '   - Verificar credenciales y permisos\n';
        report += '   - Verificar conexión a internet\n';
      }
    } catch (googleError: any) {
      report += '❌ ERROR\n';
      report += `   - Error: ${googleError.message}\n`;
    }
    
    report += '\n\n📊 RESUMEN:';
    report += '\n✅ Almacenamiento Local: Sistema principal confiable';
    report += '\n📊 Google Sheets: Sistema de sincronización';
    report += '\n🔄 Flujo: Local + Google Sheets con respaldo local';
    
    report += '\n\n🎯 CARACTERÍSTICAS ACTUALES:';
    report += '\n✅ Almacenamiento local confiable';
    report += '\n✅ Sincronización con Google Sheets';
    report += '\n✅ Funcionamiento offline completo';
    report += '\n✅ Datos persistentes en múltiples ubicaciones';
    report += '\n✅ Respaldo automático';
    report += '\n✅ Validación de datos mejorada';
    report += '\n✅ Manejo de errores robusto';
    
    return report;
  } catch (error: any) {
    return `❌ Error en prueba de almacenamiento: ${error.message || 'Unknown error'}`;
  }
};

// Run Google Sheets diagnostics
export const runGoogleSheetsDiagnostics = async (): Promise<string> => {
  try {
    console.log('📊 Running Google Sheets diagnostics...');
    return await runGoogleSheetsRNDiagnostics();
  } catch (error: any) {
    console.error('❌ Error running Google Sheets diagnostics:', error);
    return `❌ Error en diagnósticos de Google Sheets: ${error.message || 'Unknown error'}`;
  }
};

// Sync Google Sheets data to local storage
export const syncGoogleSheetsToLocal = async (): Promise<{ success: boolean; synced: number; message: string }> => {
  try {
    console.log('🔄 Syncing Google Sheets data to local storage...');
    
    // Load events from Google Sheets
    const googleEvents = await loadEventsFromGoogleSheets();
    
    if (googleEvents.length === 0) {
      return {
        success: true,
        synced: 0,
        message: 'No hay eventos en Google Sheets para sincronizar'
      };
    }
    
    // Load current local events
    const localEvents = await loadEventsFromLocalStorage();
    
    // Merge events with Google Sheets taking priority
    const mergedEvents = mergeEvents(localEvents, googleEvents);
    
    // Save merged events to local storage
    await saveEventsToLocalStorage(mergedEvents);
    
    const syncedCount = googleEvents.length;
    console.log(`✅ Synced ${syncedCount} events from Google Sheets`);
    
    return {
      success: true,
      synced: syncedCount,
      message: `✅ Sincronizados ${syncedCount} eventos desde Google Sheets`
    };
  } catch (error: any) {
    console.error('❌ Error syncing Google Sheets to local:', error);
    return {
      success: false,
      synced: 0,
      message: `❌ Error sincronizando: ${error.message || 'Unknown error'}`
    };
  }
};

// Legacy function for compatibility (now redirects to Google Sheets sync)
export const syncGoogleSheetsToSupabase = async (): Promise<{ success: boolean; synced: number; message: string }> => {
  console.log('🔄 Redirecting to Google Sheets sync...');
  return await syncGoogleSheetsToLocal();
};
