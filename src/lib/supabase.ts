import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Key missing in .env.local');
}

// Fallback para evitar crash crítico se as env vars não estiverem definidas (ex: build time ou esquecimento no deploy)
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder';

// Removendo tipagem genérica temporariamente devido a incompatibilidade de tipos
export const supabase = createClient(
    supabaseUrl || fallbackUrl,
    supabaseAnonKey || fallbackKey
);
