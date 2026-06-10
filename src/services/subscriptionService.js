import { supabase } from './supabaseClient';
import { BaseService } from './base/BaseService';

/**
 * 💎 SUBSCRIPTION SERVICE (SSOT)
 * Centraliza la lógica de planes y beneficios consultando directamente la base de datos.
 */
export const SubscriptionService = {
    
    /**
     * Obtiene todos los planes activos de la base de datos.
     */
    async getAvailablePlans() {
        const query = supabase
            .from('planes')
            .select('*')
            .order('costo_mensual', { ascending: true });
            
        return await BaseService.handle(query);
    },

    /**
     * Obtiene los detalles de un plan específico por su slug (id).
     */
    async getPlanDetails(planSlug) {
        if (!planSlug || planSlug === 'free') {
            return {
                data: {
                    nombre: 'Básico',
                    slug: 'free',
                    features: ['Publicaciones turnos ilimitadas', 'Chat interno', 'Soporte estándar'],
                    costo_mensual: 0
                },
                error: null
            };
        }

        const query = supabase
            .from('planes')
            .select('*')
            .eq('slug', planSlug)
            .maybeSingle();
            
        return await BaseService.handle(query);
    }
};

export default SubscriptionService;
