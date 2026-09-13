import { describe, it, expect, beforeEach } from 'vitest';
import { chatState } from '../services/chat/chatState';

describe('Chat and Notification Domain Isolation (SSOT)', () => {
    const CHAT_ID = 'test-chat-uuid-123';
    const MY_USER_ID = 'user-me-456';
    const OTHER_USER_ID = 'user-other-789';

    beforeEach(() => {
        chatState.clearSession();
    });

    it('no incrementa unreadCounts cuando el mensaje es enviado por el usuario actual', () => {
        const myMessage = {
            id: 'msg-1',
            text: 'Hola, te escribo',
            sender: MY_USER_ID,
            timestamp: new Date().toISOString(),
            isRead: false,
            type: 'text'
        };

        chatState.addMessageLocal(CHAT_ID, myMessage, MY_USER_ID);

        const snapshot = chatState.getSnapshot();
        expect(snapshot.unreadCounts[CHAT_ID]).toBeUndefined();
    });

    it('incrementa unreadCounts cuando el mensaje proviene de otro usuario', () => {
        const incomingMessage = {
            id: 'msg-2',
            text: 'Hola, respuesta',
            sender: OTHER_USER_ID,
            timestamp: new Date().toISOString(),
            isRead: false,
            type: 'text'
        };

        chatState.addMessageLocal(CHAT_ID, incomingMessage, MY_USER_ID);

        const snapshot = chatState.getSnapshot();
        expect(snapshot.unreadCounts[CHAT_ID]).toBe(1);
    });

    it('limpia unreadCounts y marca historial como leído al ejecutar markAsRead', () => {
        const incomingMessage = {
            id: 'msg-3',
            text: 'Mensaje pendiente',
            sender: OTHER_USER_ID,
            timestamp: new Date().toISOString(),
            isRead: false,
            type: 'text'
        };

        chatState.addMessageLocal(CHAT_ID, incomingMessage, MY_USER_ID);
        expect(chatState.getSnapshot().unreadCounts[CHAT_ID]).toBe(1);

        chatState.markAsRead(CHAT_ID);

        const snapshotAfter = chatState.getSnapshot();
        expect(snapshotAfter.unreadCounts[CHAT_ID]).toBeUndefined();
        const history = chatState.getHistory(CHAT_ID);
        expect(history[0].isRead).toBe(true);
    });
});
