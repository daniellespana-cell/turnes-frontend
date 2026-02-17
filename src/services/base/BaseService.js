/**
 * 🧱 BASE SERVICE
 * Patrón "Adapter" para estandarizar las respuestas de Supabase.
 * Principio KISS: Solo envuelve lo necesario (data, error).
 */
export class BaseService {

    /**
     * Maneja la respuesta de Supabase y normaliza errores.
     * @param {Promise} request - La promesa de Supabase (query)
     * @returns {Promise<{data: any, error: any}>}
     */
    static async handle(request) {
        try {
            const { data, error } = await request;

            if (error) {
                // Log centralizado para monitoreo (futuro: Sentry)
                console.error("🔥 API Error:", error.message, error.details);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (err) {
            console.error("💥 System Error:", err);
            return { data: null, error: err };
        }
    }
}
