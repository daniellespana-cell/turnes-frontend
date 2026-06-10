import React, { useSyncExternalStore } from 'react';
import { chatState } from '../../services/chat/chatState';
import { AssetResolver } from '../../utils/assetHelper';

export const ChatListItem = ({ chat, isActive, onClick, onActionClick }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    
    // 🛡️ REACCIÓN DESCENTRALIZADA: Solo este item se suscribe a sus propios cambios
    const snapshot = useSyncExternalStore(chatState.subscribe, chatState.getSnapshot);
    const unreadCount = snapshot.unreadCounts[chat.id] || 0;
    // 🧠 Lógica Inteligente de Estado Binario (Activo vs Finalizada)
    // Fix: rely strictly on step === 4 or isClosed to determine end of lifecycle
    // 🧠 Lógica Inteligente de Estado Binario (Activo vs Finalizada)
    // 🛡️ RAZONAMIENTO PRO: Si el status es 'finalizado' o 'contratado' (en flujo de cierre) 
    // o el paso es el 4, el chat se considera cerrado para el modo "Activo".
    const isClosedStatus = 
        chat.isClosed || 
        chat.status === 'finalizado' || 
        chat.status === 'archivado' ||
        chat.step === 4 || 
        chat.activeStep === 4 ||
        chat.displayStatus?.toLowerCase() === 'finalizado' ||
        chat.cicloCerrado === true;

    // Formateo de Tiempo Relativo Elegante
    let timeDisplay = '';
    if (chat.lastMessageTime || chat.created_at) {
        const date = new Date(chat.lastMessageTime || chat.created_at);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        timeDisplay = isToday
            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    // Prevención de nombres y Avatares reales (Ignorar caché viejo)
    const displayName = chat.name || chat.candidateName || chat.companyName || 'Usuario';
    const targetAvatar = chat.candidateAvatar || chat.empresaAvatar || chat.avatar;
    const avatarUrl = AssetResolver.getAvatar(targetAvatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;
    const previewText = chat.lastMessage || (isClosedStatus ? 'La conversación ha concluido.' : 'Inicia la conversación');

    return (
        <div
            onClick={onClick}
            className={`
                relative flex items-center gap-3 py-2 px-3 mx-2 my-0.5 rounded-xl cursor-pointer 
                transition-all duration-200 group border
                ${isActive
                    ? 'bg-zinc-800/80 border-white/10 shadow-sm'
                    : 'bg-transparent border-transparent hover:bg-zinc-900/50 hover:border-white/5'
                }
            `}
        >
            {/* Avatar Sutil (40px) */}
            <div className="relative shrink-0">
                <img
                    src={avatarUrl}
                    alt={displayName}
                    className={`w-10 h-10 rounded-full object-cover transition-transform duration-300 ${isActive ? 'scale-100 ring-[1.5px] ring-white/20' : 'group-hover:scale-105'}`}
                />

                {/* Dot Indicador Orgánico Sutil */}
                {!isClosedStatus && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-[2px] border-[#0a0a09] bg-emerald-500 shadow-sm" />
                )}
            </div>

            {/* Contenido (Textos fluidos y pequeños) */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                {/* Primera Línea: Nombre y Tiempo */}
                <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-[13px] font-semibold truncate tracking-tight ${isActive ? 'text-white' : 'text-zinc-200 group-hover:text-white transition-colors'}`}>
                        {displayName}
                    </h4>
                    <span className={`text-[10px] whitespace-nowrap font-medium ${isActive ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {timeDisplay}
                    </span>
                </div>

                {/* Segunda Línea: Preview y Estado Binario Sutil */}
                <div className="flex items-center justify-between gap-3">
                    <p className={`text-[11px] truncate flex-1 min-w-0 ${isActive ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {previewText}
                    </p>

                    {/* Badge de No Leídos o Estado Activo */}
                    {unreadCount > 0 ? (
                        <div className="flex items-center justify-center min-w-[18px] h-[18px] bg-emerald-500 rounded-full px-1.5 animate-in zoom-in duration-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                            <span className="text-[9px] font-black text-white leading-none">
                                {unreadCount > 9 ? '+9' : unreadCount}
                            </span>
                        </div>
                    ) : (
                        <>
                            {isClosedStatus ? (
                                <div className="flex items-center gap-1.5 shrink-0 opacity-70">
                                    <Lock size={10} className="text-zinc-500" />
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest hidden sm:block">
                                        Finalizada
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest hidden sm:block">
                                        Activo
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Menú de Acciones (Triple Dot) */}
            <div className="relative shrink-0 flex items-center">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(!isMenuOpen);
                    }}
                    className={`p-1.5 rounded-full transition-colors ${isMenuOpen ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                >
                    <MoreVertical size={16} />
                </button>

                {/* Dropdown Menu Minimalista Premium */}
                {isMenuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(false);
                            }}
                        />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-[#0a0a09]/95 backdrop-blur-xl border border-transparent rounded-xl  py-1 z-50 overflow-hidden text-left origin-top-right animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                    if (onActionClick) onActionClick(chat, 'archive');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                <Archive size={14} className="text-zinc-400" />
                                Archivar
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                    if (onActionClick) onActionClick(chat, 'block');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-colors"
                            >
                                <ShieldAlert size={14} />
                                Bloquear
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                    if (onActionClick) onActionClick(chat, 'delete');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 size={14} />
                                Eliminar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
