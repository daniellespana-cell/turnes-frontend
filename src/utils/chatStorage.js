
import { supabase } from '../services/supabaseClient';
import { authService } from '../services/authService';

export const EVENTS = {
    CHAT_UPDATE: 'turnes_chat_update',
    STATUS_CHANGE: 'turnes_chat_status'
};

class ChatStorageService {
    constructor() {
        this._listeners = new Set();
        this._activeSubscriptions = new Map();
        this._realtimeChannel = null; // Reference to the channel

        // Estado en Memoria (Cache Reactiva)
        this._snapshot = {
            conversations: {},
            messages: {},
            loading: true
        };

        this.subscribe = this.subscribe.bind(this);
        this.getSnapshot = this.getSnapshot.bind(this);

        this._init();
    }

    async _init() {
        // 1. Carga inicial (si ya hay sesión recuperada)
        const session = await authService.getSession();
        if (session) {
            await this._setupUser(session.user.id);
        }

        // 2. Observer de Auth (Para Logins/Logouts futuros)
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                await this._setupUser(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                this._teardown();
            }
        });
    }

    async _setupUser(userId) {
        if (this._currentUserId === userId) return; // Ya configurado
        this._currentUserId = userId;
        await this.loadConversations();
        this._setupGlobalRealtime(userId);
    }

    _teardown() {
        // Limpiar memoria y conexiones al salir
        if (this._realtimeChannel) {
            this._realtimeChannel.unsubscribe();
            this._realtimeChannel = null;
        }
        this._currentUserId = null;
        this._snapshot = { conversations: {}, messages: {}, loading: true };
        this._updateSnapshot({}); // Notificar a UI que se vació
    }

    // --- PUBLIC API ---

    subscribe(listener) {
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
    }

    getSnapshot() {
        return this._snapshot;
    }

    getHistory(chatId) {
        return this._snapshot.messages[chatId] || [];
    }

    async fetchMessages(chatId) {
        if (this._snapshot.messages[chatId]) return;

        const { data, error } = await supabase
            .from('mensajes')
            .select('*')
            .eq('conversacion_id', chatId)
            .order('created_at', { ascending: true });

        if (!error && data) {
            const formatted = data.map(this._formatMessage);
            this._updateSnapshot({
                messages: {
                    ...this._snapshot.messages,
                    [chatId]: formatted
                }
            });
        }
    }

    // UPDATED: Support for Type & Metadata
    async sendMessage(chatId, text, senderId, type = 'text', metadata = {}) {
        if (!text && type === 'text') return; // Empty Text guard

        // 1. Optimistic Update
        const tempId = `temp-${Date.now()}`;
        const optimisticMsg = {
            id: tempId,
            content: text || (type === 'offer' ? 'Oferta de Contrato' : 'Adjunto'),
            sender_id: senderId,
            tipo: type,
            metadata: metadata,
            created_at: new Date().toISOString(),
            status: 'sending'
        };

        this._performLocalAdd(chatId, this._formatMessageFromObj(optimisticMsg));

        // 2. Network Request
        try {
            const { data, error } = await supabase
                .from('mensajes')
                .insert({
                    conversacion_id: chatId,
                    sender_id: senderId,
                    content: text,
                    tipo: type,
                    metadata: metadata
                })
                .select()
                .single();

            if (error) throw error;

            // 3. Reconciliación
            this._replaceOptimisticMessage(chatId, tempId, this._formatMessage(data));

        } catch (error) {
            console.error("Send Failed", error);
            this._markMessageError(chatId, tempId);
        }
    }

    // --- INTERNAL LOGIC ---

    _formatMessage(dbMsg) {
        return {
            id: dbMsg.id,
            text: dbMsg.content,
            sender: dbMsg.sender_id,
            timestamp: dbMsg.created_at,
            isRead: dbMsg.is_read,
            type: dbMsg.tipo || 'text',
            metadata: dbMsg.metadata || {}
        };
    }

    // Helper para formatear el optimista que ya tiene estructura similar a DB o UI
    _formatMessageFromObj(obj) {
        return {
            id: obj.id,
            text: obj.content,
            sender: obj.sender_id,
            timestamp: obj.created_at,
            isRead: false,
            type: obj.tipo,
            metadata: obj.metadata,
            status: obj.status
        };
    }

    _performLocalAdd(chatId, msg) {
        const currentHistory = this._snapshot.messages[chatId] || [];
        this._updateSnapshot({
            messages: {
                ...this._snapshot.messages,
                [chatId]: [...currentHistory, msg]
            }
        });
    }

    _replaceOptimisticMessage(chatId, tempId, realMsg) {
        const currentHistory = this._snapshot.messages[chatId] || [];
        const updatedHistory = currentHistory.map(m =>
            m.id === tempId ? realMsg : m
        );
        this._updateSnapshot({
            messages: { ...this._snapshot.messages, [chatId]: updatedHistory }
        });
    }

    _markMessageError(chatId, tempId) {
        const currentHistory = this._snapshot.messages[chatId] || [];
        const updatedHistory = currentHistory.map(m =>
            m.id === tempId ? { ...m, status: 'error' } : m
        );
        this._updateSnapshot({
            messages: { ...this._snapshot.messages, [chatId]: updatedHistory }
        });
    }

    _updateSnapshot(partial) {
        this._snapshot = { ...this._snapshot, ...partial };
        this._listeners.forEach(l => l());
        this._emitEvent(EVENTS.CHAT_UPDATE, {});
    }

    _emitEvent(name, detail) {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(name, { detail }));
        }
    }

    // --- REALTIME ---

    async loadConversations() {
        const session = await authService.getSession();
        if (!session) return;

        const { data } = await supabase
            .from('conversaciones')
            .select(`
                id, updated_at,
                empresa:perfiles!conversaciones_empresa_id_fkey(nombre_display, id, avatar_url),
                postulante:perfiles!conversaciones_postulante_id_fkey(nombre_display, id, avatar_url)
            `)
            .or(`empresa_id.eq.${session.user.id},postulante_id.eq.${session.user.id}`)
            .order('updated_at', { ascending: false });

        if (data) {
            const convMap = {};
            data.forEach(c => convMap[c.id] = c);
            this._updateSnapshot({ conversations: convMap, loading: false });
        }
    }

    _setupGlobalRealtime(userId) {
        if (this._realtimeChannel) this._realtimeChannel.unsubscribe();

        this._realtimeChannel = supabase.channel('global-messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'mensajes',
                    filter: `sender_id=neq.${userId}`
                },
                (payload) => {
                    this._handleIncomingMessage(payload.new);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log("🟢 Chat Realtime Conectado");
                }
            });
    }

    _handleIncomingMessage(newMsg) {
        const chatId = newMsg.conversacion_id;
        if (this._snapshot.messages[chatId]) {
            const formatted = this._formatMessage(newMsg);
            this._performLocalAdd(chatId, formatted);
        }
        this._emitEvent(EVENTS.CHAT_UPDATE, { chatId });
    }
}

export const ChatStorage = new ChatStorageService();