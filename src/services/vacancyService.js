import { supabase } from './supabaseClient';
import { BaseService } from './base/BaseService';

/**
 * 💼 VACANCY SERVICE
 * Centraliza toda la lógica de vacantes.
 * Principio KISS: Métodos directos y claros.
 */

/**
 * 🔒 LOCATION PRIVACY NOTE
 * Coordinate fuzzing is handled server-side by the `vacantes_public` PostgreSQL view.
 * The frontend never receives exact coordinates for candidate-facing queries.
 */

export const VacancyService = {

    /**
     * Obtener vacantes activas (Feed principal del candidato)
     * @param {Object} filters - Filtros opcionales
     */
    async getFeed(options = {}) {
        const query = supabase
            .from('vacantes')
            .select(`
                *,
                empresas (
                    id,
                    nombre_comercial,
                    logo_url,
                    verificado
                )
            `)
            .eq('status', 'activa')
            // 🚀 Prioridad Senior: Primero Urgentes, luego por Fecha
            .order('es_urgente', { ascending: false }) 
            .order('created_at', { ascending: false });

        if (options.from !== undefined && options.to !== undefined) {
            query.range(options.from, options.to);
        } else {
            query.limit(20);
        }

        return await BaseService.handle(query);
    },

    /**
     * Obtiene vacantes de la empresa elegibles para Boost (Impulso)
     * @param {string} companyId - ID de la empresa
     */
    async getBoostEligibleVacancies(companyId) {
        if (!companyId) return { data: [], error: 'Company ID required' };
        
        const query = supabase
            .from('vacantes')
            .select('id, titulo, status, created_at, es_urgente, urgente_expiracion')
            .eq('empresa_id', companyId)
            .eq('status', 'activa')
            .eq('es_urgente', false)
            .order('created_at', { ascending: false });

        return await BaseService.handle(query);
    },

    /**
     * Obtener detalle de una vacante
     * @param {string} id
     */
    async getById(id) {
        const query = supabase
            .from('vacantes') // 🛡️ Consulta directa a tabla con RLS activo
            .select(`
                *,
                empresas (
                    id,
                    nombre_comercial,
                    logo_url,
                    verificado
                )
            `)
            .eq('id', id)
            .single();

        return await BaseService.handle(query);
    },

    /**
     * Resuelve el ID de la empresa propietaria de una vacante.
     * Útil para autocuración de datos cuando el feed inicial es incompleto.
     */
    async getCompanyIdByVacancyId(id) {
        const { data, error } = await this.getById(id);
        if (error || !data) return null;
        const empresa = Array.isArray(data.empresas) ? data.empresas[0] : data.empresas;
        return data.empresa_id || empresa?.id || null;
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
            .eq('status', 'activa')
            .textSearch('fts', term, { type: 'websearch', config: 'spanish' });

        return BaseService.handle(query);
    },

    /**
     * Crear una nueva vacante (Empresa)
     * @param {Object} vacancyData
     */
    async create(vacancyData) {
        if (!vacancyData.titulo || !vacancyData.empresa_id) {
            return { error: { message: 'Faltan datos obligatorios' } };
        }

        const payload = { ...vacancyData, status: 'activa' };

        const query = supabase.rpc('rpc_create_vacancy_v3', {
            p_titulo: payload.titulo,
            p_descripcion: payload.descripcion,
            p_categoria: payload.categoria || 'VARIOS',
            p_lat: payload.lat,
            p_lng: payload.lng,
            p_direccion_formateada: payload.direccion_formateada,
            p_pago_monto: payload.pago_monto,
            p_fecha_turno: payload.fecha_turno,
            p_tipo_turno: payload.tipo_turno || 'temporal',
            p_tipo_turno_id: payload.tipo_turno_id || null,
            p_status: payload.status,
            p_es_urgente: payload.es_urgente || false,
            p_etiquetas: payload.etiquetas || []
        });

        const response = await BaseService.handle(query);
        return response;
    },

    // ─── ACCIONES DE TRABAJADOR ───────────────────────────────────────────────

    /**
     * Postularse a una vacante (Rol: Trabajador)
     * @param {string} vacancyId
     * @param {string} userId
     */
    async apply(vacancyId, userId) {
        if (!vacancyId || !userId) return { error: { message: 'IDs requeridos' } };

        const query = supabase
            .from('postulaciones')
            .insert({ vacante_id: vacancyId, user_id: userId, status: 'pendiente' })
            .select()
            .single();

        return BaseService.handle(query);
    },

    /**
     * Obtener mis postulaciones (Rol: Trabajador)
     */
    async getMyApplications(userId, statuses, from, to) {
        if (!userId) return { data: [], error: null };

        const query = supabase
            .from('postulaciones')
            .select(`
                id,
                status,
                created_at,
                protocol_state,
                vacante:vacantes (
                    id,
                    titulo,
                    status,
                    pago_monto,
                    tipo_turno,
                    fecha_turno,
                    lat,
                    lng,
                    direccion_formateada,
                    categoria,
                    empresas (
                        id,
                        nombre_comercial,
                        logo_url
                    )
                )
            `)
            .eq('user_id', userId)
            .in('status', statuses)
            .order('created_at', { ascending: false })
            .range(from, to);

        return await BaseService.handle(query);
    },

    // ─── ACCIONES DE EMPRESA ──────────────────────────────────────────────────

    /**
     * Invitar a un candidato a una vacante activa (Rol: Empresa)
     */
    async inviteCandidate(vacancyId, candidateId) {
        if (!vacancyId || !candidateId) return { error: { message: 'IDs requeridos' } };

        const query = supabase.rpc('rpc_invite_candidate', {
            p_vacante_id: vacancyId,
            p_candidato_id: candidateId
        }).single();

        return BaseService.handle(query);
    },

    /**
     * Obtener estadísticas de uso de vacantes fijas (Contador dinámico)
     * @param {string} companyId 
     */
    async getUsageStats(companyId) {
        if (!companyId) return { data: null, error: 'ID requerido' };
        
        // Invocamos el RPC de cotización con cantidad 0 para obtener solo el conteo actual
        const query = supabase.rpc('rpc_quote_vacancy_price', {
            p_empresa_id: companyId,
            p_type: 'fijo',
            p_quantity: 0,
            p_payment: 0,
            p_is_urgent: false
        });

        return await BaseService.handle(query);
    },

    /**
     * Obtener vacantes de una empresa específica (Dashboard)
     * @param {string} companyId
     */
    async getMyVacancies(companyId) {
        if (!companyId) return { data: [], error: null };

        const query = supabase
            .from('vacantes')
            .select(`
                *,
                postulaciones (count)
            `)
            .eq('empresa_id', companyId)
            .order('created_at', { ascending: false });

        return BaseService.handle(query);
    },

    /**
     * Comprar Impulso Urgente (48H)
     */
    async buyBoost(vacancyId, price = 7000) {
        const query = supabase.rpc('rpc_buy_boost_v1', {
            p_vacancy_id: vacancyId,
            p_price: price
        });
        return BaseService.handle(query);
    },

    /**
     * Cerrar una vacante (Marcar como completada)
     * @param {string} id
     */
    async close(id) {
        const query = supabase
            .from('vacantes')
            .update({ status: 'cerrada', closed_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        return BaseService.handle(query);
    },

    /**
     * Cancelar una postulación (Rol: Trabajador)
     * Utiliza RPC para bypass de políticas RLS y asegurar atomicidad.
     */
    async cancelApplication(applicationId) {
        const query = supabase.rpc('rpc_cancel_worker_application', {
            p_application_id: applicationId
        });
        return BaseService.handle(query);
    },

    /**
     * Eliminar una vacante (Soft Delete — preserva historial)
     * NUNCA hacer hard delete: las FK cascade destruirían postulaciones, ratings y reviews.
     * @param {string} id
     */
    async delete(id) {
        const query = supabase
            .from('vacantes')
            .update({ status: 'eliminada', updated_at: new Date().toISOString() })
            .eq('id', id);
        return BaseService.handle(query);
    },

    /**
     * Suscribirse a nuevas vacantes en tiempo real
     * @param {Function} callback
     */
    subscribeToNew(callback) {
        return supabase
            .channel('public:vacantes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'vacantes'
                // Removed filter: 'status=eq.activa' to catch DELETE and status updates (closures)
            }, callback)
            .subscribe();
    },

    /**
     * Cancelar suscripción a canal de tiempo real
     * @param {Object} channel
     */
    unsubscribe(channel) {
        if (channel) supabase.removeChannel(channel);
    }
};
