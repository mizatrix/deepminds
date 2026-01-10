import { createClient } from '@supabase/supabase-js';

// Safe initialization to prevent build/runtime crashes if env vars are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

if (process.env.NEXT_PUBLIC_SUPABASE_URL === undefined) {
    console.warn('WARNING: NEXT_PUBLIC_SUPABASE_URL is missing. Supabase features will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
