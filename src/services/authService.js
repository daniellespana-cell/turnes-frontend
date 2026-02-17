import { supabase } from './supabaseClient';

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
     */
    async loginWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Redirigir al dashboard tras login exitoso
                redirectTo: `${window.location.origin}/dashboard`,
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
        console.group("🚀 Registration Attempt (AuthService)");
        console.log("Email:", email);
        console.log("Metadata:", metadata);
        console.groupEnd();

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
                data: finalMetadata
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
     * Recuperar Perfil Público (desde public.perfiles)
     * Auth solo tiene email/id. El perfil rico está en la tabla pública.
     */
    async getProfile(userId) {
        const { data, error } = await supabase
            .from('perfiles')
            .select(`
        *,
        empresas(*) -- Si es empresa, traemos sus datos extra
      `)
            .eq('id', userId)
            .single();

        if (error) {
            console.warn("Perfil no encontrado, puede ser delay de replicación o primer login.");
            return null;
        }
        return data;
    }
};
