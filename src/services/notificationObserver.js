import { supabase } from './supabaseClient';
import { logger } from '../utils/logger';

const CHANNEL_NAME = 'turnes-notifications-realtime';
const PAGE_SIZE = 30;

class NotificationObserver {
    constructor() {
        /** @type {Map<string, Set<Function>>} */
        this._subscribers = new Map();
        this._channel = null;
        this._userId = null;
    }

    // --- OBSERVER API ---

    /** @returns {Function} Cleanup function for useEffect */
    subscribe(event, callback) {
        if (!this._subscribers.has(event)) this._subscribers.set(event, new Set());
        this._subscribers.get(event).add(callback);
        return () => this._subscribers.get(event)?.delete(callback);
    }

    _notify(event, payload) {
        const run = (cb) => { try { cb(payload); } catch (e) { console.error('[Observer] suscriptor falló:', e); } };
        this._subscribers.get(event)?.forEach(run);
        this._subscribers.get('ANY')?.forEach(cb => { try { cb({ event, payload }); } catch (e) { console.error('[Observer] ANY falló:', e); } });

        // 🛡️ Emitir evento global en INSERT para forzar re-renders SSOT (ej. recargar ChatList)
        if (event === 'INSERT' && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('turnes_notification_received', { detail: payload }));
        }
    }

    // --- REALTIME ---

    /** Conecta el canal Supabase Realtime para el usuario autenticado. */
    connect(userId) {
        if (this._channel && this._userId === userId) return;
        this.disconnect();
        this._userId = userId;

        const onChange = (event) => (payload) => {
            const rowData = event === 'DELETE' ? payload.old : payload.new;
            this._notify(event, rowData);
        };

        this._channel = supabase
            .channel(`${CHANNEL_NAME}-${userId}`)
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'notificaciones',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                const event = payload.eventType; // INSERT, UPDATE, DELETE
                const rowData = event === 'DELETE' ? payload.old : payload.new;
                this._notify(event, rowData);
            })
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    logger.info('✅ [Observer] Realtime conectado:', userId);
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.warn(`[Observer] Aviso Realtime (${status}): La conexión podría estar inestable.`);
                }
                // Silenciamos explícitamente el 'CLOSED' porque es el comportamiento normal al hacer logout
            });
    }

    disconnect() {
        if (!this._channel) return;
        supabase.removeChannel(this._channel);
        this._channel = null;
        this._userId = null;
    }

    // --- DATA ACCESS ---

    async fetchHistory(userId, limit = PAGE_SIZE) {
        if (!userId) return [];
        const { data, error } = await supabase
            .from('notificaciones')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) { console.error('[Observer] fetchHistory error:', error); return []; }
        return data ?? [];
    }

    async markAsRead(notificationId) {
        const { error } = await supabase.from('notificaciones').update({ leida: true }).eq('id', notificationId);
        if (error) console.error('[Observer] markAsRead error:', error);
        return !error;
    }

    async markAllAsRead(userId) {
        const { error } = await supabase.from('notificaciones').update({ leida: true }).eq('user_id', userId).eq('leida', false);
        if (error) console.error('[Observer] markAllAsRead error:', error);
        return !error;
    }

    async deleteNotification(notificationId) {
        const { data, error } = await supabase.rpc('rpc_delete_notification', {
            p_notification_id: notificationId
        });
        if (error) {
            console.error('[Observer] deleteNotification RPC error:', error);
            throw error;
        }
        // data = false significa que no era suya (no debería pasar en uso normal)
        if (data === false) {
            console.warn('[Observer] deleteNotification: notificación no encontrada o no autorizada');
            throw new Error('NOT_OWNER');
        }
        return true;
    }

    /**
     * Inserta una notificación para otro usuario vía RPC SECURITY DEFINER.
     * @param {string} targetUserId - UUID del destinatario
     * @param {string} tipo - Tipo de evento ('PAYMENT_SUCCESS', etc.)
     * @param {string|null} referenceId - UUID de la postulación asociada
     * @param {object} metadata - Tokens para interpolación de strings
     */
    async dispatch(targetUserId, tipo, referenceId = null, metadata = {}) {
        if (!targetUserId || !tipo) { console.warn('[Observer] dispatch() sin targetUserId o tipo'); return; }
        const { error } = await supabase.rpc('rpc_create_notification', {
            p_user_id: targetUserId,
            p_tipo: tipo,
            p_reference_id: referenceId,
            p_metadata: metadata
        });
        if (error) console.error(`[Observer] dispatch ${tipo} falló:`, error);
    }
}

// Singleton: servicio de infraestructura, no vive en el árbol de React
export const notificationObserver = new NotificationObserver();
