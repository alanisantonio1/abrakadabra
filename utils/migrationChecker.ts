
import { supabase } from '../app/integrations/supabase/client';

export interface MigrationStatus {
  isRequired: boolean;
  missingColumns: string[];
  message: string;
  canProceed: boolean;
}

/**
 * Check if the anticipo columns migration is required
 */
export const checkAnticipoMigration = async (): Promise<MigrationStatus> => {
  try {
    console.log('🔍 Checking if anticipo migration is required...');
    
    // Try to query the events table with only the first anticipo column
    const { data, error } = await supabase
      .from('events')
      .select('anticipo_1_amount')
      .limit(1);
    
    if (error) {
      console.error('❌ Migration check error:', error);
      
      // Check if error is related to missing columns
      if (error.message?.includes('anticipo_1_amount') || 
          error.message?.includes('column') && error.message?.includes('does not exist')) {
        
        return {
          isRequired: true,
          missingColumns: ['anticipo_1_amount'],
          message: '🔧 Migración requerida: Falta columna anticipo_1_amount en la tabla events',
          canProceed: false
        };
      }
      
      // Check for policy errors
      if (error.message?.includes('policy') && error.message?.includes('already exists')) {
        return {
          isRequired: true,
          missingColumns: [],
          message: '🔧 Migración requerida: Error de política duplicada - Ejecute la migración para corregir',
          canProceed: false
        };
      }
      
      // Other error
      return {
        isRequired: false,
        missingColumns: [],
        message: `❌ Error verificando migración: ${error.message}`,
        canProceed: false
      };
    }
    
    // Success - column exists
    console.log('✅ Anticipo column is available');
    return {
      isRequired: false,
      missingColumns: [],
      message: '✅ Columna anticipo disponible - No se requiere migración',
      canProceed: true
    };
    
  } catch (error: any) {
    console.error('❌ Error checking migration:', error);
    
    // Check for policy errors in catch block too
    if (error.message?.includes('policy') && error.message?.includes('already exists')) {
      return {
        isRequired: true,
        missingColumns: [],
        message: '🔧 Migración requerida: Error de política duplicada - Ejecute la migración para corregir',
        canProceed: false
      };
    }
    
    return {
      isRequired: false,
      missingColumns: [],
      message: `❌ Error verificando migración: ${error.message || 'Unknown error'}`,
      canProceed: false
    };
  }
};

/**
 * Test if we can insert an event with anticipo column
 */
export const testAnticipoInsert = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🧪 Testing anticipo insert capability...');
    
    const testEvent = {
      id: `migration_test_${Date.now()}`,
      date: '2024-12-31',
      time: '15:00',
      customer_name: 'Test Migration',
      customer_phone: '+52 55 1234 5678',
      child_name: 'Test Niño',
      package_type: 'Abra' as const,
      total_amount: 1000,
      deposit: 500,
      remaining_amount: 500,
      is_paid: false,
      notes: 'Migration test event',
      anticipo_1_amount: 500,
      anticipo_1_date: '2024-12-31',
    };
    
    // Try to insert
    const { error: insertError } = await supabase
      .from('events')
      .insert([testEvent]);
    
    if (insertError) {
      console.error('❌ Test insert failed:', insertError);
      
      if (insertError.message?.includes('anticipo_1_amount') || 
          insertError.message?.includes('column') && insertError.message?.includes('does not exist')) {
        return {
          success: false,
          message: '🔧 Migración requerida: No se pueden insertar eventos con columna anticipo'
        };
      }
      
      return {
        success: false,
        message: `❌ Error en prueba de inserción: ${insertError.message}`
      };
    }
    
    // Clean up test event
    await supabase
      .from('events')
      .delete()
      .eq('id', testEvent.id);
    
    console.log('✅ Test insert successful');
    return {
      success: true,
      message: '✅ Inserción con columna anticipo funciona correctamente'
    };
    
  } catch (error: any) {
    console.error('❌ Error testing insert:', error);
    return {
      success: false,
      message: `❌ Error en prueba: ${error.message || 'Unknown error'}`
    };
  }
};

/**
 * Get migration instructions
 */
export const getMigrationInstructions = (): string => {
  return `
🔧 INSTRUCCIONES DE MIGRACIÓN

Para resolver el error de política duplicada:

1. Abrir Supabase Dashboard:
   https://supabase.com/dashboard

2. Ir a SQL Editor en su proyecto

3. Ejecutar la siguiente migración:

\`\`\`sql
-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Allow all operations on events" ON events;

-- Ensure events table exists with proper structure
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  anticipo_1_amount DECIMAL(10,2) DEFAULT 0,
  anticipo_1_date TEXT
);

-- Add missing columns if they don't exist
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS anticipo_1_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS anticipo_1_date TEXT;

-- Remove extra anticipo columns that are no longer needed
ALTER TABLE events 
DROP COLUMN IF EXISTS anticipo_2_amount,
DROP COLUMN IF EXISTS anticipo_2_date,
DROP COLUMN IF EXISTS anticipo_3_amount,
DROP COLUMN IF EXISTS anticipo_3_date;

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create the policy with a unique name to avoid conflicts
CREATE POLICY "events_all_operations_policy" ON events
  FOR ALL USING (true);

-- Update existing events to have anticipo_1_amount equal to their deposit if not set
UPDATE events 
SET anticipo_1_amount = deposit 
WHERE anticipo_1_amount IS NULL OR anticipo_1_amount = 0;
\`\`\`

4. Reiniciar la aplicación

📝 NOTA: Esta migración:
- Elimina la política duplicada que causaba el error
- Simplifica la estructura usando solo un campo anticipo
- Remueve las columnas anticipo_2 y anticipo_3 que ya no se necesitan
- Crea una nueva política con nombre único
`;
};
