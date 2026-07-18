import { supabase } from './supabaseClient';
import { BaseService } from './base/BaseService';

/**
 * 🛡️ TAXONOMY SERVICE
 * Encapsula el acceso a la base de datos para todas las taxonomías de la plataforma.
 * Mantiene la capa de dominio pura.
 */
export const TaxonomyService = {
    /**
     * Obtiene todos los sectores activos
     */
    async getSectors() {
        const query = supabase
            .from('taxonomy_sectors')
            .select('*')
            .eq('is_active', true);
            
        return await BaseService.handle(query);
    },

    /**
     * Obtiene todos los roles activos ordenados por sort_order
     */
    async getRoles() {
        const query = supabase
            .from('taxonomy_roles')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');
            
        return await BaseService.handle(query);
    },

    /**
     * Obtiene todas las habilidades activas ordenadas por sort_order
     */
    async getSkills() {
        const query = supabase
            .from('taxonomy_skills')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');
            
        return await BaseService.handle(query);
    }
};

export default TaxonomyService;
