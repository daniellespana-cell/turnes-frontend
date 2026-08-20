export const EVENTS = {
    CHAT_UPDATE: 'turnes_chat_update',
    STATUS_CHANGE: 'turnes_chat_status'
};

class ChatStateService {
    constructor() {
        this._listeners = new Set();
        this._activeChatId = null; // 🆕 Track current view

        // Estado en Memoria (Cache Reactiva)
        this._snapshot = {
            conversations: {},
            messages: {},
            unreadCounts: {}, // 🆕 { chatId: number }
            onlineUsers: {}, // 🟢 { [userId: string]: true }
            loading: true
        };

        this.getSnapshot = this.getSnapshot.bind(this);
        this.subscribe = this.subscribe.bind(this);
    }

    // --- REACCIÓN --- //

    subscribe(listener) {
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
    }

    getSnapshot() {
        return this._snapshot;
    }

    setActiveChat(chatId) {
        this._activeChatId = chatId;
        if (chatId) this.markAsRead(chatId);
    }

    updateSnapshot(partial) {
        this._snapshot = { ...this._snapshot, ...partial };
        this._listeners.forEach(l => l());
        this.emitGlobalEvent(EVENTS.CHAT_UPDATE, {});
    }

    emitGlobalEvent(name, detail) {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(name, { detail }));
        }
    }

    // --- LOGICA DE NO LEÍDOS (Descentralizada) --- //

    incrementUnread(chatId) {
        // Solo incrementamos si el chat NO es el que el usuario está viendo actualmente
        if (this._activeChatId === chatId) return;

        const currentCount = this._snapshot.unreadCounts[chatId] || 0;
        this.updateSnapshot({
            unreadCounts: {
                ...this._snapshot.unreadCounts,
                [chatId]: currentCount + 1
            }
        });
    }

    markAsRead(chatId) {
        if (!chatId || !this._snapshot.unreadCounts[chatId]) return;

        this.updateSnapshot({
            unreadCounts: {
                ...this._snapshot.unreadCounts,
                [chatId]: 0
            }
        });
    }

    // --- GESTIÓN DE PRESENCIA EN TIEMPO REAL (SSOT) --- //

    setOnlineUsers(usersMapOrSet) {
        const onlineMap = {};
        if (usersMapOrSet instanceof Set) {
            usersMapOrSet.forEach(id => { if (id) onlineMap[id] = true; });
        } else if (Array.isArray(usersMapOrSet)) {
            usersMapOrSet.forEach(id => { if (id) onlineMap[id] = true; });
        } else if (typeof usersMapOrSet === 'object' && usersMapOrSet !== null) {
            Object.assign(onlineMap, usersMapOrSet);
        }
        this.updateSnapshot({ onlineUsers: onlineMap });
    }

    addOnlineUser(userId) {
        if (!userId) return;
        if (this._snapshot.onlineUsers[userId]) return; // Ya está online
        this.updateSnapshot({
            onlineUsers: {
                ...this._snapshot.onlineUsers,
                [userId]: true
            }
        });
    }

    removeOnlineUser(userId) {
        if (!userId) return;
        if (!this._snapshot.onlineUsers[userId]) return; // Ya estaba offline
        const updated = { ...this._snapshot.onlineUsers };
        delete updated[userId];
        this.updateSnapshot({ onlineUsers: updated });
    }

    isUserOnline(userId) {
        if (!userId) return false;
        return Boolean(this._snapshot.onlineUsers?.[userId]);
    }

    // --- MANEJO DE ARRAY DE MENSAJES --- //

    getHistory(chatId) {
        return this._snapshot.messages[chatId] || [];
    }

    getConversations() {
        return this._snapshot.conversations || {};
    }

    /**
     * 🔥 SYNC SENIOR: Reemplazo total (Evita fantasmas)
     */
    setConversations(conversationsMap) {
        this.updateSnapshot({ 
            conversations: conversationsMap,
            loading: false 
        });
    }

    formatMessage(dbMsg) {
        return {
            id: dbMsg.id,
            text: dbMsg.content,
            sender: dbMsg.sender_id,
            timestamp: dbMsg.created_at,
            isRead: dbMsg.leido === true || dbMsg.is_read === true,
            type: dbMsg.tipo || 'text',
            metadata: dbMsg.metadata || {},
            status: 'sent'
        };
    }

    /**
     * Mapeador Obj Crudo -> UI (Para optimismo)
     */
    formatMessageFromObj(obj) {
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

    addMessageLocal(chatId, msg) {
        if (!chatId || !msg?.id) return;

        const currentHistory = this.getHistory(chatId);
        const alreadyExists = currentHistory.some(m => m.id === msg.id);
        if (alreadyExists) return;

        // 🔥 LOGICA SENIOR: Notificar no leído si es un mensaje entrante
        // Nota: msg.sender es el UUID del que envía.
        this.incrementUnread(chatId);

        let newConversations = this._snapshot.conversations;
        if (newConversations[chatId]) {
            newConversations = {
                ...newConversations,
                [chatId]: {
                    ...newConversations[chatId],
                    lastMessage: msg.text, // 🆕 Actualización de preview
                    lastMessageTime: msg.timestamp, // 🆕 Actualización de tiempo
                    updated_at: new Date().toISOString()
                }
            };
        }

        const newChatHistory = [...currentHistory, msg];

        this.updateSnapshot({
            messages: {
                ...this._snapshot.messages,
                [chatId]: newChatHistory
            },
            conversations: newConversations
        });
    }

    replaceMessageStatus(chatId, messageId, newPayload) {
        const currentHistory = this.getHistory(chatId);
        const updatedHistory = currentHistory.map(m =>
            m.id === messageId ? { ...m, ...newPayload } : m
        );
        this.updateSnapshot({
            messages: { ...this._snapshot.messages, [chatId]: updatedHistory }
        });
    }

    clearSession() {
        this._snapshot = { conversations: {}, messages: {}, unreadCounts: {}, onlineUsers: {}, loading: true };
        this.updateSnapshot({});
    }
}

export const chatState = new ChatStateService();
