import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://czfoyfbmceupwusipvul.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6Zm95ZmJtY2V1cHd1c2lwdnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2OTgyNTMsImV4cCI6MjEwMjI3NDI1M30.32vMW38C1px86u2xnw4Gwl5Y8LqcqKXjJ-GNIePyKr4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};
