
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '../types';
import { loadEventsFromGoogleSheets, saveEventToGoogleSheets, testGoogleSheetsConnection, getSpreadsheetInfo, testRangeAccess } from './googleSheets';

const EVENTS_KEY = 'abrakadabra_events';

// Load events from AsyncStorage only (for backup)
const loadEventsFromLocalStorage = async (): Promise<Event[]> => {
  try {
    const stored = await AsyncStorage.getItem(EVENTS_KEY);
    if (stored) {
      const events = JSON.parse(stored);
      console.log('📱 Events loaded from AsyncStorage:', events.length);
      return events;
    }
    return [];
  } catch (error) {
    console.error('❌ Error loading events from AsyncStorage:', error);
    return [];
  }
};

// Save events to AsyncStorage
const saveEventsToLocalStorage = async (events: Event[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    console.log('📱 Events saved to AsyncStorage successfully:', events.length);
  } catch (error) {
    console.error('❌ Error saving events to AsyncStorage:', error);
  }
};

// Comprehensive Google Sheets diagnostics
export const runGoogleSheetsDiagnostics = async (): Promise<void> => {
  console.log('🔍 Running comprehensive Google Sheets diagnostics...');
  
  try {
    // Test 1: Basic connection
    console.log('\n📋 Test 1: Basic Connection');
    const connectionOk = await testGoogleSheetsConnection();
    console.log('Connection result:', connectionOk ? '✅ PASS' : '❌ FAIL');
    
    if (!connectionOk) {
      console.log('❌ Basic connection failed. Check API key and spreadsheet ID.');
      return;
    }
    
    // Test 2: Spreadsheet info
    console.log('\n📋 Test 2: Spreadsheet Metadata');
    const spreadsheetInfo = await getSpreadsheetInfo();
    if (spreadsheetInfo) {
      console.log('✅ Spreadsheet metadata retrieved successfully');
      console.log('📊 Available sheets:', spreadsheetInfo.sheets?.map((s: any) => s.properties?.title));
    } else {
      console.log('❌ Failed to get spreadsheet metadata');
    }
    
    // Test 3: Range access
    console.log('\n📋 Test 3: Range Access');
    const rangeOk = await testRangeAccess();
    console.log('Range access result:', rangeOk ? '✅ PASS' : '❌ FAIL');
    
    // Test 4: Data loading
    console.log('\n📋 Test 4: Data Loading');
    const events = await loadEventsFromGoogleSheets();
    console.log('Data loading result:', events.length > 0 ? '✅ PASS' : '⚠️ NO DATA');
    console.log('Events found:', events.length);
    
    console.log('\n🏁 Diagnostics complete');
    
  } catch (error) {
    console.error('❌ Diagnostics failed:', error);
  }
};

// Primary load function - tries Google Sheets first, falls back to AsyncStorage
export const loadEvents = async (): Promise<Event[]> => {
  try {
    console.log('🔄 Loading events...');
    
    // Run diagnostics if we're having issues
    console.log('🧪 Testing Google Sheets connection...');
    const connectionOk = await testGoogleSheetsConnection();
    
    let events: Event[] = [];
    
    if (connectionOk) {
      console.log('✅ Google Sheets connection OK, testing range access...');
      const rangeOk = await testRangeAccess();
      
      if (rangeOk) {
        console.log('✅ Range access OK, loading events...');
        events = await loadEventsFromGoogleSheets();
        
        if (events.length > 0) {
          console.log('✅ Events loaded from Google Sheets, caching locally...');
          // Save to AsyncStorage as cache if we got data from Google Sheets
          await saveEventsToLocalStorage(events);
        } else {
          console.log('📭 No events from Google Sheets, trying local cache...');
          events = await loadEventsFromLocalStorage();
        }
      } else {
        console.log('❌ Range access failed, using local cache...');
        console.log('💡 This might be due to incorrect sheet name or range format');
        events = await loadEventsFromLocalStorage();
      }
    } else {
      console.log('❌ Google Sheets connection failed, using local cache...');
      console.log('💡 Check API key, spreadsheet ID, and permissions');
      events = await loadEventsFromLocalStorage();
    }
    
    console.log('✅ Events loaded successfully:', events.length);
    console.log('📋 Loaded events summary:', events.map((e: Event) => ({ 
      id: e.id, 
      date: e.date, 
      customerName: e.customerName,
      packageType: e.packageType 
    })));
    
    return events;
  } catch (error) {
    console.error('❌ Error loading events:', error);
    // Fallback to AsyncStorage if everything fails
    console.log('📱 Falling back to local storage...');
    return await loadEventsFromLocalStorage();
  }
};

