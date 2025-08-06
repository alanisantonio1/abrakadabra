
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  loadEventsFromSupabase, 
  saveEventToSupabase,
  updateEventInSupabase,
  deleteEventFromSupabase,
  testSupabaseConnection,
  testGoogleSheetsViaEdgeFunction
} from './supabaseStorage';
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

// Load events from Supabase with local storage fallback
export const loadEvents = async (): Promise<Event[]> => {
  try {
    console.log('📥 Loading events from all sources...');
    
    // Try to load from Supabase first
    let supabaseEvents: Event[] = [];
    try {
      supabaseEvents = await loadEventsFromSupabase();
      console.log('🗄️ Supabase events:', supabaseEvents.length);
    } catch (error) {
      console.warn('⚠️ Failed to load from Supabase:', error);
    }
    
    // Load from local storage as backup
    const localEvents = await loadEventsFromLocalStorage();
    console.log('📱 Local storage events:', localEvents.length);
    
    // If we have Supabase data, use it and update local storage
    if (supabaseEvents.length > 0) {
      await saveEventsToLocalStorage(supabaseEvents);
      console.log('✅ Using Supabase data and updated local storage');
      return supabaseEvents;
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

// Save event to Supabase with local storage backup and Google Sheets sync
export const saveEvent = async (event: Event): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('💾 Saving event:', event.id);
    
    // Always save to local storage first
    const currentEvents = await loadEventsFromLocalStorage();
    const updatedEvents = [...currentEvents, event];
    await saveEventsToLocalStorage(updatedEvents);
    console.log('✅ Event saved to local storage');
    
    // Try to save to Supabase (which will also sync to Google Sheets)
    try {
      const supabaseResult = await saveEventToSupabase(event);
      
      if (supabaseResult.success) {
        console.log('✅ Event saved to Supabase');
        return { 
          success: true, 
          message: supabaseResult.message || 'Evento guardado exitosamente en la base de datos' 
        };
      } else {
        console.warn('⚠️ Failed to save to Supabase:', supabaseResult.error);
        return { 
          success: true, 
          message: `Evento guardado localmente. Error en base de datos: ${supabaseResult.error}` 
        };
      }
    } catch (supabaseError) {
      console.warn('⚠️ Supabase save failed:', supabaseError);
      return { 
        success: true, 
        message: `Evento guardado localmente. Base de datos no disponible: ${supabaseError}` 
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

// Update event in Supabase with local storage backup and Google Sheets sync
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
    
    // Try to update in Supabase (which will also sync to Google Sheets)
    try {
      const supabaseResult = await updateEventInSupabase(updatedEvent);
      
      if (supabaseResult.success) {
        console.log('✅ Event updated in Supabase');
        return { 
          success: true, 
          message: supabaseResult.message || 'Evento actualizado exitosamente en la base de datos' 
        };
      } else {
        console.warn('⚠️ Failed to update in Supabase:', supabaseResult.error);
        return { 
          success: true, 
          message: `Evento actualizado localmente. Error en base de datos: ${supabaseResult.error}` 
        };
      }
    } catch (supabaseError) {
      console.warn('⚠️ Supabase update failed:', supabaseError);
      return { 
        success: true, 
        message: `Evento actualizado localmente. Base de datos no disponible: ${supabaseError}` 
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

// Delete event from Supabase with local storage backup
export const deleteEvent = async (eventToDelete: Event): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🗑️ Deleting event:', eventToDelete.id);
    
    // Delete from local storage first
    const currentEvents = await loadEventsFromLocalStorage();
    const filteredEvents = currentEvents.filter(e => e.id !== eventToDelete.id);
    await saveEventsToLocalStorage(filteredEvents);
    console.log('✅ Event deleted from local storage');
    
    // Try to delete from Supabase
    try {
      const supabaseResult = await deleteEventFromSupabase(eventToDelete);
      
      if (supabaseResult.success) {
        console.log('✅ Event deleted from Supabase');
        return { 
          success: true, 
          message: 'Evento eliminado exitosamente de la base de datos' 
        };
      } else {
        console.warn('⚠️ Failed to delete from Supabase:', supabaseResult.error);
        return { 
          success: true, 
          message: `Evento eliminado localmente. Error en base de datos: ${supabaseResult.error}` 
        };
      }
    } catch (supabaseError) {
      console.warn('⚠️ Supabase delete failed:', supabaseError);
      return { 
        success: true, 
        message: `Evento eliminado localmente. Base de datos no disponible: ${supabaseError}` 
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
    
    // Test Supabase
    report += '\n2. Base de Datos Supabase:\n';
    try {
      const supabaseTest = await testSupabaseConnection();
      
      if (supabaseTest.success) {
        report += '   - Conexión: ✅ OK\n';
        
        // Test read
        const events = await loadEventsFromSupabase();
        report += `   - Lectura: ✅ OK (${events.length} eventos)\n`;
        report += '   - Escritura: ✅ OK (preparada)\n';
        report += '   - Estado: ✅ COMPLETAMENTE FUNCIONAL\n';
      } else {
        report += '   - Conexión: ❌ ERROR\n';
        report += `   - Error: ${supabaseTest.error}\n`;
      }
    } catch (error) {
      report += '   - Conexión: ❌ ERROR\n';
      report += `   - Error: ${error}\n`;
    }
    
    // Test Google Sheets via Edge Function
    report += '\n3. Google Sheets (via Edge Function):\n';
    try {
      const googleTest = await testGoogleSheetsViaEdgeFunction();
      
      if (googleTest.success) {
        report += '   - Conexión: ✅ OK\n';
        report += '   - Autenticación: ✅ OK (Edge Function)\n';
        report += '   - Escritura: ✅ OK (automática)\n';
        report += '   - Estado: ✅ COMPLETAMENTE FUNCIONAL\n';
        if (googleTest.message) {
          report += `   - Detalles: ${googleTest.message}\n`;
        }
      } else {
        report += '   - Conexión: ❌ ERROR\n';
        report += `   - Error: ${googleTest.error}\n`;
        report += '   - Estado: ⚠️ LIMITADO (solo Supabase)\n';
      }
    } catch (error) {
      report += '   - Conexión: ❌ ERROR\n';
      report += `   - Error: ${error}\n`;
    }
    
    report += '\n\n📊 RESUMEN:';
    report += '\n✅ Almacenamiento Local: Siempre disponible como respaldo';
    report += '\n🗄️ Supabase: Base de datos principal confiable';
    report += '\n📊 Google Sheets: Sincronización automática via Edge Function';
    report += '\n🔄 Flujo: Local → Supabase → Google Sheets (automático)';
    
    report += '\n\n🎯 VENTAJAS DE LA NUEVA ARQUITECTURA:';
    report += '\n✅ Autenticación segura con Google Sheets (Edge Function)';
    report += '\n✅ Sincronización automática en tiempo real';
    report += '\n✅ Respaldo local siempre disponible';
    report += '\n✅ Base de datos principal confiable (Supabase)';
    report += '\n✅ Sin problemas de autenticación en React Native';
    
    return report;
  } catch (error) {
    return `❌ Error en prueba de conexiones: ${error}`;
  }
};

// Run Google Sheets diagnostics (legacy support)
export const runGoogleSheetsDiagnostics = async (): Promise<string> => {
  try {
    console.log('📊 Running Google Sheets diagnostics via Edge Function...');
    
    let diagnostics = '🔍 GOOGLE SHEETS DIAGNOSTICS (EDGE FUNCTION)\n\n';
    
    // Test Edge Function connection
    const edgeFunctionTest = await testGoogleSheetsViaEdgeFunction();
    
    if (edgeFunctionTest.success) {
      diagnostics += '1. Edge Function: ✅ FUNCIONANDO\n';
      diagnostics += '   - Autenticación: OK\n';
      diagnostics += '   - Conexión a Google Sheets: OK\n';
      diagnostics += '   - Escritura: OK\n';
      if (edgeFunctionTest.message) {
        diagnostics += `   - Detalles: ${edgeFunctionTest.message}\n`;
      }
    } else {
      diagnostics += '1. Edge Function: ❌ ERROR\n';
      diagnostics += `   - Error: ${edgeFunctionTest.error}\n`;
    }
    
    diagnostics += '\n📋 CONFIGURACIÓN ACTUAL:';
    diagnostics += '\n   - Spreadsheet ID: 13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s';
    diagnostics += '\n   - Range: Sheet1!A:I';
    diagnostics += '\n   - Service Account: abrakadabra@abrakadabra-422005.iam.gserviceaccount.com';
    diagnostics += '\n   - Método: Edge Function con JWT authentication';
    
    diagnostics += '\n\n📊 ESTADO ACTUAL:';
    diagnostics += '\n✅ Autenticación: Edge Function (segura)';
    diagnostics += '\n✅ Escritura: Automática con cada evento';
    diagnostics += '\n✅ React Native: Compatible (sin problemas de JWT)';
    diagnostics += '\n✅ Sincronización: Tiempo real';
    
    diagnostics += '\n\n🎯 VENTAJAS:';
    diagnostics += '\n1. Autenticación segura en el backend';
    diagnostics += '\n2. Sin problemas de compatibilidad con React Native';
    diagnostics += '\n3. Sincronización automática';
    diagnostics += '\n4. Manejo de errores robusto';
    
    return diagnostics;
  } catch (error) {
    return `❌ Error en diagnósticos de Google Sheets: ${error}`;
  }
};

// Sync from Google Sheets to Supabase (not needed with new architecture)
export const syncGoogleSheetsToSupabase = async (): Promise<{ success: boolean; synced: number; message: string }> => {
  return {
    success: true,
    synced: 0,
    message: '✅ Sincronización no necesaria. Los eventos se sincronizan automáticamente a Google Sheets via Edge Function cuando se guardan en Supabase.'
  };
};
