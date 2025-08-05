
import { supabase } from '../app/integrations/supabase/client';
import { Event } from '../types';

// Convert Event to Supabase format
const eventToSupabaseFormat = (event: Event) => {
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
    notes: event.notes || ''
  };
};

// Convert Supabase format to Event
const supabaseToEventFormat = (row: any): Event => {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    childName: row.child_name,
    packageType: row.package_type,
    totalAmount: parseFloat(row.total_amount),
    deposit: parseFloat(row.deposit),
    remainingAmount: parseFloat(row.remaining_amount),
    isPaid: row.is_paid,
    notes: row.notes || '',
    createdAt: row.created_at
  };
};

// Load events from Supabase
export const loadEventsFromSupabase = async (): Promise<Event[]> => {
  try {
    console.log('📥 Loading events from Supabase...');
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) {
      console.error('❌ Error loading from Supabase:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('📊 No events found in Supabase');
      return [];
    }
    
    const events = data.map(supabaseToEventFormat);
    console.log('✅ Loaded events from Supabase:', events.length);
    return events;
  } catch (error) {
    console.error('❌ Error loading events from Supabase:', error);
    return [];
  }
};

// Save event to Supabase
export const saveEventToSupabase = async (event: Event): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('💾 Saving event to Supabase:', event.id);
    console.log('📋 Event details:', {
      date: event.date,
      customerName: event.customerName,
      childName: event.childName,
      packageType: event.packageType,
      totalAmount: event.totalAmount,
      deposit: event.deposit
    });
    
    const supabaseEvent = eventToSupabaseFormat(event);
    
    const { data, error } = await supabase
      .from('events')
      .insert([supabaseEvent])
      .select();
    
    if (error) {
      console.error('❌ Error saving to Supabase:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Event saved to Supabase successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error saving event to Supabase:', error);
    return { success: false, error: `Error de conexión: ${error}` };
  }
};

// Update event in Supabase
export const updateEventInSupabase = async (event: Event): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Updating event in Supabase:', event.id);
    
    const supabaseEvent = eventToSupabaseFormat(event);
    
    const { data, error } = await supabase
      .from('events')
      .update(supabaseEvent)
      .eq('id', event.id)
      .select();
    
    if (error) {
      console.error('❌ Error updating in Supabase:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Event updated in Supabase successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating event in Supabase:', error);
    return { success: false, error: `Error de conexión: ${error}` };
  }
};

// Delete event from Supabase
export const deleteEventFromSupabase = async (eventId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🗑️ Deleting event from Supabase:', eventId);
    
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    
    if (error) {
      console.error('❌ Error deleting from Supabase:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Event deleted from Supabase successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting event from Supabase:', error);
    return { success: false, error: `Error de conexión: ${error}` };
  }
};

// Test Supabase connection
export const testSupabaseConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('events')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Supabase connection successful');
    return { success: true };
  } catch (error) {
    console.error('❌ Error testing Supabase connection:', error);
    return { success: false, error: `Error de conexión: ${error}` };
  }
};

// Sync events from Google Sheets to Supabase (one-way sync)
export const syncFromGoogleSheetsToSupabase = async (): Promise<{ success: boolean; synced: number; error?: string }> => {
  try {
    console.log('🔄 Syncing events from Google Sheets to Supabase...');
    
    // Import here to avoid circular dependency
    const { loadEventsFromGoogleSheets } = await import('./googleSheets');
    
    // Load events from Google Sheets
    const googleEvents = await loadEventsFromGoogleSheets();
    
    if (googleEvents.length === 0) {
      console.log('📊 No events to sync from Google Sheets');
      return { success: true, synced: 0 };
    }
    
    // Load existing events from Supabase
    const supabaseEvents = await loadEventsFromSupabase();
    
    // Find events that don't exist in Supabase
    const eventsToSync = googleEvents.filter(googleEvent => {
      return !supabaseEvents.some(supabaseEvent => 
        supabaseEvent.date === googleEvent.date &&
        supabaseEvent.customerName === googleEvent.customerName &&
        supabaseEvent.customerPhone === googleEvent.customerPhone
      );
    });
    
    if (eventsToSync.length === 0) {
      console.log('✅ All Google Sheets events already exist in Supabase');
      return { success: true, synced: 0 };
    }
    
    console.log(`📥 Syncing ${eventsToSync.length} new events to Supabase...`);
    
    // Insert new events
    let syncedCount = 0;
    for (const event of eventsToSync) {
      const result = await saveEventToSupabase(event);
      if (result.success) {
        syncedCount++;
      } else {
        console.warn('⚠️ Failed to sync event:', event.customerName, result.error);
      }
    }
    
    console.log(`✅ Synced ${syncedCount}/${eventsToSync.length} events from Google Sheets to Supabase`);
    return { success: true, synced: syncedCount };
  } catch (error) {
    console.error('❌ Error syncing from Google Sheets to Supabase:', error);
    return { success: false, synced: 0, error: `Error de sincronización: ${error}` };
  }
};
