
import { supabase } from '../app/integrations/supabase/client';

/**
 * Check if the events table exists in Supabase
 */
export const checkEventsTableExists = async (): Promise<{ exists: boolean; error?: string }> => {
  try {
    console.log('🔍 Checking if events table exists...');
    
    // Try to query the table
    const { data, error } = await supabase
      .from('events')
      .select('id')
      .limit(1);
    
    if (error) {
      // Check if error is because table doesn't exist
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('❌ Events table does not exist');
        return { exists: false, error: 'Table does not exist' };
      }
      
      console.error('❌ Error checking table:', error);
      return { exists: false, error: error.message };
    }
    
    console.log('✅ Events table exists');
    return { exists: true };
  } catch (error: any) {
    console.error('❌ Error checking events table:', error);
    return { exists: false, error: error.message };
  }
};

/**
 * Get the SQL migration script to create the events table
 */
export const getCreateTableSQL = (): string => {
  return `-- Create events table for Abrakadabra Events App
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  child_name TEXT NOT NULL,
  package_type TEXT NOT NULL CHECK (package_type IN ('Abra', 'Kadabra', 'Abrakadabra')),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  deposit DECIMAL(10,2) NOT NULL DEFAULT 0,
  remaining_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Anticipo columns for tracking partial payments
  anticipo_1_amount DECIMAL(10,2) DEFAULT 0,
  anticipo_1_date TEXT,
  anticipo_2_amount DECIMAL(10,2) DEFAULT 0,
  anticipo_2_date TEXT,
  anticipo_3_amount DECIMAL(10,2) DEFAULT 0,
  anticipo_3_date TEXT
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to allow all operations (since this is an internal app)
CREATE POLICY "Allow all operations on events" ON events
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();`;
};

/**
 * Get setup instructions for the user
 */
export const getSetupInstructions = (): string => {
  return `📋 INSTRUCCIONES DE CONFIGURACIÓN DE SUPABASE

Para habilitar el almacenamiento en la nube, necesitas crear la tabla 'events' en Supabase:

🔧 PASOS:

1. Ve a tu proyecto de Supabase:
   https://supabase.com/dashboard/project/hfagsrdboeoxfdzpzgnn

2. Haz clic en "SQL Editor" en el menú lateral

3. Copia y pega el siguiente SQL en el editor:

${getCreateTableSQL()}

4. Haz clic en "Run" para ejecutar el script

5. Verifica que la tabla se creó correctamente en la sección "Table Editor"

6. Regresa a la app y presiona "Verificar Configuración"

✅ Una vez completado, todos tus eventos se guardarán automáticamente en la nube.

⚠️ IMPORTANTE: 
- Esta configuración solo necesita hacerse una vez
- Los eventos existentes en almacenamiento local se sincronizarán automáticamente
- La app seguirá funcionando sin Supabase, pero solo con almacenamiento local`;
};

/**
 * Run a comprehensive setup check
 */
export const runSetupCheck = async (): Promise<{
  isSetup: boolean;
  message: string;
  instructions?: string;
}> => {
  try {
    console.log('🔍 Running Supabase setup check...');
    
    // Check if table exists
    const tableCheck = await checkEventsTableExists();
    
    if (tableCheck.exists) {
      return {
        isSetup: true,
        message: '✅ Supabase está configurado correctamente\n\nLa tabla de eventos existe y está lista para usar.'
      };
    } else {
      return {
        isSetup: false,
        message: '⚠️ Supabase no está configurado\n\nLa tabla de eventos no existe. Necesitas ejecutar el script de migración.',
        instructions: getSetupInstructions()
      };
    }
  } catch (error: any) {
    console.error('❌ Setup check error:', error);
    return {
      isSetup: false,
      message: `❌ Error verificando configuración: ${error.message}`,
      instructions: getSetupInstructions()
    };
  }
};

/**
 * Migrate local events to Supabase after setup
 */
export const migrateLocalEventsToSupabase = async (): Promise<{
  success: boolean;
  migrated: number;
  errors: string[];
  skipped: number;
}> => {
  try {
    console.log('🔄 Starting migration of local events to Supabase...');
    
    // Import storage functions and AsyncStorage
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const { Event } = await import('../types');
    
    // Load local events directly from AsyncStorage
    const EVENTS_KEY = '@abrakadabra_events';
    const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    
    if (!eventsJson) {
      console.log('📱 No local events found');
      return {
        success: true,
        migrated: 0,
        errors: [],
        skipped: 0
      };
    }
    
    const localEvents = JSON.parse(eventsJson);
    console.log(`📱 Found ${localEvents.length} local events to migrate`);
    
    if (localEvents.length === 0) {
      return {
        success: true,
        migrated: 0,
        errors: [],
        skipped: 0
      };
    }
    
    // Check which events already exist in Supabase
    const { data: existingEvents, error: fetchError } = await supabase
      .from('events')
      .select('id');
    
    if (fetchError) {
      console.error('❌ Error fetching existing events:', fetchError);
      throw new Error(`Error fetching existing events: ${fetchError.message}`);
    }
    
    const existingIds = new Set(existingEvents?.map(e => e.id) || []);
    console.log(`🗄️ Found ${existingIds.size} existing events in Supabase`);
    
    let migrated = 0;
    let skipped = 0;
    const errors: string[] = [];
    
    // Migrate each event
    for (const event of localEvents) {
      try {
        // Skip if event already exists in Supabase
        if (existingIds.has(event.id)) {
          skipped++;
          console.log(`⏭️ Skipped (already exists): ${event.customerName} - ${event.date}`);
          continue;
        }
        
        // Convert to Supabase format
        const supabaseEvent = {
          id: String(event.id || ''),
          date: String(event.date || ''),
          time: String(event.time || ''),
          customer_name: String(event.customerName || ''),
          customer_phone: String(event.customerPhone || ''),
          child_name: String(event.childName || ''),
          package_type: event.packageType as 'Abra' | 'Kadabra' | 'Abrakadabra',
          total_amount: Number(event.totalAmount || 0),
          deposit: Number(event.deposit || 0),
          remaining_amount: Number(event.remainingAmount || 0),
          is_paid: Boolean(event.isPaid),
          notes: event.notes ? String(event.notes) : null,
          anticipo_1_amount: Number(event.anticipo1Amount || event.deposit || 0),
          anticipo_1_date: event.anticipo1Date ? String(event.anticipo1Date) : null,
        };
        
        // Insert into Supabase
        const { error: insertError } = await supabase
          .from('events')
          .insert([supabaseEvent]);
        
        if (insertError) {
          const errorMsg = `${event.customerName} (${event.date}): ${insertError.message}`;
          errors.push(errorMsg);
          console.error(`❌ Failed to migrate: ${errorMsg}`);
        } else {
          migrated++;
          console.log(`✅ Migrated: ${event.customerName} - ${event.date}`);
        }
      } catch (error: any) {
        const errorMsg = `${event.customerName} (${event.date}): ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ Error migrating: ${errorMsg}`);
      }
    }
    
    console.log(`✅ Migration complete: ${migrated} migrated, ${skipped} skipped, ${errors.length} errors`);
    
    return {
      success: errors.length === 0,
      migrated,
      errors,
      skipped
    };
  } catch (error: any) {
    console.error('❌ Migration error:', error);
    return {
      success: false,
      migrated: 0,
      errors: [error.message],
      skipped: 0
    };
  }
};
