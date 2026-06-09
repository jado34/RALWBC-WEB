import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')) {
  console.warn(
    'Supabase Credentials Warning:\n' +
    'Your VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing, empty, or using a placeholder.\n' +
    'Please set these values in your local .env file.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-change-me.supabase.co',
  supabaseAnonKey || 'placeholder'
);
