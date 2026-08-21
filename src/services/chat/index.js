import { supabase } from '../supabaseClient';
import { authService } from '../authService';

import { chatState, EVENTS } from './chatState';
import { chatNetwork } from './chatNetwork';
import { chatRealtime } from './chatRealtime';
import { chatConversations } from './chatConversations';

/**
 * ⚡ ChatService (Orchestrator Facade)
 * Acts as the Orchestrator for State, Network, and Realtime modules.
 * In-Memory SSOT connected directly to Supabase Cloud & Realtime WebSockets.
 */
class ChatServiceFacade {
    constructor() {
        this._currentUserId = null;
        this._init();
    }

    async _init() {
        // 1. Carga inicial (si ya hay sesión recuperada)
        const session = await authService.getSession();
        if (session) {
            await this._setupUser(session.user.id);
        }

        // 2. Observer de Auth (Para Logins/Logouts y Persistencia)
        supabase.auth.onAuthStateChange(async (event, session) => {
            const validEvents = ['SIGNED_IN', 'INITIAL_SESSION', 'TOKEN_REFRESHED'];
            if (validEvents.includes(event) && session) {
                await this._setupUser(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                this._teardown();
            }
        });

        // 3. 🛡️ GLOBAL EVENT SYNC
        // Cuando la empresa hace "Match" o el postulante acepta una invitación,
        // la UI dispara este evento localmente.
        if (typeof window !== 'undefined') {
            window.addEventListener('turnes_postulacion_update', () => {
                if (this._currentUserId) {
                    chatConversations.loadConversations();
                }
            });

            // 4. 🚀 REALTIME NOTIFICATION BRIDGE
            // Como el RLS bloquea eventos genéricos de postulaciones a la empresa,
            // usamos la notificación en Realtime como señal segura para recargar los chats.
            window.addEventListener('turnes_notification_received', (e) => {
                const tipo = e.detail?.tipo;
                if (tipo === 'JOB_APPLIED' || tipo === 'MATCH_ESTABLISHED' || tipo === 'INVITATION_ACCEPTED') {
                    if (this._currentUserId) {
                        chatConversations.loadConversations();
                    }
                }
            });
        }
    }

    async _setupUser(userId) {
        if (this._currentUserId === userId) return; // Already setup
        this._currentUserId = userId;

        await chatConversations.loadConversations();
        chatRealtime.setupGlobalRealtime(userId);
    }

    _teardown() {
        chatRealtime.teardown();
        chatNetwork.teardown();
        chatState.clearSession();
        this._currentUserId = null;
    }

    // --- PUBLIC API MAPPINGS ---

    subscribe = (listener) => chatState.subscribe(listener);

    getSnapshot = () => chatState.getSnapshot();

    fetchMessages = (chatId) => chatNetwork.fetchMessages(chatId);

    sendMessage = (chatId, text, senderId, type = 'text', metadata = {}) =>
        chatNetwork.sendMessage(chatId, text, senderId, type, metadata);

    markAsRead = (chatId, _myUserId) => {
        chatState.markAsRead(chatId);
        return chatNetwork.markAsRead(chatId, _myUserId);
    };

    markAllAsRead = (_myUserId) => chatNetwork.markAllAsRead(_myUserId);
    
    setActiveChat = (chatId) => chatState.setActiveChat(chatId);

    updateSnapshot = (partial) => chatState.updateSnapshot(partial);

    manageChatVisibility = (chatId, action) => chatConversations.manageChatVisibility(chatId, action);

    loadConversations = () => chatConversations.loadConversations();

    // --- EXPOSED CONSTANTS ---
    EVENTS = EVENTS;
}

export const chatService = new ChatServiceFacade();
export const ChatStorage = chatService; // Alias de compatibilidad hacia atrás
export { EVENTS };
