
import { createClient } from '@supabase/supabase-js';

// 1. Configuración de Entorno (Fail-Fast)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ Supabase Error: Faltan variables de entorno (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
}

// 2. Cliente Singleton
// Optimizado para persistencia de sesión en localStorage (defecto en web)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});
