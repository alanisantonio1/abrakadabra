
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = 'https://hfagsrdboeoxfdzpzgnn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmYWdzcmRib2VveGZkenB6Z25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MTk3NTcsImV4cCI6MjA2OTk5NTc1N30.G5056ar9KgYzXJm7DGXZ1zqfW-VGolCtPPp87CoIwRI';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Since this is an internal app, we don't need user sessions
  },
});

// Test connection
export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
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
        message: `Connection failed: ${error.message}` 
      };
    }
    
    console.log('✅ Supabase connection successful');
    return { 
      success: true, 
      message: 'Supabase connection successful' 
    };
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return { 
      success: false, 
      message: `Connection error: ${error}` 
    };
  }
};
