import { supabase } from '../supabaseClient';
import { chatState } from './chatState';
import { chatOfflineStorage } from './chatOfflineStorage';

class ChatNetworkService {
    constructor() {
        this._fullyLoadedChats = new Set();
        this._cachedToken = null;
        this._realtimeChannel = null;

        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.flushOfflineQueue());
            if (navigator.onLine) {
                setTimeout(() => this.flushOfflineQueue(), 2000);
            }
        }

        supabase.auth.onAuthStateChange((event, session) => {
            this._cachedToken = session?.access_token || null;
            if (session?.user) {
                this.initRealtime(session.user.id);
            } else {
                this.stopRealtime();
            }
        });

        // 🛡️ RAZONAMIENTO PRO: Si ya hay sesión al cargar, iniciamos de inmediato
        this._initCheck();
    }

    async _initCheck() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            this._cachedToken = session.access_token;
            this.initRealtime(session.user.id);
        }
    }

    /**
     * 🛡️ NOTA: El motor realtime de mensajes se maneja de forma centralizada
     * en chatRealtime.js (canal 'global-chat-sync-v2') para evitar
     * procesamiento duplicado. chatNetwork solo gestiona HTTP y offline.
     */
    initRealtime(_userId) {
        // No-op: Delegado a chatRealtime.js
    }

    stopRealtime() {
        if (this._realtimeChannel) {
            supabase.removeChannel(this._realtimeChannel);
            this._realtimeChannel = null;
        }
    }

    // Proxy methods to chatState
    setActiveChat(chatId) {
        chatState.setActiveChat(chatId);
    }

    // --- Carga por Demanda --- //

    async fetchMessages(chatId) {
        if (this._fullyLoadedChats.has(chatId)) return;

        const { data, error } = await supabase
            .from('mensajes')
            .select('*')
            .eq('conversacion_id', chatId)
            .order('created_at', { ascending: false })
            .limit(150);

        if (!error && data) {
            this._fullyLoadedChats.add(chatId);
            const chronologicData = data.reverse();
            const formatted = chronologicData.map(dbMsg => chatState.formatMessage(dbMsg));

            chatState.updateSnapshot({
                messages: {
                    ...chatState.getSnapshot().messages,
                    [chatId]: formatted
                }
            });
        }
    }

    // --- ENTORNO OFFLINE Y ENVIO --- //

    async flushOfflineQueue() {
        const queue = chatOfflineStorage.getQueue();
        if (queue.length === 0) return;

        const sharedToken = this._cachedToken;
        if (!sharedToken) return;

        for (const meta of queue) {
            try {
                const dbMsg = await this._fireHttpInsert(meta.payload, sharedToken);
                chatOfflineStorage.remove(meta.tempId);
                const formatted = chatState.formatMessage(dbMsg);
                chatState.replaceMessageStatus(meta.payload.conversacion_id, meta.tempId, formatted);
            } catch (err) {
                chatState.replaceMessageStatus(meta.payload.conversacion_id, meta.tempId, { status: 'error' });
            }
        }
    }

    async sendMessage(chatId, text, senderId, type = 'text', metadata = {}) {
        if (!text && type === 'text') return;

        const tempId = `temp-${Date.now()}`;
        const payload = {
            conversacion_id: chatId,
            sender_id: senderId,
            content: text,
            tipo: type,
            metadata: metadata
        };

        const optimisticMsg = {
            id: tempId,
            ...payload,
            created_at: new Date().toISOString(),
            status: !navigator.onLine ? 'offline_pending' : 'sending'
        };

        chatState.addMessageLocal(chatId, chatState.formatMessageFromObj(optimisticMsg));

        if (!navigator.onLine) {
            chatOfflineStorage.save({ tempId, payload });
            return;
        }

        try {
            const dbMsg = await this._fireHttpInsert(payload);
            const formatted = chatState.formatMessage(dbMsg);
            chatState.replaceMessageStatus(chatId, tempId, formatted);
        } catch (error) {
            chatState.replaceMessageStatus(chatId, tempId, { status: 'error' });
            chatOfflineStorage.save({ tempId, payload });
        }
    }

    async markAsRead(chatId, myUserId) {
        if (!chatId) return;
        // Inmediatamente limpiar en estado local reactivo (0ms de latencia)
        chatState.markAsRead(chatId);

        if (!myUserId) return;
        const { error } = await supabase
            .from('mensajes')
            .update({ leido: true, is_read: true, read_at: new Date().toISOString() })
            .eq('conversacion_id', chatId)
            .neq('sender_id', myUserId);

        if (error) console.warn("[CHAT_NETWORK] No se pudo marcar leído:", error);
    }

    async markAllAsRead(myUserId) {
        // Inmediatamente limpiar en estado local reactivo (0ms de latencia)
        chatState.updateSnapshot({ unreadCounts: {} });

        if (!myUserId) return;
        const { error } = await supabase
            .from('mensajes')
            .update({ leido: true, is_read: true, read_at: new Date().toISOString() })
            .neq('sender_id', myUserId);

        if (error) console.warn("[CHAT_NETWORK] No se pudo marcar todo como leído:", error);
    }

    async _fireHttpInsert(payload, overrideToken = null) {
        const accessToken = overrideToken || this._cachedToken;
        if (!accessToken) throw new Error("No hay sesión activa cacheada.");

        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/mensajes`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`DB Error ${response.status}`);
        const responseData = await response.json();
        return responseData[0];
    }

    teardown() {
        this.stopRealtime();
        this._fullyLoadedChats.clear();
    }
}

export const chatNetwork = new ChatNetworkService();
