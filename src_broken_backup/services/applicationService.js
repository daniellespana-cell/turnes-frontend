import { supabase } from './supabaseClient';

/**
 * 📦 ApplicationService (SSOT)
 * Maneja todas las interacciones con la tabla 'postulaciones'.
 */
export const applicationService = {
    /**
     * Obtiene los IDs de las vacantes a las que el usuario ya se postuló.
     * Útil para evitar duplicados en la UI.
     */
    async getAppliedVacancyIds(userId) {
        try {
            const { data, error } = await supabase
                .from('postulaciones')
                .select('vacante_id')
                .eq('user_id', userId);

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
    }
};
