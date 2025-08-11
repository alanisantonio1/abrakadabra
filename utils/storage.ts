
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '../types';
import { supabase } from '../app/integrations/supabase/client';

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
    notes: event.notes || null,
    anticipo_1_amount: event.anticipo1Amount || event.deposit || 0,
    anticipo_1_date: event.anticipo1Date || null,
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
    totalAmount: row.total_amount,
    deposit: row.deposit,
    remainingAmount: row.remaining_amount,
    isPaid: row.is_paid,
    notes: row.notes || '',
    createdAt: row.created_at,
    anticipo1Amount: row.anticipo_1_amount || row.deposit || 0,
    anticipo1Date: row.anticipo_1_date || '',
  };
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

// Load events from Supabase with better error handling for missing columns
const loadEventsFromSupabase = async (): Promise<Event[]> => {
  try {
    console.log('🗄️ Loading events from Supabase...');
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Supabase error loading events:', error);
      
      // Check if error is related to missing columns
      if (error.message?.includes('anticipo_1_amount') || 
          error.message?.includes('column') && error.message?.includes('does not exist')) {
        console.warn('⚠️ Anticipo column missing in Supabase. Please run the migration.');
        throw new Error('Database schema outdated. Please run the anticipo column migration.');
      }
      
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    if (!data) {
      console.log('📱 No events found in Supabase');
      return [];
    }
    
    const events = data.map(supabaseToEventFormat);
    console.log('✅ Loaded events from Supabase:', events.length);
    return events;
  } catch (error: any) {
    console.error('❌ Error loading events from Supabase:', error);
    throw error;
  }
};

// Save event to Supabase with better error handling
const saveEventToSupabase = async (event: Event): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🗄️ Saving event to Supabase:', event.id);
    
    const supabaseEvent = eventToSupabaseFormat(event);
    
    const { error } = await supabase
      .from('events')
      .insert([supabaseEvent]);
    
    if (error) {
      console.error('❌ Supabase error saving event:', error);
      
      // Check if error is related to missing columns
      if (error.message?.includes('anticipo_1_amount') || 
          error.message?.includes('column') && error.message?.includes('does not exist')) {
        return { 
          success: false, 
          error: 'Database schema outdated. Please run the anticipo column migration.' 
        };
      }
      
      return { success: false, error: error.message };
    }
    
    console.log('✅ Event saved to Supabase');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error saving event to Supabase:', error);
    return { success: false, error: error.message };
  }
};

// Update event in Supabase with better error handling
const updateEventInSupabase = async (event: Event): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🗄️ Updating event in Supabase:', event.id);
    
    const supabaseEvent = eventToSupabaseFormat(event);
    
    const { error } = await supabase
      .from('events')
      .update(supabaseEvent)
      .eq('id', event.id);
    
    if (error) {
      console.error('❌ Supabase error updating event:', error);
      
      // Check if error is related to missing columns
      if (error.message?.includes('anticipo_1_amount') || 
          error.message?.includes('column') && error.message?.includes('does not exist')) {
        return { 
          success: false, 
          error: 'Database schema outdated. Please run the anticipo column migration.' 
        };
      }
      
      return { success: false, error: error.message };
    }
    
    console.log('✅ Event updated in Supabase');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error updating event in Supabase:', error);
    return { success: false, error: error.message };
  }
};

