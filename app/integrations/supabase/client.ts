import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://hfagsrdboeoxfdzpzgnn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmYWdzcmRib2VveGZkenB6Z25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MTk3NTcsImV4cCI6MjA2OTk5NTc1N30.G5056ar9KgYzXJm7DGXZ1zqfW-VGolCtPPp87CoIwRI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
