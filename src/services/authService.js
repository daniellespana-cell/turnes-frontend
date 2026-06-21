import { supabase } from './supabaseClient';
import { BaseService } from './base/BaseService';
import { logger } from '../utils/logger';
import { profileMapper } from '../utils/profileMapper';

/**
 * 🔐 AUTH SERVICE (Supabase Bridge)
 * Maneja el ciclo de vida de la identidad.
 */
export const authService = {

    /**
     * Iniciar Sesión
     * @param {string} email
     * @param {string} password
     */
    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    /**
     * Iniciar Sesión con Google
     * Redirige al proveedor OAuth.
     * @param {string} intendedRole - Opcional. El rol ('empresa' o 'postulante') si viene de Registro.
     * @param {boolean} isLoginAction - Si es true, añade una marca para prevenir un auto-signup accidental.
     */
    async loginWithGoogle(intendedRole = null, isLoginAction = false) {
        // Enrutamiento Stateless: codificamos la intención en la URL de retorno
        let redirectTo = `${window.location.origin}/dashboard`;
        
        if (intendedRole) {
            redirectTo = `${window.location.origin}/auth/callback?role=${intendedRole}`;
        } else if (isLoginAction) {
            redirectTo = `${window.location.origin}/auth/callback?action=login_only`;
        }

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
        if (error) throw error;
        return data;
    },

    /**
     * Recuperación de Contraseña
     * Envía email mágico para resetear password.
     */
    async recoverPassword(email) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`, // Ruta necesaria en frontend
        });
        if (error) throw error;
        return data;
    },

    /**
     * Registro de Usuario (Dispara Triggers de DB)
     * @param {string} email
     * @param {string} password
     * @param {Object} metadata - Metadatos adicionales (ej: rol, nombre_comercial, full_name)
     */
    async register(email, password, metadata = {}) {
        logger.dev('🚀 [AuthService] Registro:', { email, rol: metadata.rol });

        // 🛡️ UNIFY METADATA KEYS
        // Ensure we send 'rol' (Spanish) as expected by DB triggers/RLS
        // and 'role' (English) just in case some legacy logic needs it.
        const finalMetadata = {
            ...metadata,
            rol: metadata.rol || 'postulante', // Default to applicant
            role: metadata.rol === 'empresa' ? 'company' : 'jobseeker', // Dual compatibility
            company_name: metadata.companyName || metadata.nombre_comercial || "",
        };

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: finalMetadata,
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        });

        if (error) throw error;
        return data;
    },

    /**
     * Cerrar Sesión
     */
    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    /**
     * Obtener Sesión Actual
     */
    async getSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    },

    /**
     * Establecer Rol después de OAuth
     * @param {string} role - 'BUSINESS_ROLE' o 'WORKER_ROLE'
     */
    async setRoleAfterOAuth(role) {
        if (!role) throw new Error('Role is required');
        const { data, error } = await supabase.rpc('rpc_set_user_role_after_oauth', { p_role: role });
        if (error) throw error;
        return data;
    },

    /**
     * Recuperar Perfil Público (desde public.perfiles)
     * Auth solo tiene email/id. El perfil rico está en la tabla pública.
     */
    /**
     * Recuperar Perfil Público y Billetera en 1 Hilo (Anti-Deadlock)
     * Auth solo tiene email/id. 
     */
    async getProfile(userId) {
        // ⚡ CRITICAL FIX: To avoid the invisible Postgres RLS Deadlock that
        // is hanging the app for 10+ seconds, we call a Security Definer RPC
        // which bypasses RLS and executes under 50ms.
        const query = supabase.rpc('rpc_get_user_boot_data', {
            p_user_id: userId
        });

        const { data, error } = await BaseService.handle(query, 8000, 'rpc_get_user_boot_data');

        if (error) {
            /* 
            console.error("🔥 Error crítico obteniendo perfil desde RPC:", {
                message: error.message || error,
                hint: data?.hint || 'Check for cold start or database locks'
            });
            */
            // Si el RPC falla de milagro, intentamos el fallback tradicional (riesgo de timeout)
            const fallbackQuery = supabase
                .from('perfiles')
                .select('*, empresas(id, nombre_comercial, nit_rut, logo_url, verificado, sector_industrial)')
                .eq('id', userId)
                .maybeSingle();
            const fallback = await BaseService.handle(fallbackQuery, 15000, 'authService.getProfile (Fallback)');
            return fallback.data || null;
        }

        return data; // Devuelve { profile: {}, wallet: { saldo } }
    },

    /**
     * Actualizar Perfil de Usuario
     * Guarda cambios (plan, verificado, datos) en la DB.
     * @param {string} userId - ID del usuario (auth.uid)
     * @param {Object} updates - Objeto con los campos a actualizar
     */
    async updateProfile(userId, updates) {
        // 🔄 Mapeo Delegado (Senior Separation of Concerns)
        const rawPayload = profileMapper.mapUIToDB(updates);

        // ✅ WHITELIST: Solo columnas que existen en public.perfiles
        // Cualquier campo fuera de esta lista es ignorado — previene error 42703 de Postgres
        const PERFILES_COLUMNS = new Set([
            'nombre_display', 'telefono', 'bio', 'avatar_url',
            'direccion', 'lat', 'lng',
            'nombre_empresa', 'nit', 'sector',
            'skills', 'disponibilidad', 'experiencia_anios',
            'plan', 'configuraciones', 'on_vacation'
        ]);

        const dbPayload = Object.fromEntries(
            Object.entries(rawPayload).filter(([key]) => PERFILES_COLUMNS.has(key))
        );

        // 🛡️ PROTECCIÓN EXTRA: Nunca permitir modificar campos de seguridad
        delete dbPayload.verificado;
        delete dbPayload.saldo;
        delete dbPayload.rating;
        delete dbPayload.completed_shifts;
        delete dbPayload.reputation_score;
        delete dbPayload.reputation_count;
        delete dbPayload.rol;

        if (Object.keys(dbPayload).length === 0) {
            logger.warn('[authService.updateProfile] No hay campos válidos para actualizar en perfiles.');
            return null;
        }

        const { data, error } = await supabase
            .from('perfiles')
            .update(dbPayload)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        // 🏢 Sincronización con tabla empresas (columnas distintas)
        const empresaPayload = {};
        if (updates.company  !== undefined) empresaPayload.nombre_comercial  = updates.company;
        if (updates.nit      !== undefined) empresaPayload.nit_rut           = updates.nit;
        if (updates.sector   !== undefined) empresaPayload.sector_industrial  = updates.sector;
        if (updates.avatar   !== undefined) empresaPayload.logo_url           = updates.avatar;
        if (updates.lat      !== undefined) empresaPayload.lat                = updates.lat;
        if (updates.lng      !== undefined) empresaPayload.lng                = updates.lng;

        if (Object.keys(empresaPayload).length > 0) {
            const { error: empError } = await supabase
                .from('empresas')
                .update(empresaPayload)
                .eq('id', userId);
            if (empError) logger.warn('[authService.updateProfile] Error sync empresas:', empError.message);
        }

        return data;
    },

    /**
     * Obtener datos de una empresa por su ID único
     * @param {string} companyId 
     */
    async getCompanyById(companyId) {
        const query = supabase
            .from('empresas')
            .select('*')
            .eq('id', companyId)
            .maybeSingle();
        
        return await BaseService.handle(query, 5000, 'authService.getCompanyById');
    },

    /**
     * Actualizar Contraseña (Requiere sesión activa)
     */
    async updatePassword(newPassword) {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        if (error) throw error;
        return true;
    }
};
