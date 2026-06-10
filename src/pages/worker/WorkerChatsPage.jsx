import React from 'react';
import ChatList from '../../components/chat/ChatList';

import { useWorkerChats } from '../../hooks/chat/useWorkerChats';
import { CHAT_STATUS_DISPLAY, CHAT_STATUS_COLOR } from '../../domain/chat.config';

const WorkerChatsPage = () => {
    const { chats } = useWorkerChats();

    // Normalizar el displayStatus para el contexto del postulante
    const normalizedChats = chats.map(c => ({
        ...c,
        displayStatus: CHAT_STATUS_DISPLAY[c.status] || CHAT_STATUS_DISPLAY.DEFAULT,
        statusColor: CHAT_STATUS_COLOR[c.status] || CHAT_STATUS_COLOR.DEFAULT,
        lastMessage: (c.lastSender === 'me' ? 'Tú: ' : '') + (c.lastMessage || ''),
    }));

    return (
        <div className="flex-1 flex flex-col animate-fade-in font-manrope overflow-hidden p-0 md:p-6">
            <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col min-h-0">
                {/* Container idéntico al de empresa — ChatList gestiona header, búsqueda y empty state */}
                <div className="flex-1 min-h-0 bg-black/30 overflow-hidden backdrop-blur-sm rounded-2xl">
                    <ChatList chats={normalizedChats} isDirectoryMode={true} />
                </div>
            </div>
        </div>
    );
};

export default WorkerChatsPage;
