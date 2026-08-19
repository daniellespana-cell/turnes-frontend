import { supabase } from '../supabaseClient';
import { chatState, EVENTS } from './chatState';
import { chatConversations } from './chatConversations';
import { logger } from '../../utils/logger';

/**
 * ⚡ ChatRealtimeService (v2.0 — Dual-Channel)
 *
 * Escucha DOS flujos en un solo canal de Supabase Realtime:
 *   1. mensajes (INSERT/UPDATE) → Actualización instantánea del historial de chat
 *   2. postulaciones (UPDATE de status) → Refresco de la lista de conversaciones
 *
 * El punto 2 resuelve el bug donde un match nuevo no aparecía en la bandeja
 * hasta que el usuario recargaba la página manualmente.
 */

// Statuses que implican que una conversación debe ser visible en la bandeja
export const CHAT_VISIBLE_STATUSES = ['chat_abierto', 'contratado', 'aceptado', 'en_progreso'];

class ChatRealtimeService {
    constructor() {
        this._msgChannel = null;
        this._convChannel = null;
        this._refreshDebounce = null;
    }

    setupGlobalRealtime(userId) {
        this.teardown();

        // ── CANAL 1: Mensajes (Alta Prioridad) ───────────────────────
        // Este canal no tiene filtros para asegurar que el RLS de Supabase 
        // maneje la seguridad y los eventos lleguen sin obstrucción.
        this._msgChannel = supabase.channel(`msgs-${userId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'mensajes' },
                (payload) => this._handleIncomingMessage(payload.new)
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'mensajes' },
                (payload) => this._handleUpdatedMessage(payload.new)
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') logger.info("✅ Realtime Mensajes: OK");
            });

        // ── CANAL 2: Postulaciones/Match (Baja Prioridad) ───────────
        // Refresca la bandeja cuando hay cambios en el estado de las postulaciones.
        this._convChannel = supabase.channel(`convs-${userId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'postulaciones' },
                (payload) => {
                    const row = payload.new || payload.old;
                    if (!row) return;
                    // Refrescamos la lista de conversaciones
                    this._debouncedRefresh();
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') logger.info("✅ Realtime Bandeja: OK");
            });

        // ── AUTO-SYNC EN BACKGROUND / FOREGROUND ────────────────────
        // Cuando el usuario sale a WhatsApp y vuelve, el WebSocket se reconecta,
        // pero los mensajes enviados durante ese lapso se pierden.
        // Solución: Refrescar la base de datos completa al retomar el foco.
        if (typeof window !== 'undefined') {
            this._handleVisibility = () => {
                if (document.visibilityState === 'visible') {
                    logger.info("🔄 App retornó al primer plano. Sincronizando chats...");
                    this._debouncedRefresh(); // Recarga la bandeja
                    
                    // Si el usuario está viendo un chat específico, recargarlo completo
                    if (chatState._activeChatId) {
                        import('./chatNetwork').then(module => {
                            module.chatNetwork.fetchMessages(chatState._activeChatId);
                        });
                    }
                }
            };
            document.addEventListener('visibilitychange', this._handleVisibility);
            window.addEventListener('focus', this._handleVisibility);
        }
    }

    // ── HANDLERS ─────────────────────────────────────────────────────────

    _handleIncomingMessage(row) {
        if (!row || !row.conversacion_id) return;
        
        const snapshot = chatState.getSnapshot();
        const hasConversation = !!snapshot.conversations[row.conversacion_id];
        
        const msg = chatState.formatMessage(row);
        chatState.addMessageLocal(row.conversacion_id, msg);
        
        // Si es un chat nuevo que no tenemos en memoria, forzamos recarga relacional
        if (!hasConversation) {
            this._debouncedRefresh();
        }
        chatState.emitGlobalEvent(EVENTS.CHAT_UPDATE, { chatId: row.conversacion_id });
    }

    _handleUpdatedMessage(updatedMsg) {
        const chatId = updatedMsg.conversacion_id;
        const currentHistory = chatState.getHistory(chatId);

        if (currentHistory.length > 0) {
            const formatted = chatState.formatMessage(updatedMsg);
            chatState.replaceMessageStatus(chatId, formatted.id, formatted);
        }
    }

    /**
     * 🔥 ACTUALIZACIÓN: Cuando una postulación cambia o se crea, refrescamos
     * la lista completa. Eliminamos restricciones de status para asegurar
     * que invitaciones y aplicaciones nuevas sean visibles de inmediato.
     */
    _handlePostulacionUpdate(_newRow, _oldRow) {
        // Refrescamos ante cualquier cambio relevante en la tabla de postulaciones
        this._debouncedRefresh();
    }

    _debouncedRefresh() {
        if (this._refreshDebounce) clearTimeout(this._refreshDebounce);
        this._refreshDebounce = setTimeout(() => {
            chatConversations.loadConversations().then(() => {
                // 🔥 CRÍTICO: Disparar actualización global del protocolo
                // para que cualquier chat ABIERTO se bloquee en tiempo real
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('turnes_contract_update'));
                }
            });
        }, 500);
    }

    // ── LIFECYCLE ────────────────────────────────────────────────────────

    teardown() {
        if (this._msgChannel) {
            supabase.removeChannel(this._msgChannel);
            this._msgChannel = null;
        }
        if (this._convChannel) {
            supabase.removeChannel(this._convChannel);
            this._convChannel = null;
        }
        if (this._refreshDebounce) {
            clearTimeout(this._refreshDebounce);
            this._refreshDebounce = null;
        }
        if (typeof window !== 'undefined' && this._handleVisibility) {
            document.removeEventListener('visibilitychange', this._handleVisibility);
            window.removeEventListener('focus', this._handleVisibility);
            this._handleVisibility = null;
        }
    }
}

export const chatRealtime = new ChatRealtimeService();
