
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
    notes: event.notes || '',
    created_at: event.createdAt,
    updated_at: new Date().toISOString()
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

// Sync event to Google Sheets via Edge Function
const syncEventToGoogleSheets = async (event: Event): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Syncing event to Google Sheets via Edge Function...');
    
    const { data, error } = await supabase.functions.invoke('sync-google-sheets', {
      body: {
        action: 'sync-event',
        event: eventToSupabaseFormat(event)
      }
    });
    
    if (error) {
      console.error('❌ Edge Function error:', error);
      return { success: false, error: error.message };
    }
    
    if (data?.success) {
      console.log('✅ Event synced to Google Sheets successfully');
      return { success: true };
    } else {
      console.warn('⚠️ Google Sheets sync failed:', data?.error);
      return { success: false, error: data?.error || 'Unknown error' };
    }
  } catch (error) {
    console.error('❌ Error syncing to Google Sheets:', error);
    return { success: false, error: `Sync error: ${error}` };
  }
};

// Test Google Sheets connection via Edge Function
const testGoogleSheetsConnection = async (): Promise<{ success: boolean; error?: string; message?: string }> => {
  try {
    console.log('🔍 Testing Google Sheets connection via Edge Function...');
    
    const { data, error } = await supabase.functions.invoke('sync-google-sheets', {
      body: {
        action: 'test-connection'
      }
    });
    
    if (error) {
      console.error('❌ Edge Function error:', error);
      return { success: false, error: error.message };
    }
    
    if (data?.success) {
      console.log('✅ Google Sheets connection successful');
      return { 
        success: true, 
        message: `Google Sheets connection successful. Sheet: ${data.title}` 
      };
    } else {
      console.warn('⚠️ Google Sheets connection failed:', data?.error);
      return { success: false, error: data?.error || 'Connection failed' };
    }
  } catch (error) {
    console.error('❌ Error testing Google Sheets connection:', error);
    return { success: false, error: `Connection test error: ${error}` };
  }
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
      console.error('❌ Error loading events from Supabase:', error);
      return [];
    }
    
    if (!data) {
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

// Save event to Supabase with Google Sheets sync
export const saveEventToSupabase = async (event: Event): Promise<{ success: boolean; error?: string; message?: string }> => {
  try {
    console.log('💾 Saving event to Supabase:', event.id);
    
    const supabaseEvent = eventToSupabaseFormat(event);
    
    const { data, error } = await supabase
      .from('events')
      .insert([supabaseEvent])
      .select();
    
    if (error) {
      console.error('❌ Error saving event to Supabase:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    console.log('✅ Event saved to Supabase successfully');
    
    // Try to sync to Google Sheets
    try {
      const syncResult = await syncEventToGoogleSheets(event);
      
      if (syncResult.success) {
        return { 
          success: true, 
          message: 'Evento guardado en Supabase y sincronizado con Google Sheets' 
        };
      } else {
        return { 
          success: true, 
          message: `Evento guardado en Supabase. Google Sheets: ${syncResult.error}` 
        };
      }
    } catch (syncError) {
      console.warn('⚠️ Google Sheets sync failed:', syncError);
      return { 
        success: true, 
        message: `Evento guardado en Supabase. Google Sheets no disponible: ${syncError}` 
      };
    }
  } catch (error) {
    console.error('❌ Error saving event to Supabase:', error);
    return { 
      success: false, 
      error: `Error saving event: ${error}` 
    };
  }
};

// Update event in Supabase with Google Sheets sync
export const updateEventInSupabase = async (event: Event): Promise<{ success: boolean; error?: string; message?: string }> => {
  try {
    console.log('🔄 Updating event in Supabase:', event.id);
    
    const supabaseEvent = eventToSupabaseFormat(event);
    
    const { data, error } = await supabase
      .from('events')
      .update(supabaseEvent)
      .eq('id', event.id)
      .select();
    
    if (error) {
      console.error('❌ Error updating event in Supabase:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    console.log('✅ Event updated in Supabase successfully');
    
    // Try to sync to Google Sheets (for updates, we'll just add a new row)
    try {
      const syncResult = await syncEventToGoogleSheets(event);
      
      if (syncResult.success) {
        return { 
          success: true, 
          message: 'Evento actualizado en Supabase y sincronizado con Google Sheets' 
        };
      } else {
        return { 
          success: true, 
          message: `Evento actualizado en Supabase. Google Sheets: ${syncResult.error}` 
        };
      }
    } catch (syncError) {
      console.warn('⚠️ Google Sheets sync failed:', syncError);
      return { 
        success: true, 
        message: `Evento actualizado en Supabase. Google Sheets no disponible: ${syncError}` 
      };
    }
  } catch (error) {
    console.error('❌ Error updating event in Supabase:', error);
    return { 
      success: false, 
      error: `Error updating event: ${error}` 
    };
  }
};

// Delete event from Supabase
export const deleteEventFromSupabase = async (event: Event): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🗑️ Deleting event from Supabase:', event.id);
    
    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', event.id)
      .select();
    
    if (error) {
      console.error('❌ Error deleting event from Supabase:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    console.log('✅ Event deleted from Supabase successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting event from Supabase:', error);
    return { 
      success: false, 
      error: `Error deleting event: ${error}` 
    };
  }
};

// Test Supabase connection
export const testSupabaseConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('events')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    console.log('✅ Supabase connection successful');
    return { success: true };
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return { 
      success: false, 
      error: `Connection error: ${error}` 
    };
  }
};

// Test Google Sheets connection via Edge Function
export const testGoogleSheetsViaEdgeFunction = async (): Promise<{ success: boolean; error?: string; message?: string }> => {
  return await testGoogleSheetsConnection();
};

// Sync events from Google Sheets to Supabase (legacy support)
export const syncFromGoogleSheetsToSupabase = async (): Promise<{ success: boolean; synced: number; error?: string }> => {
  try {
    console.log('🔄 Legacy Google Sheets sync not needed with Edge Function approach');
    console.log('📊 All new events are automatically synced to Google Sheets via Edge Function');
    
    return { 
      success: true, 
      synced: 0,
      error: 'Legacy sync not needed - using real-time Edge Function sync' 
    };
  } catch (error) {
    console.error('❌ Error in legacy sync:', error);
    return { 
      success: false, 
      synced: 0, 
      error: `Legacy sync error: ${error}` 
    };
  }
};
