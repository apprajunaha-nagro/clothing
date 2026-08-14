import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string, fallback: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {}
  return fallback;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'https://jgyiqbdplrisupvqkiqv.supabase.co');
const supabaseAnonKey = getEnvVar(
  'VITE_SUPABASE_ANON_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpneWlxYmRwbHJpc3VwdnFraXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2OTAwOTcsImV4cCI6MjEwMjI2NjA5N30.BgYf8V7ehJN2wB2voofNw3DDew9hRNv2sGmjuIE38NY'
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
