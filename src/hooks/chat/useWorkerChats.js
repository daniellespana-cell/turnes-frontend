import { useMemo, useSyncExternalStore } from 'react';
import { ChatStorage } from '../../services/chat';
import { useAuth } from '../../context/AuthContext';

/**
 * 🚀 useWorkerChats (Supabase Adapter)
 * Adapta el nuevo store relacional a la interfaz plana que espera la UI.
 */
export const useWorkerChats = () => {
    const { user } = useAuth();
    const snapshot = useSyncExternalStore(
        ChatStorage.subscribe,
        ChatStorage.getSnapshot
    );

    // Nuevas estructuras del ChatStorage
    const conversations = snapshot?.conversations;
    const messages = snapshot?.messages;
    const isLoading = snapshot?.loading || false;

    const activeChats = useMemo(() => {
        const conversationsMap = conversations || {};
        const messagesMap = messages || {};
        const list = Object.values(conversationsMap);
        if (list.length === 0) return [];

        return list.map(conv => {
            // 1. Obtener último mensaje real del store (in-memory)
            const msgs = messagesMap[conv.id] || [];
            const lastMsgObj = msgs.length > 0 ? msgs[msgs.length - 1] : null;

            // 🛡️ RAZONAMIENTO PRO: A diferencia de la empresa, el trabajador 
            // SIEMPRE quiere ver sus aplicaciones, incluso si están en 'pendiente'
            // y no tienen mensajes aún. Solo filtramos si hay una acción explícita de borrar/archivar.
            const visibilityStatus = conv.protocol_state?.visibility?.[user?.id];
            if (visibilityStatus === 'archive' || visibilityStatus === 'delete' || visibilityStatus === 'block') {
                return null;
            }

            return {
                id: conv.id,

                // Mapeo Relacional -> UI Flat (Usando la estructura unificada de ChatStorage)
                name: conv.empresa?.nombre_comercial || "Empresa",
                avatar: conv.empresa?.logo_url || null,
                contextRole: conv.vacante?.titulo || "Talento Turnes",

                // Metadata de Mensajería
                lastMessage: lastMsgObj ? lastMsgObj.text : "Postulación enviada",
                lastSender: lastMsgObj ? (lastMsgObj.sender === 'me' ? 'me' : 'them') : null,
                senderId: lastMsgObj?.sender,

                unreadCount: 0, // El store global maneja esto vía snapshot.unreadCounts

                lastActivityEpoch: new Date(conv.updated_at).getTime(),
                status: conv.status || 'pendiente',
                step: conv.step,
                isClosed: ['finalizado', 'rechazado'].includes(conv.status) || conv.step === 4,
                protocol_state: conv.protocol_state,
                otherUserId: conv.otherUserId || conv.empresa_id || conv.companyId || conv.empresa?.id || conv.vacante?.empresa_id,
                companyId: conv.companyId || conv.empresa_id || conv.empresa?.id || conv.vacante?.empresa_id,
                candidateId: conv.candidateId || conv.postulante_id || conv.postulante?.id
            };
        })
            .filter(Boolean)
            .sort((a, b) => b.lastActivityEpoch - a.lastActivityEpoch);

    }, [conversations, messages, user?.id]);

    return {
        chats: activeChats,
        isEmpty: activeChats.length === 0,
        loading: isLoading
    };
};