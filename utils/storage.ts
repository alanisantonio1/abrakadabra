
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '../types';
import { 
  loadEventsFromSupabase,
  saveEventToSupabase,
  updateEventInSupabase,
  deleteEventFromSupabase,
  testSupabaseConnection,
  syncFromGoogleSheetsToSupabase
} from './supabaseStorage';
import { 
  loadEventsFromGoogleSheets, 
  runGoogleSheetsDiagnostics as runGSDiagnostics
} from './googleSheets';

const EVENTS_KEY = 'abrakadabra_events';

// Load events from local storage
const loadEventsFromLocalStorage = async (): Promise<Event[]> => {
  try {
    const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    if (eventsJson) {
      const events = JSON.parse(eventsJson);
      console.log('📱 Loaded events from local storage:', events.length);
      return events;
    }
    return [];
  } catch (error) {
    console.error('❌ Error loading events from local storage:', error);
    return [];
  }
};

// Save events to local storage
const saveEventsToLocalStorage = async (events: Event[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    console.log('💾 Saved events to local storage:', events.length);
  } catch (error) {
    console.error('❌ Error saving events to local storage:', error);
  }
};

// Load events (Supabase first, then Google Sheets, then local storage)
export const loadEvents = async (): Promise<Event[]> => {
  try {
    console.log('🔄 Loading events...');
    
    // Try Supabase first (primary database)
    console.log('📊 Trying Supabase...');
    const supabaseEvents = await loadEventsFromSupabase();
    
    if (supabaseEvents.length > 0) {
      console.log('✅ Loaded events from Supabase:', supabaseEvents.length);
      // Save to local storage as backup
      await saveEventsToLocalStorage(supabaseEvents);
      return supabaseEvents;
    }
    
    // Try Google Sheets as secondary source
    console.log('📊 Supabase empty, trying Google Sheets...');
    const googleEvents = await loadEventsFromGoogleSheets();
    
    if (googleEvents.length > 0) {
      console.log('✅ Loaded events from Google Sheets:', googleEvents.length);
      
      // Sync to Supabase for future use
      console.log('🔄 Syncing Google Sheets events to Supabase...');
      const syncResult = await syncFromGoogleSheetsToSupabase();
      if (syncResult.success && syncResult.synced > 0) {
        console.log(`✅ Synced ${syncResult.synced} events to Supabase`);
      }
      
      // Save to local storage as backup
      await saveEventsToLocalStorage(googleEvents);
      return googleEvents;
    }
    
    // Fallback to local storage
    console.log('📱 No events in cloud sources, trying local storage...');
    const localEvents = await loadEventsFromLocalStorage();
    console.log('📱 Loaded events from local storage:', localEvents.length);
    
    return localEvents;
  } catch (error) {
    console.error('❌ Error loading events:', error);
    // Final fallback to local storage
    return await loadEventsFromLocalStorage();
  }
};

// Save event (Supabase primary, local storage backup)
export const saveEvent = async (event: Event): Promise<{ 
  success: boolean; 
  savedToSupabase: boolean;
  savedToGoogleSheets: boolean; 
  error?: string;
  supabaseError?: string;
  googleSheetsError?: string;
}> => {
  try {
    console.log('💾 Starting to save event:', event.id);
    console.log('📝 Event details:', {
      date: event.date,
      customerName: event.customerName,
      childName: event.childName,
      packageType: event.packageType,
      totalAmount: event.totalAmount,
      deposit: event.deposit
    });
    
    // Save to local storage first (immediate backup)
    const existingEvents = await loadEventsFromLocalStorage();
    const updatedEvents = [...existingEvents, event];
    await saveEventsToLocalStorage(updatedEvents);
    console.log('✅ Event saved to local storage');
    
    let savedToSupabase = false;
    let savedToGoogleSheets = false;
    let supabaseError: string | undefined;
    let googleSheetsError: string | undefined;
    
    // Try to save to Supabase (primary database)
    console.log('🔄 Attempting to save to Supabase...');
    const supabaseResult = await saveEventToSupabase(event);
    
    if (supabaseResult.success) {
      console.log('✅ Event saved to Supabase successfully');
      savedToSupabase = true;
    } else {
      console.warn('⚠️ Supabase save failed:', supabaseResult.error);
      supabaseError = supabaseResult.error;
    }
    
    // Note: Google Sheets is read-only due to API key limitations
    // We don't attempt to write to Google Sheets anymore
    console.log('ℹ️ Google Sheets is read-only, skipping write attempt');
    googleSheetsError = 'Google Sheets está en modo solo lectura (API key sin permisos de escritura)';
    
    // Determine overall success
    const overallSuccess = savedToSupabase; // Success if saved to primary database
    
    return { 
      success: overallSuccess, 
      savedToSupabase,
      savedToGoogleSheets,
      supabaseError,
      googleSheetsError
    };
  } catch (error) {
    console.error('❌ Error saving event:', error);
    
    // Try to save to local storage as final fallback
    try {
      const existingEvents = await loadEventsFromLocalStorage();
      const updatedEvents = [...existingEvents, event];
      await saveEventsToLocalStorage(updatedEvents);
      console.log('✅ Event saved to local storage as fallback');
      return { 
        success: true, 
        savedToSupabase: false,
        savedToGoogleSheets: false,
        error: `Error general: ${error}`
      };
    } catch (localError) {
      console.error('❌ Failed to save to local storage:', localError);
      return { 
        success: false, 
        savedToSupabase: false,
        savedToGoogleSheets: false,
        error: `Error crítico: ${localError}`
      };
    }
  }
};

