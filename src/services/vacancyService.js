import { supabase } from './supabaseClient';
import { BaseService } from './base/BaseService';

/**
 * 💼 VACANCY SERVICE
 * Centraliza toda la lógica de vacantes.
 * Principio KISS: Métodos directos y claros.
 */
export const VacancyService = {

    /**
     * Obtener vacantes activas (Feed principal)
     * @param {Object} filters - Filtros opcionales (lat, lng, radius, salary)
     */
    async getFeed(filters = {}) {
        // Por ahora, traemos las últimas 20 activas.
        const query = supabase
            .from('vacantes')
            .select(`
                *,
                empresas (
                    nombre_comercial,
                    logo_url,
                    verificado
                )
            `)
            .eq('status', 'activa') // Fixed: 'estado' -> 'status'
            .order('created_at', { ascending: false })
            .limit(20);

        return BaseService.handle(query);
    },

    /**
     * Obtener detalle de una vacante
     * @param {string} id 
     */
    async getById(id) {
        const query = supabase
            .from('vacantes')
            .select(`
                *,
                empresas (
                    id,
                    nombre_comercial,
                    logo_url,
                    verificado,
                    calificacion
                )
            `)
            .eq('id', id)
            .single();

        return BaseService.handle(query);
    },

    /**
     * Buscar vacantes por término (Título o Descripción)
     * @param {string} term 
     */
    async search(term) {
        if (!term) return this.getFeed();

        const query = supabase
            .from('vacantes')
            .select('*, empresas(nombre_comercial, logo_url)')
            .eq('status', 'activa') // Fixed: 'estado' -> 'status'
            .textSearch('fts', term, { type: 'websearch', config: 'spanish' });

        return BaseService.handle(query);
    },

    /**
     * Crear una nueva vacante (Empresa)
     * @param {Object} vacancyData 
     */
    async create(vacancyData) {
        // Validaciones básicas antes de tocar la DB
        if (!vacancyData.titulo || !vacancyData.empresa_id) {
            return { error: { message: "Faltan datos obligatorios" } };
        }

        // Mapeo de campos si es necesario (frontend -> db)
        const payload = {
            ...vacancyData,
            status: 'activa' // Default status
        };

        const query = supabase
            .from('vacantes')
            .insert(payload)
            .select()
            .single();

        return BaseService.handle(query);
    },

    /**
     * Postularse a una vacante
     * @param {string} vacancyId 
     * @param {string} userId 
     */
    async apply(vacancyId, userId) {
        if (!vacancyId || !userId) return { error: { message: "IDs requeridos" } };

        const query = supabase
            .from('postulaciones')
            .insert({
                vacante_id: vacancyId,
                user_id: userId,
                status: 'pendiente'
            })
            .select()
            .single();

        return BaseService.handle(query);
    },

    /**
     * Obtener vacantes de una empresa específica (Dashboard)
     * @param {string} companyId 
     */
    async getMyVacancies(companyId) {
        if (!companyId) return { data: [], error: null };

        const query = supabase
            .from('vacantes')
            .select('*')
            .eq('empresa_id', companyId)
            .order('created_at', { ascending: false });

        return BaseService.handle(query);
    },

    /**
     * Cerrar una vacante (Marcar como completada)
     * @param {string} id 
     */
    async close(id) {
        const query = supabase
            .from('vacantes')
            .update({
                status: 'cerrada', // Fixed: 'estado' -> 'status'
                closed_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        return BaseService.handle(query);
    },

    /**
     * Eliminar una vacante (Soft Delete o Hard Delete según política)
     * Por ahora Hard Delete para limpiar.
     * @param {string} id 
     */
    async delete(id) {
        const query = supabase
            .from('vacantes')
            .delete()
            .eq('id', id);

        return BaseService.handle(query);
    }
};
