import React from 'react';
import { ChatList } from '../../components/chat/ChatList';
import { useWorkerChats } from '../../hooks/chat/useWorkerChats';
import EmptyState from '../../components/common/EmptyState';
import { MessageCircle } from 'lucide-react';

const WorkerChatsPage = () => {
    const { chats } = useWorkerChats();

    return (
        <div className="h-[calc(100vh-5rem)] border-t border-white/5 animate-fade-in font-manrope overflow-hidden p-0 md:p-6">
            <div className="max-w-3xl mx-auto h-full flex flex-col">
                {/* HEADLINE (Optional, or kept clean like Business) */}
                <div className="mb-4 px-2 md:px-0">
                    <h1 className="text-xl font-bold text-white">Mensajes</h1>
                    <p className="text-xs text-zinc-400">Tus conversaciones con empresas</p>
                </div>

                {/* Container "Messenger Style" */}
                {chats.length > 0 ? (
                    <div className="flex-1 min-h-0 bg-black/40 border-x border-white/5 overflow-hidden backdrop-blur-sm rounded-2xl border-y">
                        <ChatList
                            chats={chats.map(c => ({
                                ...c,
                                displayStatus: c.status === 'HIRED' ? 'Contratado 🎉' :
                                    c.status === 'NEGOTIATING' ? 'En Validación' :
                                        'Postulación Enviada',
                                statusColor: c.status === 'HIRED' ? 'green' :
                                    c.status === 'NEGOTIATING' ? 'purple' :
                                        'gray',
                                // Visual Formatting for Last Message
                                lastMessage: (c.lastSender === 'me' ? 'Tú: ' : '') + c.lastMessage
                            }))}
                            isDirectoryMode={true}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <EmptyState
                            icon={MessageCircle}
                            title="Sin Mensajes"
                            description="Tus conversaciones con las empresas aparecerán aquí cuando te postules."
                            compact={false}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkerChatsPage;
