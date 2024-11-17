import { createClient } from '@supabase/supabase-js';
import { config } from './config';
import { Database } from './database.types';

export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);