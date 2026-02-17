import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageSquare, Search, Archive, Zap, ChevronLeft } from 'lucide-react';
import { typography } from '../../styles/typography';
import EmptyState from '../common/EmptyState';

export const ChatList = ({ chats, isDirectoryMode = false }) => {
    const navigate = useNavigate();
    const { id: activeChatId } = useParams();

    // Helper para simular tiempos realistas si no hay backend
    const getChatTime = (index) => {
        if (index === 0) return 'Ahora';
        if (index === 1) return '5 min';
        if (index === 2) return '1 h';
        if (index === 3) return '3 h';
        return '1 d';
    }

    return (
        <div className={`flex flex-col h-full ${!isDirectoryMode && 'border-r border-white/5 w-full md:w-96'} shrink-0`}>

            {/* Header: Title Left, Search Right (Inline) */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-1 -ml-1 text-zinc-400 hover:text-white transition-colors"
                        title="Volver"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className={`${typography.entityName} text-xl tracking-tight`}>Lista de chats </h1>
                </div>

                {/* Search Bar Inline & Compact (Right) */}
                <div className="relative group w-32 md:w-40">
                    <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
                        <Search size={12} className="text-zinc-600 group-focus-within:text-purple-400 transition-colors duration-300" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="w-full bg-zinc-900/40 hover:bg-zinc-900/80 focus:bg-zinc-900 border border-transparent focus:border-white/10 rounded-full pl-8 pr-3 py-1.5 text-[11px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none transition-all duration-300 text-right focus:text-left"
                    />
                </div>
            </div>

            {/* Lista Scrollable */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
                {chats.length === 0 ? (
                    <EmptyState
                        icon={MessageSquare}
                        title="Bandeja vacía"
                        description="Tus conversaciones con candidatos aparecerán aquí."
                        compact={true}
                    />
                ) : (
                    chats.map((chat) => {
                        const isActive = String(chat.id) === String(activeChatId);

                        // Status Config from Hook
                        const statusColor = chat.statusColor || 'gray';
                        const statusLabel = chat.displayStatus || 'En Proceso';

                        let statusBadge = null;

                        if (statusColor === 'purple') {
                            statusBadge = (
                                <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 whitespace-nowrap">
                                    {statusLabel}
                                </span>
                            );
                        } else if (statusColor === 'green') {
                            statusBadge = (
                                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                                    {statusLabel}
                                </span>
                            );
                        } else {
                            statusBadge = (
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-800/50 px-1.5 py-0.5 rounded border border-white/5 whitespace-nowrap">
                                    {statusLabel}
                                </span>
                            );
                        }

                        // Time Formatting
                        let timeDisplay = '';
                        if (chat.lastMessageTime) {
                            const date = new Date(chat.lastMessageTime);
                            const now = new Date();
                            const isToday = date.toDateString() === now.toDateString();
                            timeDisplay = isToday
                                ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                        }

                        return (
                            <div
                                key={chat.id}
                                onClick={() => navigate(`/dashboard/chat/${chat.id}`)}
                                className={`
                  relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 group mx-2 border border-transparent
                  ${isActive ? 'bg-zinc-900 border-white/5 shadow-lg' : 'hover:bg-zinc-900/40 hover:border-white/5'}
                `}
                            >
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <img
                                        src={chat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name || 'User'}`}
                                        alt="Avatar"
                                        className={`w-12 h-12 rounded-full object-cover border-2 transition-all ${isActive ? 'border-white/10' : 'border-zinc-800'}`}
                                    />
                                    {/* Online Dot (Optional, can be based on real status) */}
                                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-[2px] border-[#0a0a0a] ${statusColor === 'green' ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className={`text-[14px] font-bold truncate tracking-tight ${isActive ? 'text-white' : 'text-zinc-200 group-hover:text-white'}`}>
                                            {chat.name}
                                        </h4>
                                        <span className={`text-[10px] font-medium font-mono ${isActive ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                            {timeDisplay}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                        <p className={`text-[12px] truncate max-w-[160px] ${isActive ? 'text-zinc-300' : 'text-zinc-500'}`}>
                                            {chat.lastMessage || 'Nuevo candidato'}
                                        </p>
                                        {statusBadge}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
