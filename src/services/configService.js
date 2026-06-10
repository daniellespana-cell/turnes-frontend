import { supabase } from './supabaseClient';

/**
 * ⚙️ ConfigService (SSOT)
 * Centraliza el acceso a tablas de configuración y metadatos del sistema.
 */
export const configService = {
    /**
     * Obtiene los ajustes públicos de la empresa (teléfono, email, etc.)
     */
    async getPublicCompanySettings() {
        try {
            const { data, error } = await supabase
                .from('company_settings')
                .select('key_name, value_text, description');

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("[ConfigService] Error fetching settings:", error);
            return { data: null, error };
        }
    },

    /**
     * Obtiene la lista de microservicios y sus precios (SSOT)
     */
    async getMicroservices() {
        try {
            const { data, error } = await supabase
                .from('microservices')
                .select('*')
                .eq('is_active', true);

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("[ConfigService] Error fetching microservices:", error);
            return { data: null, error };
        }
    }
};
