import { createClient } from '@supabase/supabase-js';

// Vite exposes env vars via import.meta.env. Support both VITE_ prefixed and plain for robustness.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || (typeof process !== 'undefined' && process.env.SUPABASE_URL);
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || (typeof process !== 'undefined' && process.env.SUPABASE_ANON_KEY);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
