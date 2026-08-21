
import { createClient } from '@supabase/supabase-js';

// 1. Configuración de Entorno (Fail-Fast Real)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('⚠️ [Supabase Client] Faltan variables de entorno requeridas: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
}

// 2. Cliente Singleton Enterprise
// Utiliza flujo PKCE estándar y almacenamiento defensivo nativo tolerante a fallos
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});
