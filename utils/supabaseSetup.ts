
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
}> => {
  try {
    console.log('🔄 Starting migration of local events to Supabase...');
    
    // Import storage functions
    const { loadEventsFromLocalStorage, saveEventToSupabase } = await import('./storage');
    
    // Load local events
    const localEvents = await loadEventsFromLocalStorage();
    console.log(`📱 Found ${localEvents.length} local events to migrate`);
    
    if (localEvents.length === 0) {
      return {
        success: true,
        migrated: 0,
        errors: []
      };
    }
    
    let migrated = 0;
    const errors: string[] = [];
    
    // Migrate each event
    for (const event of localEvents) {
      try {
        const result = await saveEventToSupabase(event);
        
        if (result.success) {
          migrated++;
          console.log(`✅ Migrated event: ${event.customerName} - ${event.date}`);
        } else {
          const errorMsg = `Failed to migrate ${event.customerName}: ${result.error}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      } catch (error: any) {
        const errorMsg = `Error migrating ${event.customerName}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }
    
    console.log(`✅ Migration complete: ${migrated}/${localEvents.length} events migrated`);
    
    return {
      success: errors.length === 0,
      migrated,
      errors
    };
  } catch (error: any) {
    console.error('❌ Migration error:', error);
    return {
      success: false,
      migrated: 0,
      errors: [error.message]
    };
  }
};