// Delete event from Supabase
const deleteEventFromSupabase = async (event: Event): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🗄️ Deleting event from Supabase:', event.id);
    console.log('🔍 Event ID type:', typeof event.id, 'Value:', event.id);
    
    // Ensure the ID is a string and properly formatted
    const eventId = String(event.id).trim();
    
    if (!eventId) {
      console.error('❌ Invalid event ID for deletion:', event.id);
      return { success: false, error: 'Invalid event ID' };
    }
    
    // First check if the event exists
    const { data: existingEvent, error: selectError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single();
    
    if (selectError) {
      console.error('❌ Error checking if event exists:', selectError);
      if (selectError.code === 'PGRST116') {
        // Event not found
        console.warn('⚠️ Event not found in Supabase, considering as already deleted');
        return { success: true };
      }
      return { success: false, error: `Error checking event existence: ${selectError.message}` };
    }
    
    if (!existingEvent) {
      console.warn('⚠️ Event not found in Supabase, considering as already deleted');
      return { success: true };
    }
    
    // Now delete the event
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    
    if (deleteError) {
      console.error('❌ Supabase error deleting event:', deleteError);
      console.error('❌ Error code:', deleteError.code);
      console.error('❌ Error details:', deleteError.details);
      console.error('❌ Error hint:', deleteError.hint);
      
      // Check for specific error codes
      if (deleteError.code === '22P02') {
        return { 
          success: false, 
          error: `Invalid ID format for deletion. ID: ${eventId}. Please check the event ID format.` 
        };
      }
      
      return { success: false, error: `Delete failed: ${deleteError.message}` };
    }
    
    console.log('✅ Event deleted from Supabase successfully');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error deleting event from Supabase:', error);
    console.error('❌ Error stack:', error.stack);
    return { success: false, error: `Unexpected error: ${error.message}` };
  }
};

// Test Supabase connection
const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('events')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection test successful');
    return true;
  } catch (error: any) {
    console.error('❌ Supabase connection test error:', error);
    return false;
  }
};

