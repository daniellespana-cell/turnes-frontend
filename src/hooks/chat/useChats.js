import { useMemo, useSyncExternalStore } from 'react';
import { ChatStorage } from '../../utils/chatStorage';

/**
 * 🚀 useChats (Supabase Adapter - Company Side)
 * Maps relational conversation data to flat UI props for Company Dashboard.
 */
export const useChats = () => {

    const snapshot = useSyncExternalStore(
        ChatStorage.subscribe,
        ChatStorage.getSnapshot
    );

    const conversationsMap = snapshot?.conversations || {};
    const messagesMap = snapshot?.messages || {};
    const isLoading = snapshot?.loading || false;

    const activeChats = useMemo(() => {
        const list = Object.values(conversationsMap);
        if (list.length === 0) return [];

        return list.map(conv => {
            const msgs = messagesMap[conv.id] || [];
            const lastMsgObj = msgs.length > 0 ? msgs[msgs.length - 1] : null;

            return {
                id: conv.id,

                // Mapeo (Company ve al Postulante)
                name: conv.postulante?.nombre_display || "Candidato",
                photo: conv.postulante?.avatar_url || null, // Asegurar que loadConversations traiga esto
                role: "Candidato", // Hardcoded por ahora o traer de metadata

                // Metadata
                lastMessage: lastMsgObj ? lastMsgObj.text : "Conversación iniciada",
                lastSender: lastMsgObj ? (lastMsgObj.sender === 'me' ? 'me' : 'them') : null,
                senderId: lastMsgObj?.sender,
                unreadCount: 0,

                // Sorting
                lastActivityEpoch: new Date(conv.updated_at).getTime(),

                // Status Legacy (Placeholder)
                displayStatus: 'Activo',
                statusColor: 'blue',

                // Raw ref
                _raw: conv
            };
        })
            .sort((a, b) => b.lastActivityEpoch - a.lastActivityEpoch);

    }, [conversationsMap, messagesMap]);

    return {
        chats: activeChats,
        loading: isLoading
    };
};
