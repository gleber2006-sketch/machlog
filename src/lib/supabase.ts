import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Key missing in .env.local');
}

// Fallback para evitar crash crítico se as env vars não estiverem definidas (ex: build time ou esquecimento no deploy)
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder';

export const supabase = createClient<Database>(
    supabaseUrl || fallbackUrl,
    supabaseAnonKey || fallbackKey
);
