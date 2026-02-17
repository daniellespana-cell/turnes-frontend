import { useMemo, useSyncExternalStore } from 'react';
import { ChatStorage } from '../../utils/chatStorage';

/**
 * 🚀 useWorkerChats (Supabase Adapter)
 * Adapta el nuevo store relacional a la interfaz plana que espera la UI.
 */
export const useWorkerChats = () => {

    const snapshot = useSyncExternalStore(
        ChatStorage.subscribe,
        ChatStorage.getSnapshot
    );

    // Nuevas estructuras del ChatStorage
    const conversationsMap = snapshot?.conversations || {};
    const messagesMap = snapshot?.messages || {};
    const isLoading = snapshot?.loading || false;

    const activeChats = useMemo(() => {
        const list = Object.values(conversationsMap);
        if (list.length === 0) return [];

        return list.map(conv => {
            // 1. Obtener último mensaje real del store (in-memory)
            const msgs = messagesMap[conv.id] || [];
            const lastMsgObj = msgs.length > 0 ? msgs[msgs.length - 1] : null;

            // 2. Determinar estado
            // (En v2 el 'estado' del turno vive en la tabla Turnos, aquí usamos placeholder o si el chat trajo data extra)
            // Por ahora asumimos 'NEGOTIATING' si hay chat abierto.
            const derivedStatus = 'NEGOTIATING';

            return {
                id: conv.id,

                // Mapeo Relacional -> UI Flat
                // Si soy worker, la 'otra parte' es la empresa
                displayName: conv.empresa?.nombre_comercial || "Empresa",
                avatarUrl: conv.empresa?.avatar_url || null, // Requiere join extra en query, fallback en UI
                contextRole: "Desarrollador React", // Placeholder o traer del turno relacionado

                // Metadata de Mensajería
                lastMessage: lastMsgObj ? lastMsgObj.text : "Inicio de conversación",
                lastSender: lastMsgObj ? (lastMsgObj.sender === 'me' ? 'me' : 'them') : null, // Ajustar lógica de 'me' en ChatStorage
                // Nota: ChatStorage.formatMessage no pone 'me', pone UUID. UI debe comparar con auth.uid, 
                // pero aquí lo dejamos pasar o ajustamos si 'lastSender' se usa para estilos.
                senderId: lastMsgObj?.sender,

                unreadCount: 0, // Implementar conteo real después

                lastActivityEpoch: new Date(conv.updated_at).getTime(),
                status: derivedStatus
            };
        })
            .sort((a, b) => b.lastActivityEpoch - a.lastActivityEpoch);

    }, [conversationsMap, messagesMap]);

    return {
        chats: activeChats,
        isEmpty: activeChats.length === 0,
        loading: isLoading
    };
};