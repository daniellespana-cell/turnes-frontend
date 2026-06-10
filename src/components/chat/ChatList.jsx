import { Search, ChevronLeft } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import ChatListItem from './ChatListItem';
import ChatActionModal from './ChatActionModal';

import React, { useEffect, useSyncExternalStore } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { typography } from '../../styles/typography';
import { chatConversations } from '../../services/chat/chatConversations';
import { ChatStorage } from '../../services/chat';

export const ChatList = ({ chats: initialChats, isDirectoryMode = false, backPath = '/dashboard' }) => {
    const navigate = useNavigate();
    const { id: activeChatId } = useParams();
    const { user } = useAuth();

    const isBusiness = user?.role === 'empresa';
    const emptyDescription = isBusiness 
        ? "Tus conversaciones con candidatos aparecerán aquí." 
        : "Tus postulaciones e invitaciones aparecerán aquí.";

    // 🛡️ REACCIÓN GLOBAL: Escuchar cambios en cualquier conversación (Realtime)
    const snapshot = useSyncExternalStore(ChatStorage.subscribe, ChatStorage.getSnapshot);
    
    // Unir la "Verdad" del estado reactivo con la lista base proporcionada por el hook
    const chats = (initialChats || []).map(baseChat => {
        const reactiveData = snapshot.conversations[baseChat.id] || {};
        return { ...baseChat, ...reactiveData };
    });

    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedChat, setSelectedChat] = React.useState(null);
    const [selectedAction, setSelectedAction] = React.useState(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    // 🚀 SINCRONIZACIÓN BAJO DEMANDA: Asegurar que al entrar a la bandeja tengamos datos frescos
    useEffect(() => {
        chatConversations.loadConversations();
    }, []);

    const handleActionClick = (chat, action) => {
        setSelectedChat(chat);
        setSelectedAction(action);
        setIsModalOpen(true);
    };

    // Filtro de búsqueda resiliente
    const filteredChats = chats.filter(c => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            c.name?.toLowerCase().includes(search) || 
            c.lastMessage?.toLowerCase().includes(search) ||
            c.contextRole?.toLowerCase().includes(search)
        );
    });

    const handleConfirmAction = async (actionType) => {
        if (!selectedChat) return;
        try {
            await chatConversations.manageChatVisibility(selectedChat.id, actionType);
            // Refrescar caché maestro después de ocultar el chat
            await chatConversations.loadConversations();

            // Si el chat activo es el que fue eliminado/archivado, sacarlo a la vista general
            if (activeChatId === String(selectedChat.id)) {
                navigate('/dashboard/chat');
            }
        } catch (error) {
            console.error("No se pudo ejecutar la acción del chat", error);
        } finally {
            setIsModalOpen(false);
            setSelectedChat(null);
            setSelectedAction(null);
        }
    };



    return (
        <div className={`flex flex-col h-full ${!isDirectoryMode && 'border-r border-white/5 w-full md:w-[26rem]'} shrink-0 bg-[#060606]`}>

            {/* Header: Title Left, Search Right (Inline Premium) */}
            <div className="flex flex-col gap-4 px-5 pt-6 pb-4 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(backPath)}
                        className="p-1.5 -ml-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
                        title="Volver"
                    >
                        <ChevronLeft size={22} className="stroke-[2.5px]" />
                    </button>
                    <h1 className={`${typography.entityName} text-[22px] tracking-tight font-extrabold text-white/90`}>Mensajes</h1>
                </div>

                {/* Search Bar Premium */}
                <div className="relative group w-full">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                        <Search size={14} className="text-zinc-500 group-focus-within:text-emerald-400 transition-colors duration-300" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar en mensajes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900/50 hover:bg-zinc-900 focus:bg-zinc-900 border border-transparent focus:border-emerald-500/30 rounded-full pl-10 pr-4 py-2 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300"
                    />
                </div>
            </div>

            {/* Lista Scrollable */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-0.5">
                {filteredChats.length === 0 ? (
                    <EmptyState
                        icon={MessageSquare}
                        title="Bandeja vacía"
                        description={emptyDescription}
                        compact={true}
                    />
                ) : (
                    filteredChats.map((chat) => (
                        <ChatListItem
                            key={chat.id}
                            chat={chat}
                            isActive={String(chat.id) === String(activeChatId)}
                            onClick={() => navigate(`/dashboard/chat/${chat.id}`)}
                            onActionClick={handleActionClick}
                        />
                    ))
                )}
            </div>

            {/* Portal Modal Actions */}
            <ChatActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmAction}
                actionType={selectedAction}
                candidateName={selectedChat?.name || selectedChat?.candidateName || selectedChat?.companyName || 'Usuario'}
            />
        </div>
    );
};

export default ChatList;
