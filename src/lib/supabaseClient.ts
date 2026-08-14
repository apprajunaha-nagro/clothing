import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jgyiqbdplrisupvqkiqv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpneWlxYmRwbHJpc3VwdnFraXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2OTAwOTcsImV4cCI6MjEwMjI2NjA5N30.BgYf8V7ehJN2wB2voofNw3DDew9hRNv2sGmjuIE38NY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
