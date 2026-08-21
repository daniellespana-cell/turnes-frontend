import { supabase } from './supabaseClient';

/**
 * 🏷️ PRICING SERVICE
 * Fetches dynamic pricing data from the database.
 */
class PricingService {
    constructor() {
        this.cache = {
            plans: null,
            microservices: {}, // Target-based buckets
            planBySlug: {},
            serviceById: {}
        };
    }

    /**
     * Helper para evitar que las promesas de Supabase se queden colgadas (Hang)
     */
    async _withTimeout(promise, ms = 25000) {
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SUPABASE_TIMEOUT_EXCEEDED')), ms)
        );
        return Promise.race([promise, timeout]);
    }

    /**
     * Get all active plans, ordered by price.
     */
    async getPlans() {
        if (this.cache.plans) return this.cache.plans;

        try {
            const { data, error } = await this._withTimeout(
                supabase
                    .from('planes')
                    .select('*')
                    .order('costo_mensual', { ascending: true })
            );

            if (error) throw error;
            this.cache.plans = data || [];
            return this.cache.plans;
        } catch (error) {
            console.error("Error fetching plans:", error);
            return [];
        }
    }

    /**
     * Get microservices filtered by target audience (optional).
     * @param {string} target 'EMPRESAS' | 'TRABAJADORES' | null (all)
     */
    async getMicroservices(target = 'ALL') {
        const cacheKey = target || 'ALL';
        if (this.cache.microservices[cacheKey]) return this.cache.microservices[cacheKey];

        try {
            let query = supabase
                .from('microservices')
                .select('*')
                .eq('is_active', true);

            if (target && target !== 'ALL') {
                query = query.eq('target_audience', target);
            }

            const { data, error } = await this._withTimeout(query);

            if (error) throw error;
            this.cache.microservices[cacheKey] = data || [];
            return this.cache.microservices[cacheKey];
        } catch (error) {
            console.error("Error fetching microservices:", error);
            return [];
        }
    }
    /**
     * Get a specific plan by its slug.
     * @param {string} slug
     */
    async getPlanBySlug(slug) {
        if (this.cache.planBySlug[slug]) return this.cache.planBySlug[slug];

        try {
            const { data, error } = await this._withTimeout(
                supabase
                    .from('planes')
                    .select('*')
                    .eq('slug', slug)
                    .single()
            );

            if (error) throw error;
            this.cache.planBySlug[slug] = data;
            return data;
        } catch (error) {
            return null;
        }
    }

    /**
     * Get a specific microservice by its ID.
     * @param {string} id
     */
    async getServiceById(id) {
        if (this.cache.serviceById[id]) return this.cache.serviceById[id];

        // Guard: Check if it's a valid UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!id || !uuidRegex.test(id)) return null;

        try {
            const { data, error } = await this._withTimeout(
                supabase
                    .from('microservices')
                    .select('*')
                    .eq('id', id)
                    .single()
            );

            if (error) throw error;
            this.cache.serviceById[id] = data;
            return data;
        } catch (error) {
            console.error("Error fetching service:", error);
            return null;
        }
    }

    /**
     * Verifica si la empresa ya redimió el bono de bienvenida (RPC)
     * @param {string} empresaId
     * @returns {Promise<boolean>}
     */
    async checkWelcomeBonusRedeemed(empresaId) {
        if (!empresaId) return false;
        try {
            const { data, error } = await this._withTimeout(
                supabase.rpc('rpc_check_welcome_bonus_redeemed', { p_empresa_id: empresaId })
            );
            if (error) throw error;
            return Boolean(data);
        } catch (error) {
            console.error("Error checking welcome bonus:", error);
            return false;
        }
    }
}

const pricingService = new PricingService();
export default pricingService;
export { pricingService, PricingService };
