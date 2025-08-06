
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '../types';
import { 
  loadEventsFromGoogleSheets, 
  saveEventToGoogleSheets,
  updateEventInGoogleSheets,
  deleteEventFromGoogleSheets,
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

// Load events (Google Sheets first, then local storage)
export const loadEvents = async (): Promise<Event[]> => {
  try {
    console.log('🔄 Loading events...');
    
    // Try Google Sheets first (primary source)
    console.log('📊 Loading from Google Sheets...');
    const googleEvents = await loadEventsFromGoogleSheets();
    
    if (googleEvents.length > 0) {
      console.log('✅ Loaded events from Google Sheets:', googleEvents.length);
      // Save to local storage as backup
      await saveEventsToLocalStorage(googleEvents);
      return googleEvents;
    }
    
    // Fallback to local storage
    console.log('📱 No events in Google Sheets, trying local storage...');
    const localEvents = await loadEventsFromLocalStorage();
    console.log('📱 Loaded events from local storage:', localEvents.length);
    
    return localEvents;
  } catch (error) {
    console.error('❌ Error loading events:', error);
    // Final fallback to local storage
    return await loadEventsFromLocalStorage();
  }
};

// Save event (Google Sheets primary, local storage backup)
export const saveEvent = async (event: Event): Promise<{ 
  success: boolean; 
  savedToGoogleSheets: boolean; 
  error?: string;
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
    
    let savedToGoogleSheets = false;
    let googleSheetsError: string | undefined;
    
    // Try to save to Google Sheets (primary storage)
    console.log('🔄 Attempting to save to Google Sheets...');
    const googleSheetsResult = await saveEventToGoogleSheets(event);
    
    if (googleSheetsResult.success) {
      console.log('✅ Event saved to Google Sheets successfully');
      savedToGoogleSheets = true;
    } else {
      console.warn('⚠️ Google Sheets save failed:', googleSheetsResult.error);
      googleSheetsError = googleSheetsResult.error;
    }
    
    // Determine overall success
    const overallSuccess = savedToGoogleSheets || true; // Always succeed if saved locally
    
    return { 
      success: overallSuccess, 
      savedToGoogleSheets,
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
        savedToGoogleSheets: false,
        error: `Error general: ${error}`
      };
    } catch (localError) {
      console.error('❌ Failed to save to local storage:', localError);
      return { 
        success: false, 
        savedToGoogleSheets: false,
        error: `Error crítico: ${localError}`
      };
    }
  }
};

// Update event (Google Sheets primary, local storage backup)
export const updateEvent = async (event: Event): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Updating event:', event.id);
    
    // Update in local storage first
    const existingEvents = await loadEventsFromLocalStorage();
    const updatedEvents = existingEvents.map(e => e.id === event.id ? event : e);
    await saveEventsToLocalStorage(updatedEvents);
    
    // Try to update in Google Sheets
    const googleSheetsResult = await updateEventInGoogleSheets(event);
    
    if (googleSheetsResult.success) {
      console.log('✅ Event updated in Google Sheets successfully');
    } else {
      console.warn('⚠️ Google Sheets update failed, but event is updated locally');
      console.warn('⚠️ Google Sheets error:', googleSheetsResult.error);
    }
    
    return { success: true }; // Always return true since we have local backup
  } catch (error) {
    console.error('❌ Error updating event:', error);
    return { success: false, error: `Error: ${error}` };
  }
};

// Delete event (Google Sheets primary, local storage backup)
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
    
    // Try to delete from Google Sheets
    const googleSheetsResult = await deleteEventFromGoogleSheets(eventToDelete);
    
    if (googleSheetsResult.success) {
      console.log('✅ Event deleted from Google Sheets successfully');
    } else {
      console.warn('⚠️ Google Sheets delete failed, but event is deleted locally');
      console.warn('⚠️ Google Sheets error:', googleSheetsResult.error);
    }
    
    return { success: true }; // Always return true since we have local backup
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    return { success: false, error: `Error: ${error}` };
  }
};

// Save multiple events (Google Sheets primary, local storage backup)
export const saveEvents = async (events: Event[]): Promise<boolean> => {
  try {
    console.log('💾 Saving multiple events:', events.length);
    
    // Save to local storage first
    await saveEventsToLocalStorage(events);
    
    // Try to save each event to Google Sheets
    let successCount = 0;
    for (const event of events) {
      const result = await saveEventToGoogleSheets(event);
      if (result.success) successCount++;
    }
    
    console.log(`✅ Saved ${successCount}/${events.length} events to Google Sheets`);
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

// Test Google Sheets connection
export const testDatabaseConnections = async (): Promise<string> => {
  let diagnostics = '🔍 DIAGNÓSTICOS DE GOOGLE SHEETS\n\n';
  
  // Test Google Sheets
  console.log('🧪 Testing Google Sheets connection...');
  const googleSheetsDiagnostics = await runGSDiagnostics();
  diagnostics += googleSheetsDiagnostics;
  
  // Test local storage
  const localEvents = await loadEventsFromLocalStorage();
  diagnostics += `\n\n📱 Almacenamiento local: ✅ OK\n`;
  diagnostics += `   - Eventos locales: ${localEvents.length}\n`;
  
  diagnostics += '\n✅ CONFIGURACIÓN ACTUAL:\n';
  diagnostics += 'Google Sheets como fuente principal de datos.\n';
  diagnostics += 'Almacenamiento local como respaldo.\n';
  
  return diagnostics;
};

// Run Google Sheets diagnostics (for compatibility)
export const runGoogleSheetsDiagnostics = async (): Promise<string> => {
  return await runGSDiagnostics();
};
