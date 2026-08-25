
import { createClient } from '@supabase/supabase-js';

// 1. Configuración de Entorno (Fail-Fast Real)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('⚠️ [Supabase Client] Faltan variables de entorno requeridas: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
}

/**
 * 🛡️ RESILIENT AUTH LOCK (Enterprise Multi-Tab & PWA Standard)
 * 
 * Sincroniza la renovación de tokens entre pestañas con Web Locks nativos.
 * Si una pestaña en segundo plano es suspendida por el SO (iOS Safari / Chrome Memory Saver)
 * y el LockManager no responde en 2000ms, NO bloquea ni lanza excepción:
 * Se auto-recupera degradando a ejecución directa (Graceful Degradation / Circuit Breaker),
 * garantizando 0 bloqueos y 100% de disponibilidad de sesión.
 */
export const resilientAuthLock = async (name, acquireTimeout, fn) => {
    if (typeof window === 'undefined' || !window.navigator?.locks?.request) {
        return await fn();
    }

    const safeTimeout = Math.min(acquireTimeout || 5000, 2000);
    const abortController = new AbortController();
    const timer = setTimeout(() => abortController.abort(), safeTimeout);

    try {
        return await window.navigator.locks.request(
            name,
            { mode: 'exclusive', signal: abortController.signal },
            async () => {
                clearTimeout(timer);
                return await fn();
            }
        );
    } catch (err) {
        clearTimeout(timer);
        // Si el LockManager abortó por timeout (deadlock de pestaña suspendida), auto-recuperar sin crashear
        if (err?.name === 'AbortError' || err?.message?.includes('timed out') || err?.isAcquireTimeout) {
            console.warn(`⚠️ [Supabase Auth] LockManager timeout en "${name}". Auto-recuperando sesión.`);
            return await fn();
        }
        throw err;
    }
};

// 2. Cliente Singleton Enterprise
// Utiliza flujo PKCE estándar, almacenamiento defensivo nativo y cerrojo tolerante a fallos
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        lock: resilientAuthLock,
        lockAcquireTimeout: 2000
    }
});