// Merge events from different sources, prioritizing Supabase
const mergeEvents = (localEvents: Event[], supabaseEvents: Event[]): Event[] => {
  try {
    console.log('🔄 Merging events from different sources...');
    console.log('📱 Local events:', localEvents.length);
    console.log('🗄️ Supabase events:', supabaseEvents.length);
    
    // Validate input arrays
    const validLocalEvents = Array.isArray(localEvents) ? localEvents : [];
    const validSupabaseEvents = Array.isArray(supabaseEvents) ? supabaseEvents : [];
    
    // Create a map to track events by ID
    const eventMap = new Map<string, Event>();
    
    // Add local events first
    validLocalEvents.forEach(event => {
      if (event && event.id) {
        eventMap.set(event.id, event);
      }
    });
    
    // Add Supabase events, overriding local ones if they exist
    validSupabaseEvents.forEach(event => {
      if (event && event.id) {
        eventMap.set(event.id, event);
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

// Generate unique event ID in UUID format for better Supabase compatibility
export const generateEventId = (): string => {
  // Generate a UUID-like string that's compatible with Supabase
  const timestamp = Date.now().toString(16);
  const random1 = Math.random().toString(16).substr(2, 8);
  const random2 = Math.random().toString(16).substr(2, 4);
  const random3 = Math.random().toString(16).substr(2, 4);
  const random4 = Math.random().toString(16).substr(2, 4);
  const random5 = Math.random().toString(16).substr(2, 12);
  
  // Format as UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return `${timestamp.padStart(8, '0')}-${random2}-4${random3.substr(1)}-${(parseInt(random4[0], 16) & 0x3 | 0x8).toString(16)}${random4.substr(1)}-${random5}`;
};

// Load events from both sources with Supabase priority
export const loadEvents = async (): Promise<Event[]> => {
  try {
    console.log('📥 Loading events from all sources...');
    
    // Load from local storage first (always available)
    const localEvents = await loadEventsFromLocalStorage();
    console.log('📱 Local storage events:', localEvents.length);
    
    // Try to load from Supabase
    try {
      console.log('🗄️ Attempting to load from Supabase...');
      const supabaseEvents = await loadEventsFromSupabase();
      console.log('🗄️ Supabase events:', supabaseEvents.length);
      
      if (supabaseEvents.length >= 0) {
        // Merge events with Supabase taking priority
        const mergedEvents = mergeEvents(localEvents, supabaseEvents);
        
        // Update local storage with merged data
        await saveEventsToLocalStorage(mergedEvents);
        
        console.log('✅ Events loaded and synchronized');
        return mergedEvents;
      } else {
        console.log('🗄️ No events in Supabase, using local storage');
        return localEvents;
      }
    } catch (supabaseError: any) {
      console.warn('⚠️ Supabase unavailable, using local storage:', supabaseError.message);
      
      // If it's a schema error, show a more helpful message
      if (supabaseError.message?.includes('Database schema outdated')) {
        console.error('🔧 Database migration needed. Please run the anticipo column migration.');
      }
      
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

// Save event to both local storage and Supabase
export const saveEvent = async (event: Event): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('💾 Saving event to all storage systems:', event.id);
    
    // Validate event data
    if (!event || !event.id || !event.customerName || !event.date) {
      throw new Error('Invalid event data: missing required fields');
    }
    
    let localSuccess = false;
    let supabaseSuccess = false;
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
    
    // Try to save to Supabase
    try {
      console.log('🗄️ Attempting to save to Supabase...');
      const supabaseResult = await saveEventToSupabase(event);
      
      if (supabaseResult.success) {
        supabaseSuccess = true;
        messages.push('✅ Guardado en Supabase');
        console.log('✅ Event saved to Supabase');
      } else {
        console.warn('⚠️ Supabase save failed:', supabaseResult.error);
        messages.push(`⚠️ Supabase: ${supabaseResult.error || 'No disponible'}`);
        
        // If it's a schema error, add migration instruction
        if (supabaseResult.error?.includes('Database schema outdated')) {
          messages.push('🔧 Ejecute la migración de columna anticipo');
        }
      }
    } catch (supabaseError: any) {
      console.warn('⚠️ Supabase error:', supabaseError);
      messages.push(`⚠️ Supabase: ${supabaseError.message || 'No disponible'}`);
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

// Update event in both local storage and Supabase
export const updateEvent = async (updatedEvent: Event): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🔄 Updating event in all storage systems:', updatedEvent.id);
    
    // Validate event data
    if (!updatedEvent || !updatedEvent.id || !updatedEvent.customerName || !updatedEvent.date) {
      throw new Error('Invalid event data: missing required fields');
    }
    
    let localSuccess = false;
    let supabaseSuccess = false;
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
    
    // Try to update in Supabase
    try {
      console.log('🗄️ Attempting to update in Supabase...');
      const supabaseResult = await updateEventInSupabase(updatedEvent);
      
      if (supabaseResult.success) {
        supabaseSuccess = true;
        messages.push('✅ Actualizado en Supabase');
        console.log('✅ Event updated in Supabase');
      } else {
        console.warn('⚠️ Supabase update failed:', supabaseResult.error);
        messages.push(`⚠️ Supabase: ${supabaseResult.error || 'No disponible'}`);
        
        // If it's a schema error, add migration instruction
        if (supabaseResult.error?.includes('Database schema outdated')) {
          messages.push('🔧 Ejecute la migración de columna anticipo');
        }
      }
    } catch (supabaseError: any) {
      console.warn('⚠️ Supabase error:', supabaseError);
      messages.push(`⚠️ Supabase: ${supabaseError.message || 'No disponible'}`);
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

// Delete event from both local storage and Supabase
export const deleteEvent = async (eventToDelete: Event): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🗑️ Deleting event from all storage systems:', eventToDelete.id);
    
    // Validate event data
    if (!eventToDelete || !eventToDelete.id) {
      throw new Error('Invalid event data: missing ID');
    }
    
    let localSuccess = false;
    let supabaseSuccess = false;
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
    
    // Try to delete from Supabase
    try {
      console.log('🗄️ Attempting to delete from Supabase...');
      const supabaseResult = await deleteEventFromSupabase(eventToDelete);
      
      if (supabaseResult.success) {
        supabaseSuccess = true;
        messages.push('✅ Eliminado de Supabase');
        console.log('✅ Event deleted from Supabase');
      } else {
        console.warn('⚠️ Supabase delete failed:', supabaseResult.error);
        messages.push(`⚠️ Supabase: ${supabaseResult.error || 'No disponible'}`);
      }
    } catch (supabaseError: any) {
      console.warn('⚠️ Supabase error:', supabaseError);
      messages.push(`⚠️ Supabase: ${supabaseError.message || 'No disponible'}`);
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
    
    // Test Supabase connection
    report += '\n2. Supabase: ';
    try {
      console.log('🗄️ Testing Supabase connection...');
      const supabaseConnection = await testSupabaseConnection();
      
      if (supabaseConnection) {
        report += '✅ FUNCIONANDO\n';
        
        // Try to load events from Supabase
        try {
          const supabaseEvents = await loadEventsFromSupabase();
          report += `   - Eventos en Supabase: ${supabaseEvents.length}\n`;
          report += '   - Lectura: OK\n';
          
          if (supabaseEvents.length > 0) {
            const latestEvent = supabaseEvents[0]; // Already ordered by created_at desc
            report += `   - Último evento: ${latestEvent.customerName} - ${latestEvent.date}\n`;
          }
        } catch (loadError: any) {
          report += `   - Error cargando eventos: ${loadError.message}\n`;
          
          // Check if it's a schema error
          if (loadError.message?.includes('Database schema outdated')) {
            report += '   - ⚠️ MIGRACIÓN REQUERIDA: Ejecute la migración de columna anticipo\n';
          }
        }
      } else {
        report += '❌ ERROR\n';
        report += '   - No se pudo conectar a Supabase\n';
        report += '   - Verificar credenciales y permisos\n';
        report += '   - Verificar conexión a internet\n';
      }
    } catch (supabaseError: any) {
      report += '❌ ERROR\n';
      report += `   - Error: ${supabaseError.message}\n`;
    }
    
    report += '\n\n📊 RESUMEN:';
    report += '\n✅ Almacenamiento Local: Sistema principal confiable';
    report += '\n🗄️ Supabase: Base de datos en la nube';
    report += '\n🔄 Flujo: Local + Supabase con respaldo local';
    
    report += '\n\n🎯 CARACTERÍSTICAS ACTUALES:';
    report += '\n✅ Almacenamiento local confiable';
    report += '\n✅ Sincronización con Supabase';
    report += '\n✅ Funcionamiento offline completo';
    report += '\n✅ Datos persistentes en múltiples ubicaciones';
    report += '\n✅ Respaldo automático';
    report += '\n✅ Validación de datos mejorada';
    report += '\n✅ Manejo de errores robusto';
    report += '\n✅ Base de datos PostgreSQL escalable';
    report += '\n✅ Seguimiento de anticipo único';
    report += '\n✅ IDs compatibles con UUID para mejor rendimiento';
    
    report += '\n\n🔧 MIGRACIÓN REQUERIDA:';
    report += '\nSi ve errores relacionados con columna anticipo,';
    report += '\nejecute la migración SQL en el dashboard de Supabase';
    report += '\npara crear la tabla con la estructura correcta.';
    
    return report;
  } catch (error: any) {
    return `❌ Error en prueba de almacenamiento: ${error.message || 'Unknown error'}`;
  }
};

// Run Supabase diagnostics
export const runSupabaseDiagnostics = async (): Promise<string> => {
  try {
    console.log('🗄️ Running Supabase diagnostics...');
    
    let report = '🔍 DIAGNÓSTICOS DE SUPABASE\n\n';
    
    // Test connection
    const connectionTest = await testSupabaseConnection();
    report += `Conexión: ${connectionTest ? '✅ OK' : '❌ ERROR'}\n`;
    
    if (connectionTest) {
      // Test table access
      try {
        const { data, error } = await supabase
          .from('events')
          .select('count(*)')
          .limit(1);
        
        if (error) {
          report += `Acceso a tabla: ❌ ERROR - ${error.message}\n`;
        } else {
          report += 'Acceso a tabla: ✅ OK\n';
        }
      } catch (error: any) {
        report += `Acceso a tabla: ❌ ERROR - ${error.message}\n`;
      }
      
      // Test insert capability with anticipo column
      try {
        const testEvent = {
          id: `test_${Date.now()}`,
          date: '2024-12-31',
          time: '15:00',
          customer_name: 'Test Cliente',
          customer_phone: '+52 55 1234 5678',
          child_name: 'Test Niño',
          package_type: 'Abra',
          total_amount: 1000,
          deposit: 500,
          remaining_amount: 500,
          is_paid: false,
          notes: 'Test event',
          anticipo_1_amount: 500,
          anticipo_1_date: '2024-12-31',
        };
        
        const { error: insertError } = await supabase
          .from('events')
          .insert([testEvent]);
        
        if (insertError) {
          report += `Inserción: ❌ ERROR - ${insertError.message}\n`;
          
          // Check if error is related to missing columns
          if (insertError.message?.includes('anticipo_1_amount') || 
              insertError.message?.includes('column') && insertError.message?.includes('does not exist')) {
            report += '⚠️ MIGRACIÓN REQUERIDA: Columna anticipo faltante\n';
            report += 'Ejecute la migración SQL en el dashboard de Supabase\n';
          }
        } else {
          report += 'Inserción: ✅ OK\n';
          report += 'Columna anticipo: ✅ DISPONIBLE\n';
          
          // Clean up test event
          await supabase
            .from('events')
            .delete()
            .eq('id', testEvent.id);
        }
      } catch (error: any) {
        report += `Inserción: ❌ ERROR - ${error.message}\n`;
      }
    }
    
    return report;
  } catch (error: any) {
    console.error('❌ Error running Supabase diagnostics:', error);
    return `❌ Error en diagnósticos de Supabase: ${error.message || 'Unknown error'}`;
  }
};

// Sync Supabase data to local storage
export const syncSupabaseToLocal = async (): Promise<{ success: boolean; synced: number; message: string }> => {
  try {
    console.log('🔄 Syncing Supabase data to local storage...');
    
    // Load events from Supabase
    const supabaseEvents = await loadEventsFromSupabase();
    
    if (supabaseEvents.length === 0) {
      return {
        success: true,
        synced: 0,
        message: 'No hay eventos en Supabase para sincronizar'
      };
    }
    
    // Load current local events
    const localEvents = await loadEventsFromLocalStorage();
    
    // Merge events with Supabase taking priority
    const mergedEvents = mergeEvents(localEvents, supabaseEvents);
    
    // Save merged events to local storage
    await saveEventsToLocalStorage(mergedEvents);
    
    const syncedCount = supabaseEvents.length;
    console.log(`✅ Synced ${syncedCount} events from Supabase`);
    
    return {
      success: true,
      synced: syncedCount,
      message: `✅ Sincronizados ${syncedCount} eventos desde Supabase`
    };
  } catch (error: any) {
    console.error('❌ Error syncing Supabase to local:', error);
    
    let errorMessage = `❌ Error sincronizando: ${error.message || 'Unknown error'}`;
    
    // Check if it's a schema error
    if (error.message?.includes('Database schema outdated')) {
      errorMessage += '\n🔧 Ejecute la migración de columna anticipo';
    }
    
    return {
      success: false,
      synced: 0,
      message: errorMessage
    };
  }
};

// Legacy function for compatibility (now redirects to Supabase sync)
export const runGoogleSheetsDiagnostics = async (): Promise<string> => {
  console.log('🔄 Redirecting to Supabase diagnostics...');
  return await runSupabaseDiagnostics();
};

// Legacy function for compatibility (now redirects to Supabase sync)
export const syncGoogleSheetsToLocal = async (): Promise<{ success: boolean; synced: number; message: string }> => {
  console.log('🔄 Redirecting to Supabase sync...');
  return await syncSupabaseToLocal();
};
