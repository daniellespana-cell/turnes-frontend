/**
 * 🧱 BASE SERVICE
 * Patrón "Adapter" para estandarizar las respuestas de Supabase.
 * Principio KISS: Solo envuelve lo necesario (data, error).
 */
export class BaseService {

    /**
     * Helper to prevent eternal hanging promises (Supabase Socket issues)
     */
    static async _withTimeout(promise, ms = 20000, context = 'Unknown Query') {
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`SUPABASE_TIMEOUT_EXCEEDED: ${context}`)), ms)
        );
        return Promise.race([promise, timeout]);
    }

    /**
     * Maneja la respuesta de Supabase y normaliza errores.
     * @param {Promise} request - La promesa de Supabase (query)
     * @param {number} timeout - Tiempo máximo de espera en ms
     * @returns {Promise<{data: any, error: any}>}
     */
    static async handle(request, timeout = 20000, context = 'Query') {
        try {
            const { data, error } = await this._withTimeout(request, timeout, context);

            if (error) {
                // Ignorar error de cancelación de promesas (React Strict Mode / Fast Refresh)
                const isAbortError = error.name === 'AbortError' || (error.message && error.message.includes('AbortError'));
                if (!isAbortError) {
                    console.error("🔥 API Error:", error.message, error.details);
                }
                return { data: null, error };
            }

            return { data, error: null };
        } catch (err) {
            if (err.message && err.message.includes('SUPABASE_TIMEOUT_EXCEEDED')) {
                // Silenced per user request (Senior Production preference)
                // console.warn("⏱️ Supabase Timeout:", err.message);
            } else {
                console.error("💥 System Error:", err);
            }
            return { data: null, error: err };
        }
    }
}
