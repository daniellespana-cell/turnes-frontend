import { supabase } from './supabaseClient';

/**
 * 📦 ApplicationService (SSOT)
 * Maneja todas las interacciones con la tabla 'postulaciones'.
 */
export const applicationService = {
    /**
     * Obtiene los IDs de las vacantes a las que el usuario ya se postuló.
     * Ventana de 60 días para optimización de memoria y red (Anti-Leak).
     *
     * @param {string} userId
     * @param {number} daysWindow - Ventana en días (default: 60)
     */
    async getAppliedVacancyIds(userId, daysWindow = 60) {
        try {
            const cutoffDate = new Date(Date.now() - daysWindow * 24 * 60 * 60 * 1000).toISOString();

            const { data, error } = await supabase
                .from('postulaciones')
                .select('vacante_id')
                .eq('user_id', userId)
                .gte('created_at', cutoffDate);

            if (error) throw error;
            return { data: data.map(p => p.vacante_id), error: null };
        } catch (error) {
            console.error("[ApplicationService] Error fetching applied IDs:", error);
            return { data: [], error };
        }
    },

    /**
     * Crea una suscripción en tiempo real para las postulaciones de un usuario.
     */
    subscribeToUserApplications(userId, callback) {
        return supabase
            .channel(`public:postulaciones:sync:${userId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'postulaciones',
                filter: `user_id=eq.${userId}`
            }, callback)
            .subscribe();
    },

    /**
     * Cancela una suscripción de canal de Supabase de forma segura.
     * Encapsula el acceso al cliente supabase para que los hooks nunca lo importen directamente.
     * @param {RealtimeChannel} channel - El canal retornado por subscribeToUserApplications
     */
    unsubscribeChannel(channel) {
        if (channel) supabase.removeChannel(channel);
    }
};
