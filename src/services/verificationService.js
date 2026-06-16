import { supabase } from './supabaseClient';
import { BaseService } from './base/BaseService';

/**
 * 🛡️ ADMIN VERIFICATION SERVICE
 * Maneja solicitudes de Verificación Elite — tanto el lado del usuario como el del admin.
 */
export const VerificationService = {

    /**
     * Sube un documento al Storage privado y retorna la ruta.
     * @param {File} file
     * @param {string} userId
     * @param {string} docType - 'cc' | 'rut_nit'
     */
    async uploadDocument(file, userId, docType) {
        const ext = file.name.split('.').pop();
        const path = `${userId}/${docType}_${Date.now()}.${ext}`;

        const { data, error } = await supabase.storage
            .from('verification-docs')
            .upload(path, file, { upsert: true });

        if (error) throw error;
        return { path: data.path, name: file.name, type: docType, size: file.size };
    },

    /**
     * Obtener URL temporal firmada para ver un documento (admin only)
     * @param {string} path
     */
    async getSignedUrl(path) {
        const { data, error } = await supabase.storage
            .from('verification-docs')
            .createSignedUrl(path, 3600); // 1 hora

        if (error) throw error;
        return data.signedUrl;
    },

    /**
     * Crear solicitud de verificación con documentos ya subidos.
     * Descuenta $20.000 del saldo. No otorga verificado=true.
     * @param {Array} documents - Array de { path, name, type }
     */
    async requestVerification(documents) {
        const query = supabase.rpc('rpc_request_verification', {
            docs: documents
        });
        return await BaseService.handle(query);
    },

    /**
     * Obtener el estado de la solicitud del usuario actual
     */
    async getMyRequest() {
        const query = supabase
            .from('verification_requests')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        return await BaseService.handle(query);
    },

    // ─── ADMIN ONLY ───────────────────────────────────────────────────────────

    /**
     * Obtener cola de solicitudes pendientes (Admin)
     * @param {string} status - 'pending' | 'in_review' | 'approved' | 'rejected' | 'all'
     */
    async getQueue(status = 'pending', limit = 20, offset = 0) {
        let query = supabase
            .from('verification_requests')
            .select(`
                *,
                perfiles (
                    id, nombre_display, avatar_url, verificado,
                    empresas (nombre_comercial, nit_rut, logo_url)
                )
            `)
            .order('created_at', { ascending: true })
            .range(offset, offset + limit - 1);

        if (status !== 'all') {
            query = query.eq('status', status);
        }

        return await BaseService.handle(query);
    },

    /**
     * Admin aprueba solicitud → verificado = true + notificación
     * @param {string} requestId
     * @param {string} notes - Notas opcionales del admin
     */
    async approve(requestId, notes = null) {
        const query = supabase.rpc('rpc_approve_verification', {
            p_request_id: requestId,
            p_notes: notes
        });
        return await BaseService.handle(query);
    },

    /**
     * Admin rechaza solicitud → reembolso automático + notificación
     * @param {string} requestId
     * @param {string} reason - Razón obligatoria del rechazo
     */
    async reject(requestId, reason) {
        if (!reason?.trim()) throw new Error('Debes proporcionar una razón para el rechazo.');
        const query = supabase.rpc('rpc_reject_verification', {
            p_request_id: requestId,
            p_rejection_reason: reason
        });
        return await BaseService.handle(query);
    },

    /**
     * Admin marca solicitud como "En revisión"
     * @param {string} requestId
     */
    async markInReview(requestId) {
        const query = supabase
            .from('verification_requests')
            .update({ status: 'in_review', updated_at: new Date().toISOString() })
            .eq('id', requestId)
            .select()
            .single();

        return await BaseService.handle(query);
    },

    /**
     * Suscribirse a cambios en la solicitud de verificación (Zero-F5)
     * @param {string} requestId 
     * @param {function} callback 
     */
    subscribeToRequestStatus(requestId, callback) {
        if (!requestId) return;
        return supabase
            .channel(`public:verification_requests:${requestId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'verification_requests',
                filter: `id=eq.${requestId}`
            }, callback)
            .subscribe();
    },

    unsubscribe(channel) {
        if (channel) supabase.removeChannel(channel);
    }

};

export default VerificationService;
