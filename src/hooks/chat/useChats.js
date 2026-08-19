import { useMemo, useSyncExternalStore } from 'react';
import { ChatStorage } from '../../services/chat';
import { useAuth } from '../../context/AuthContext';

/**
 * 🚀 useChats (Supabase Adapter - Company Side)
 * Maps relational conversation data to flat UI props for Company Dashboard.
 */
export const useChats = () => {
    const { user } = useAuth();
    const snapshot = useSyncExternalStore(
        ChatStorage.subscribe,
        ChatStorage.getSnapshot
    );

    const conversations = snapshot?.conversations;
    const messages = snapshot?.messages;
    const isLoading = snapshot?.loading || false;

    const activeChats = useMemo(() => {
        const conversationsMap = conversations || {};
        const messagesMap = messages || {};
        const list = Object.values(conversationsMap);
        if (list.length === 0) return [];

        return list.map(conv => {
            const msgs = messagesMap[conv.id] || [];
            const lastMsgObj = msgs.length > 0 ? msgs[msgs.length - 1] : null;

            // Check Visibility Constraints per User
            const visibilityStatus = conv.protocol_state?.visibility?.[user?.id];

            // Si está archivado o eliminado por mí, no lo renderizo en la principal
            if (visibilityStatus === 'archive' || visibilityStatus === 'delete' || visibilityStatus === 'block') {
                return null;
            }

            // Status Real desde DB
            const derivedStatus = conv.status || 'pendiente';

            // 🔥 SENIOR FIX: Evitar que postulaciones sin MATCH aparezcan como chats
            if (derivedStatus === 'pendiente') {
                return null;
            }

            return {
                id: conv.id,

                // Mapeo (Company ve al Postulante)
                name: conv.postulante?.nombre_display || "Candidato",
                avatar: conv.postulante?.avatar_url || null,
                role: "Candidato",

                // Metadata
                lastMessage: lastMsgObj ? lastMsgObj.text : "Conversación iniciada",
                lastSender: lastMsgObj ? (lastMsgObj.sender === 'me' ? 'me' : 'them') : null,
                senderId: lastMsgObj?.sender,
                unreadCount: 0,

                // Sorting
                lastActivityEpoch: new Date(conv.updated_at).getTime(),

                // Status Real desde DB
                status: derivedStatus,
                step: conv.step,
                isClosed: ['finalizado', 'rechazado'].includes(derivedStatus) || conv.step === 4,
                protocol_state: conv.protocol_state,

                // Raw ref
                _raw: conv
            };
        })
            .filter(Boolean)
            .sort((a, b) => b.lastActivityEpoch - a.lastActivityEpoch);

    }, [conversations, messages, user?.id]);

    return {
        chats: activeChats,
        loading: isLoading
    };
};
