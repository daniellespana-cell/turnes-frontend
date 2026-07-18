import { supabase } from './supabaseClient';
import { BaseService } from './base/BaseService';
import { logger } from '../utils/logger';

const CHANNEL_NAME = 'turnes-notifications-realtime';
const PAGE_SIZE = 30;

class NotificationObserver {
    constructor() {
        /** @type {Map<string, Set<Function>>} */
        this._subscribers = new Map();
        this._channel = null;
        this._subscriberId = null;
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
    connect(subscriberId) {
        if (this._channel && this._subscriberId === subscriberId) return;
        this.disconnect();
        this._subscriberId = subscriberId;

        const onChange = (event) => (payload) => {
            const rowData = event === 'DELETE' ? payload.old : payload.new;
            this._notify(event, rowData);
        };

        this._channel = supabase
            .channel(`${CHANNEL_NAME}-${subscriberId}`)
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'notificaciones'
            }, (payload) => {
                const event = payload.eventType; // INSERT, UPDATE, DELETE
                const rowData = event === 'DELETE' ? payload.old : payload.new;
                this._notify(event, rowData);
            })
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    logger.info('✅ [Observer] Realtime conectado:', subscriberId);
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
        this._subscriberId = null;
    }

    // --- DATA ACCESS ---

    async fetchHistory(subscriberId, page = 0, limit = PAGE_SIZE) {
        if (!subscriberId) return { data: [], error: null };
        
        const from = page * limit;
        const to = from + limit - 1;

        const query = supabase
            .from('notificaciones')
            .select('*')
            .order('created_at', { ascending: false })
            .range(from, to);
            
        const { data, error } = await BaseService.handle(query);
        if (error) { console.error('[Observer] fetchHistory error:', error); return { data: [], error }; }
        return { data: data ?? [], error: null };
    }

    async markAsRead(notificationId) {
        const query = supabase.from('notificaciones').update({ leida: true }).eq('id', notificationId);
        const { error } = await BaseService.handle(query);
        if (error) console.error('[Observer] markAsRead error:', error);
        return !error;
    }

    async markAllAsRead(subscriberId) {
        const query = supabase.from('notificaciones').update({ leida: true }).eq('leida', false);
        const { error } = await BaseService.handle(query);
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
     * @param {string} targetId - UUID del destinatario
     * @param {string} tipo - Tipo de evento ('PAYMENT_SUCCESS', etc.)
     * @param {string|null} referenceId - UUID de la postulación asociada
     * @param {object} metadata - Tokens para interpolación de strings
     */
    async dispatch(targetId, tipo, referenceId = null, metadata = {}) {
        if (!targetId || !tipo) { console.warn('[Observer] dispatch() sin targetId o tipo'); return; }
        const { error } = await supabase.rpc('rpc_create_notification', {
            p_user_id: targetId,
            p_tipo: tipo,
            p_reference_id: referenceId,
            p_metadata: metadata
        });
        if (error) console.error(`[Observer] dispatch ${tipo} falló:`, error);
    }
}

// Singleton: servicio de infraestructura, no vive en el árbol de React
export const notificationObserver = new NotificationObserver();
