
import { supabase } from './supabaseClient';

/**
 * 📡 ACTIVITY SERVICE — Production Ready
 * Manages data retrieval for the worker's activity feed.
 */
export const ActivityService = {
    /**
     * Retrieves the latest applications and notifications for the user's activity feed.
     * @param {string} userId - UUID of the worker.
     * @returns {Promise<{data: Array, error: any}>}
     */
    async getActivityFeed(userId) {
        if (!userId) return { data: [], error: 'User ID required' };

        try {
            const [pR, nR] = await Promise.allSettled([
                supabase
                    .from('postulaciones')
                    .select('id, created_at, status, vacante:vacantes!inner(titulo)')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(4),
                supabase
                    .from('notificaciones')
                    .select('id, created_at, tipo, mensaje')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(3)
            ]);

            const all = [];

            // Process Postulaciones
            if (pR.status === 'fulfilled' && pR.value.data) {
                pR.value.data.forEach(p => {
                    const t = p.status === 'finalizado' ? 'Completaste' : 
                              p.status === 'aceptado' ? 'Aceptado en' : 'Te postulaste a';
                    all.push({ 
                        id: `p-${p.id}`, 
                        type: 'postulacion', 
                        text: `${t} "${p.vacante?.titulo || 'vacante'}"`, 
                        time: p.created_at 
                    });
                });
            }

            // Process Notificaciones
            if (nR.status === 'fulfilled' && nR.value.data) {
                nR.value.data.forEach(n => {
                    all.push({ 
                        id: `n-${n.id}`, 
                        type: n.tipo?.includes('REVIEW') ? 'review' : 'notification', 
                        text: n.mensaje || 'Notificación', 
                        time: n.created_at 
                    });
                });
            }

            // Sort newest first and take top 5
            all.sort((a, b) => new Date(b.time) - new Date(a.time));
            
            return { data: all.slice(0, 5), error: null };
            
        } catch (error) {
            console.error('[ActivityService]', error);
            return { data: [], error };
        }
    }
};