// Update event (Supabase primary, local storage backup)
export const updateEvent = async (event: Event): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Updating event:', event.id);
    
    // Update in local storage first
    const existingEvents = await loadEventsFromLocalStorage();
    const updatedEvents = existingEvents.map(e => e.id === event.id ? event : e);
    await saveEventsToLocalStorage(updatedEvents);
    
    // Try to update in Supabase
    const supabaseResult = await updateEventInSupabase(event);
    
    if (supabaseResult.success) {
      console.log('✅ Event updated in Supabase successfully');
    } else {
      console.warn('⚠️ Supabase update failed, but event is updated locally');
      console.warn('⚠️ Supabase error:', supabaseResult.error);
    }
    
    return { success: true }; // Always return true since we have local backup
  } catch (error) {
    console.error('❌ Error updating event:', error);
    return { success: false, error: `Error: ${error}` };
  }
};

// Delete event (Supabase primary, local storage backup)
export const deleteEvent = async (eventId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🗑️ Deleting event:', eventId);
    
    // Remove from local storage first
    const existingEvents = await loadEventsFromLocalStorage();
    const eventToDelete = existingEvents.find(e => e.id === eventId);
    
    if (!eventToDelete) {
      console.warn('⚠️ Event not found in local storage');
      return { success: false, error: 'Evento no encontrado' };
    }
    
    const updatedEvents = existingEvents.filter(e => e.id !== eventId);
    await saveEventsToLocalStorage(updatedEvents);
    
    // Try to delete from Supabase
    const supabaseResult = await deleteEventFromSupabase(eventId);
    
    if (supabaseResult.success) {
      console.log('✅ Event deleted from Supabase successfully');
    } else {
      console.warn('⚠️ Supabase delete failed, but event is deleted locally');
      console.warn('⚠️ Supabase error:', supabaseResult.error);
    }
    
    return { success: true }; // Always return true since we have local backup
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    return { success: false, error: `Error: ${error}` };
  }
};

// Save multiple events (Supabase primary, local storage backup)
export const saveEvents = async (events: Event[]): Promise<boolean> => {
  try {
    console.log('💾 Saving multiple events:', events.length);
    
    // Save to local storage first
    await saveEventsToLocalStorage(events);
    
    // Try to save each event to Supabase
    let successCount = 0;
    for (const event of events) {
      const result = await saveEventToSupabase(event);
      if (result.success) successCount++;
    }
    
    console.log(`✅ Saved ${successCount}/${events.length} events to Supabase`);
    return true; // Always return true since we have local backup
  } catch (error) {
    console.error('❌ Error saving events:', error);
    return false;
  }
};

// Generate a unique event ID
export const generateEventId = (): string => {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Test database connections
export const testDatabaseConnections = async (): Promise<string> => {
  let diagnostics = '🔍 DIAGNÓSTICOS DE BASE DE DATOS\n\n';
  
  // Test Supabase
  console.log('🧪 Testing Supabase connection...');
  const supabaseTest = await testSupabaseConnection();
  diagnostics += `1. Supabase: ${supabaseTest.success ? '✅ CONECTADO' : '❌ ERROR'}\n`;
  
  if (!supabaseTest.success) {
    diagnostics += `   - Error: ${supabaseTest.error}\n`;
  } else {
    const supabaseEvents = await loadEventsFromSupabase();
    diagnostics += `   - Eventos en Supabase: ${supabaseEvents.length}\n`;
  }
  
  // Test Google Sheets (read-only)
  diagnostics += '\n2. Google Sheets (solo lectura):\n';
  const googleEvents = await loadEventsFromGoogleSheets();
  diagnostics += `   - Eventos en Google Sheets: ${googleEvents.length}\n`;
  
  // Test local storage
  const localEvents = await loadEventsFromLocalStorage();
  diagnostics += `\n3. Almacenamiento local: ✅ OK\n`;
  diagnostics += `   - Eventos locales: ${localEvents.length}\n`;
  
  // Sync status
  if (supabaseTest.success && googleEvents.length > 0) {
    diagnostics += '\n4. Sincronización disponible:\n';
    diagnostics += '   - Puedes sincronizar eventos de Google Sheets a Supabase\n';
  }
  
  diagnostics += '\n✅ RECOMENDACIÓN:\n';
  diagnostics += 'Usar Supabase como base de datos principal.\n';
  diagnostics += 'Google Sheets como fuente de datos de solo lectura.\n';
  diagnostics += 'Almacenamiento local como respaldo.\n';
  
  return diagnostics;
};

// Sync from Google Sheets to Supabase
export const syncGoogleSheetsToSupabase = async (): Promise<{ success: boolean; synced: number; error?: string }> => {
  return await syncFromGoogleSheetsToSupabase();
};

// Run Google Sheets diagnostics (for compatibility)
export const runGoogleSheetsDiagnostics = async (): Promise<string> => {
  return await runGSDiagnostics();
};
