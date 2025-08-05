
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '../types';
import { supabase } from '../app/integrations/supabase/client';

const EVENTS_KEY = 'abrakadabra_events';

// Convert Supabase row to Event format
const supabaseRowToEvent = (row: any): Event => {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    childName: row.child_name,
    packageType: row.package_type as 'Abra' | 'Kadabra' | 'Abrakadabra',
    totalAmount: parseFloat(row.total_amount),
    deposit: parseFloat(row.deposit),
    remainingAmount: parseFloat(row.remaining_amount),
    isPaid: row.is_paid,
    notes: row.notes || '',
    createdAt: row.created_at
  };
};

// Convert Event to Supabase format
const eventToSupabaseRow = (event: Event) => {
  return {
    id: event.id,
    date: event.date,
    time: event.time,
    customer_name: event.customerName,
    customer_phone: event.customerPhone,
    child_name: event.childName,
    package_type: event.packageType,
    total_amount: event.totalAmount,
    deposit: event.deposit,
    remaining_amount: event.remainingAmount,
    is_paid: event.isPaid,
    notes: event.notes
  };
};

// Sync event to Google Sheets via Edge Function
const syncToGoogleSheets = async (event: Event): Promise<boolean> => {
  try {
    console.log('🔄 Syncing event to Google Sheets:', event.id);
    
    const { data: { url } } = await supabase.functions.invoke('sync-google-sheets', {
      body: event,
      method: 'POST'
    });
    
    console.log('✅ Successfully synced to Google Sheets');
    return true;
  } catch (error) {
    console.error('❌ Error syncing to Google Sheets:', error);
    return false;
  }
};

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

// Load events from Supabase
export const loadEvents = async (): Promise<Event[]> => {
  try {
    console.log('🔄 Loading events from Supabase...');
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) {
      console.error('❌ Error loading events from Supabase:', error);
      // Fallback to local storage
      return await loadEventsFromLocalStorage();
    }
    
    const events = data.map(supabaseRowToEvent);
    console.log('✅ Loaded events from Supabase:', events.length);
    
    // Also save to local storage as backup
    await saveEventsToLocalStorage(events);
    
    return events;
  } catch (error) {
    console.error('❌ Error loading events:', error);
    // Fallback to local storage
    return await loadEventsFromLocalStorage();
  }
};

// Save event to Supabase and sync to Google Sheets
export const saveEvent = async (event: Event): Promise<boolean> => {
  try {
    console.log('💾 Saving event to Supabase:', event);
    
    const supabaseRow = eventToSupabaseRow(event);
    
    const { error } = await supabase
      .from('events')
      .insert([supabaseRow]);
    
    if (error) {
      console.error('❌ Error saving event to Supabase:', error);
      // Fallback to local storage
      const existingEvents = await loadEventsFromLocalStorage();
      const updatedEvents = [...existingEvents, event];
      await saveEventsToLocalStorage(updatedEvents);
      return false;
    }
    
    console.log('✅ Event saved to Supabase successfully');
    
    // Sync to Google Sheets in background (don't wait for it)
    syncToGoogleSheets(event).catch(error => {
      console.warn('⚠️ Google Sheets sync failed, but event is saved in Supabase:', error);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error saving event:', error);
    return false;
  }
};

// Update event in Supabase
export const updateEvent = async (event: Event): Promise<boolean> => {
  try {
    console.log('🔄 Updating event in Supabase:', event.id);
    
    const supabaseRow = eventToSupabaseRow(event);
    
    const { error } = await supabase
      .from('events')
      .update(supabaseRow)
      .eq('id', event.id);
    
    if (error) {
      console.error('❌ Error updating event in Supabase:', error);
      return false;
    }
    
    console.log('✅ Event updated in Supabase successfully');
    
    // Sync to Google Sheets in background
    syncToGoogleSheets(event).catch(error => {
      console.warn('⚠️ Google Sheets sync failed, but event is updated in Supabase:', error);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error updating event:', error);
    return false;
  }
};

// Delete event from Supabase
export const deleteEvent = async (eventId: string): Promise<boolean> => {
  try {
    console.log('🗑️ Deleting event from Supabase:', eventId);
    
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    
    if (error) {
      console.error('❌ Error deleting event from Supabase:', error);
      return false;
    }
    
    console.log('✅ Event deleted from Supabase successfully');
    return true;
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    return false;
  }
};

// Save multiple events to Supabase
export const saveEvents = async (events: Event[]): Promise<boolean> => {
  try {
    console.log('💾 Saving multiple events to Supabase:', events.length);
    
    const supabaseRows = events.map(eventToSupabaseRow);
    
    const { error } = await supabase
      .from('events')
      .upsert(supabaseRows);
    
    if (error) {
      console.error('❌ Error saving events to Supabase:', error);
      return false;
    }
    
    console.log('✅ Events saved to Supabase successfully');
    return true;
  } catch (error) {
    console.error('❌ Error saving events:', error);
    return false;
  }
};

// Generate a unique event ID
export const generateEventId = (): string => {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Run diagnostics (simplified since we're using Supabase now)
export const runGoogleSheetsDiagnostics = async (): Promise<string> => {
  try {
    console.log('🧪 Running diagnostics...');
    
    // Test Supabase connection
    const { data, error } = await supabase
      .from('events')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      return `❌ Supabase connection failed: ${error.message}`;
    }
    
    // Test Google Sheets sync
    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('sync-google-sheets', {
        body: { action: 'test' },
        method: 'GET'
      });
      
      if (functionError) {
        return `✅ Supabase connected\n⚠️ Google Sheets sync not available: ${functionError.message}`;
      }
      
      return `✅ Supabase connected\n✅ Google Sheets sync available`;
    } catch (syncError) {
      return `✅ Supabase connected\n⚠️ Google Sheets sync not configured`;
    }
  } catch (error) {
    return `❌ Diagnostics failed: ${error}`;
  }
};
