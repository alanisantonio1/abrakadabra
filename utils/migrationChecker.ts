
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
    
    // Try to query the events table with anticipo columns
    const { data, error } = await supabase
      .from('events')
      .select('anticipo_1_amount, anticipo_2_amount, anticipo_3_amount')
      .limit(1);
    
    if (error) {
      console.error('❌ Migration check error:', error);
      
      // Check if error is related to missing columns
      if (error.message?.includes('anticipo_1_amount') || 
          error.message?.includes('column') && error.message?.includes('does not exist')) {
        
        const missingColumns = [];
        if (error.message.includes('anticipo_1_amount')) missingColumns.push('anticipo_1_amount');
        if (error.message.includes('anticipo_2_amount')) missingColumns.push('anticipo_2_amount');
        if (error.message.includes('anticipo_3_amount')) missingColumns.push('anticipo_3_amount');
        
        return {
          isRequired: true,
          missingColumns,
          message: '🔧 Migración requerida: Faltan columnas anticipo en la tabla events',
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
    
    // Success - columns exist
    console.log('✅ Anticipo columns are available');
    return {
      isRequired: false,
      missingColumns: [],
      message: '✅ Columnas anticipo disponibles - No se requiere migración',
      canProceed: true
    };
    
  } catch (error: any) {
    console.error('❌ Error checking migration:', error);
    return {
      isRequired: false,
      missingColumns: [],
      message: `❌ Error verificando migración: ${error.message || 'Unknown error'}`,
      canProceed: false
    };
  }
};

/**
 * Test if we can insert an event with anticipo columns
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
      anticipo_2_amount: 0,
      anticipo_2_date: null,
      anticipo_3_amount: 0,
      anticipo_3_date: null,
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
          message: '🔧 Migración requerida: No se pueden insertar eventos con columnas anticipo'
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
      message: '✅ Inserción con columnas anticipo funciona correctamente'
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

Para resolver el error de columnas anticipo faltantes:

1. Abrir Supabase Dashboard:
   https://supabase.com/dashboard

2. Ir a SQL Editor en su proyecto

3. Ejecutar la siguiente migración:

\`\`\`sql
-- Add anticipo columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS anticipo_1_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS anticipo_1_date TEXT,
ADD COLUMN IF NOT EXISTS anticipo_2_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS anticipo_2_date TEXT,
ADD COLUMN IF NOT EXISTS anticipo_3_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS anticipo_3_date TEXT;

-- Update existing events
UPDATE events 
SET anticipo_1_amount = deposit 
WHERE anticipo_1_amount IS NULL OR anticipo_1_amount = 0;
\`\`\`

4. Reiniciar la aplicación

📁 También puede encontrar el archivo completo en:
   supabase/migrations/add_anticipo_columns.sql
`;
};