// Check if a date already has events
export const checkDateAvailability = async (date: string): Promise<{ isAvailable: boolean; existingEvents: Event[] }> => {
  try {
    const events = await loadEvents();
    const existingEvents = events.filter(event => event.date === date);
    
    console.log(`📅 Date ${date} availability check:`, {
      isAvailable: existingEvents.length === 0,
      existingEventsCount: existingEvents.length
    });
    
    return {
      isAvailable: existingEvents.length === 0,
      existingEvents
    };
  } catch (error) {
    console.error('❌ Error checking date availability:', error);
    return { isAvailable: true, existingEvents: [] };
  }
};

// Hybrid storage: Use Google Sheets as primary, AsyncStorage as backup/cache
export const saveEvents = async (events: Event[]): Promise<void> => {
  try {
    console.log('💾 Saving events...', events.length);
    
    // Save to AsyncStorage immediately for offline access
    await saveEventsToLocalStorage(events);
    
    console.log('✅ Events saved successfully:', events.length);
  } catch (error) {
    console.error('❌ Error saving events:', error);
  }
};

export const generateEventId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Save a single event (used when creating new events)
export const saveEvent = async (event: Event): Promise<void> => {
  try {
    console.log('💾 Saving single event:', event);
    
    // Check if date already has events (additional safety check)
    const { existingEvents } = await checkDateAvailability(event.date);
    if (existingEvents.length > 0) {
      console.warn('⚠️ Warning: Saving event to date that already has events:', existingEvents.length);
      // Don't throw error, just warn - allow multiple events per day if needed
    }
    
    // First, try to save to Google Sheets
    console.log('🌐 Attempting to save to Google Sheets...');
    
    // Run quick diagnostics before saving
    const connectionOk = await testGoogleSheetsConnection();
    if (!connectionOk) {
      console.log('❌ Google Sheets connection failed, saving locally only');
    } else {
      const rangeOk = await testRangeAccess();
      if (!rangeOk) {
        console.log('❌ Range access failed, saving locally only');
      } else {
        const savedToSheets = await saveEventToGoogleSheets(event);
        if (savedToSheets) {
          console.log('✅ Event saved to Google Sheets successfully');
        } else {
          console.log('❌ Failed to save to Google Sheets, will save locally only');
        }
      }
    }
    
    // Load existing events from local storage
    const existingLocalEvents = await loadEventsFromLocalStorage();
    
    // Add or update the event in local storage
    const eventIndex = existingLocalEvents.findIndex(e => e.id === event.id);
    if (eventIndex >= 0) {
      existingLocalEvents[eventIndex] = event;
      console.log('📱 Updated existing event in local storage');
    } else {
      existingLocalEvents.push(event);
      console.log('📱 Added new event to local storage');
    }
    
    // Save all events to local storage
    await saveEventsToLocalStorage(existingLocalEvents);
    
    console.log('✅ Single event saved successfully to local storage');
  } catch (error) {
    console.error('❌ Error saving single event:', error);
    
    // Still try to save locally even if Google Sheets fails
    try {
      const existingLocalEvents = await loadEventsFromLocalStorage();
      const eventIndex = existingLocalEvents.findIndex(e => e.id === event.id);
      if (eventIndex >= 0) {
        existingLocalEvents[eventIndex] = event;
      } else {
        existingLocalEvents.push(event);
      }
      await saveEventsToLocalStorage(existingLocalEvents);
      console.log('📱 Event saved to local storage as fallback');
    } catch (localError) {
      console.error('❌ Failed to save to local storage as well:', localError);
      throw localError; // Only throw if both Google Sheets and local storage fail
    }
  }
};

// Update an existing event
export const updateEvent = async (event: Event): Promise<void> => {
  try {
    console.log('🔄 Updating event:', event);
    
    // Load existing events
    const existingEvents = await loadEventsFromLocalStorage();
    
    // Find and update the event
    const eventIndex = existingEvents.findIndex(e => e.id === event.id);
    if (eventIndex >= 0) {
      existingEvents[eventIndex] = event;
      await saveEventsToLocalStorage(existingEvents);
      console.log('✅ Event updated successfully');
    } else {
      console.error('❌ Event not found for update:', event.id);
      throw new Error('Event not found');
    }
  } catch (error) {
    console.error('❌ Error updating event:', error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting event:', eventId);
    
    // Load existing events
    const existingEvents = await loadEventsFromLocalStorage();
    
    // Filter out the event to delete
    const filteredEvents = existingEvents.filter(e => e.id !== eventId);
    
    if (filteredEvents.length === existingEvents.length) {
      console.error('❌ Event not found for deletion:', eventId);
      throw new Error('Event not found');
    }
    
    // Save the filtered events
    await saveEventsToLocalStorage(filteredEvents);
    
    console.log('✅ Event deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    throw error;
  }
};
