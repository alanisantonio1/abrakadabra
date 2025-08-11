
import { loadEvents, saveEvent, generateEventId } from './storage';
import { Event } from '../types';

// Validate UUID format
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Migrate events with invalid UUIDs to proper UUID format
export const migrateInvalidUUIDs = async (): Promise<{ migrated: number; errors: string[] }> => {
  try {
    console.log('🔄 Starting UUID migration...');
    
    const events = await loadEvents();
    const errors: string[] = [];
    let migrated = 0;
    
    for (const event of events) {
      if (!isValidUUID(event.id)) {
        console.log(`⚠️ Invalid UUID found: ${event.id} for event: ${event.childName}`);
        
        try {
          // Generate new UUID
          const newId = generateEventId();
          console.log(`🆔 Generated new UUID: ${newId}`);
          
          // Create updated event with new UUID
          const updatedEvent: Event = {
            ...event,
            id: newId
          };
          
          // Save the updated event (this will add it with the new ID)
          const saveResult = await saveEvent(updatedEvent);
          
          if (saveResult.success) {
            migrated++;
            console.log(`✅ Migrated event ${event.childName} from ${event.id} to ${newId}`);
          } else {
            errors.push(`Failed to migrate event ${event.childName}: ${saveResult.message}`);
          }
        } catch (error: any) {
          errors.push(`Error migrating event ${event.childName}: ${error.message}`);
        }
      }
    }
    
    console.log(`✅ UUID migration completed. Migrated: ${migrated}, Errors: ${errors.length}`);
    
    return { migrated, errors };
  } catch (error: any) {
    console.error('❌ Error during UUID migration:', error);
    return { migrated: 0, errors: [error.message] };
  }
};

// Check if any events need UUID migration
export const checkForInvalidUUIDs = async (): Promise<{ needsMigration: boolean; invalidCount: number; events: Event[] }> => {
  try {
    console.log('🔍 Checking for invalid UUIDs...');
    
    const events = await loadEvents();
    const invalidEvents = events.filter(event => !isValidUUID(event.id));
    
    console.log(`📊 Found ${invalidEvents.length} events with invalid UUIDs out of ${events.length} total events`);
    
    return {
      needsMigration: invalidEvents.length > 0,
      invalidCount: invalidEvents.length,
      events: invalidEvents
    };
  } catch (error: any) {
    console.error('❌ Error checking for invalid UUIDs:', error);
    return { needsMigration: false, invalidCount: 0, events: [] };
  }
};

// Get UUID migration report
export const getUUIDMigrationReport = async (): Promise<string> => {
  try {
    const check = await checkForInvalidUUIDs();
    
    let report = '🔍 REPORTE DE MIGRACIÓN UUID\n\n';
    
    if (check.needsMigration) {
      report += `⚠️ MIGRACIÓN NECESARIA\n`;
      report += `Eventos con UUID inválido: ${check.invalidCount}\n\n`;
      
      report += 'Eventos que necesitan migración:\n';
      check.events.forEach((event, index) => {
        report += `${index + 1}. ${event.childName} (${event.customerName})\n`;
        report += `   ID actual: ${event.id}\n`;
        report += `   Fecha: ${event.date}\n\n`;
      });
      
      report += '🔧 RECOMENDACIÓN:\n';
      report += 'Ejecutar migración automática para corregir los UUIDs\n';
      report += 'y evitar errores en Supabase.\n';
    } else {
      report += '✅ MIGRACIÓN NO NECESARIA\n';
      report += 'Todos los eventos tienen UUIDs válidos.\n';
      report += `Total de eventos verificados: ${check.events.length}\n`;
    }
    
    return report;
  } catch (error: any) {
    return `❌ Error generando reporte: ${error.message}`;
  }
};
