import React from 'react';
import { Bell, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';

import { useNotificationsMenu } from '../../hooks/useNotificationsMenu';

const NotificationsMenu = () => {
    const {
        isOpen,
        toggleMenu,
        menuRef,
        buttonRef,
        handleKeyDown,
        unreadCount,
        groupedNotifications,
        notificationsCount,
        isUnread,
        handleNotificationClick,
        handleMarkAll,
        handleViewAll,
        deleteNotification
    } = useNotificationsMenu();

    return (
        <div className="relative" onKeyDown={handleKeyDown}>
            {/* Trigger Button (Hardened & Unified Style) */}
            <button
                ref={buttonRef}
                onClick={toggleMenu}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label={`Notificaciones ${unreadCount > 0 ? `(${unreadCount} nuevas)` : ''}`}
                className="relative flex items-center justify-center transition-all duration-500 group active:scale-[0.85] focus:outline-none p-2 z-50"
                type="button">
                {/* Bell Icon — Alto Relieve (Embossed) */}
                <Bell 
                    className={`w-6 h-6 transition-all duration-500 transform group-hover:-translate-y-0.5 relative z-10 ${
                        isOpen 
                            ? 'text-white rotate-12' 
                            : 'text-zinc-300 group-hover:text-white group-hover:rotate-12'
                    }`} 
                    strokeWidth={2.5}
                    style={{
                        filter: isOpen
                            ? 'drop-shadow(0 0 10px rgba(255,255,255,0.5)) drop-shadow(0 4px 6px rgba(0,0,0,0.8))'
                            : 'drop-shadow(0 2px 1px rgba(0,0,0,0.9)) drop-shadow(0 -1px 1px rgba(255,255,255,0.08))'
                    }}
                />

                {/* Badge Numérico (Reemplaza punto rojo) */}
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] font-black rounded-full shadow-[0_0_12px_rgba(239,68,68,0.6),0_2px_4px_rgba(0,0,0,0.5)] z-20 pointer-events-none ring-2 ring-[#0a0a0a] px-1 leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>
            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-10 right-0 w-64 max-w-[calc(100vw-20px)] bg-[#0a0a0a] border border-transparent rounded-xl  shadow-black overflow-hidden ring-1 ring-white/5 z-50 max-h-[80vh] flex flex-col origin-top-right"
                        role="dialog"
                        aria-label="Lista de notificaciones"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-zinc-900/20 shrink-0">
                            <h3 className="text-sm font-bold text-white tracking-wide uppercase">Notificaciones</h3>
                            <button
                                onClick={handleMarkAll}
                                className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5 font-medium hover:bg-white/5 px-2 py-1 rounded focus:outline-none focus:bg-white/10"
                                aria-label="Marcar todas como leídas"
                                type="button">
                                <CheckCircle size={14} />
                                Leídas
                            </button>
                        </div>

                        {/* Contenido Scrollable */}
                        <div className="overflow-y-auto custom-scrollbar flex-1">

                            {/* SECCIONES DINÁMICAS (KISS) */}
                            {[
                                { id: 'new', title: 'Nuevas' },
                                { id: 'today', title: 'Hoy' },
                                { id: 'earlier', title: 'Anteriores' }
                            ].map(section => {
                                const items = groupedNotifications[section.id];
                                if (!items || items.length === 0) return null;

                                return (
                                    <React.Fragment key={section.id}>
                                        <SectionHeader title={section.title} />
                                        {items.map(note => (
                                            <NotificationItem
                                                key={note.id}
                                                note={note}
                                                onClick={() => handleNotificationClick(note)}
                                                onDelete={() => deleteNotification(note.id)}
                                                isUnread={!note.leida}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={() => handleNotificationClick(note)} />
                                        ))}
                                    </React.Fragment>
                                );
                            })}

                            {/* EMPTY STATE */}
                            {notificationsCount === 0 && (
                                <div className="p-8 text-center text-zinc-600">
                                    <Bell size={28} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-xs font-medium">Sin novedades</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Link */}
                        <button
                            onClick={handleViewAll}
                            className="border-t border-white/5 px-4 py-3 bg-zinc-900/30 text-center hover:bg-zinc-900/50 cursor-pointer transition-colors shrink-0 w-full focus:outline-none focus:bg-zinc-800"
                            type="button"
                            aria-label="Acción">
                            <span className="text-xs font-bold text-zinc-400 hover:text-white transition-colors">
                                Ver todas las notificaciones
                            </span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Subcomponentes (Optimizados)
const SectionHeader = ({ title }) => (
    <div className="px-4 py-1.5 bg-[#0a0a0a]/95 border-y border-white/5 backdrop-blur-sm sticky top-0 z-10 flex items-center">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{title}</h4>
    </div>
);

// Configuración de Estilos por Tipo (Patrón Limpio)
const TYPE_STYLES = {
    success: 'bg-emerald-500 shadow-[0_2px_4px_rgba(0,0,0,0.5),0_0_6px_rgba(16,185,129,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)]',
    warning: 'bg-amber-500 shadow-[0_2px_4px_rgba(0,0,0,0.5),0_0_6px_rgba(245,158,11,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)]',
    rating_pending: 'bg-pink-500 shadow-[0_2px_4px_rgba(0,0,0,0.5),0_0_6px_rgba(236,72,153,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)]',
    default: 'bg-blue-500 shadow-[0_2px_4px_rgba(0,0,0,0.5),0_0_6px_rgba(59,130,246,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)]'
};

const NotificationItem = ({ note, onClick, onDelete, isUnread }) => {
    const typeStyle = TYPE_STYLES[note.type] || TYPE_STYLES.default;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
                opacity: 0,
                overflow: 'hidden'
            }}
            className={`w-full text-left px-4 py-3 border-b border-white/[0.02] hover:bg-white/5 transition-colors group flex gap-3 items-start relative ${isUnread ? 'bg-purple-500/[0.04]' : ''}`}
            role="menuitem"
        >
            <button
                type="button"
                className="flex-1 min-w-0 flex gap-3 items-start cursor-pointer text-left focus:outline-none focus:bg-white/10"
                onClick={onClick}
                aria-label="Acción">
                {/* Indicador de Tipo */}
                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${typeStyle}`} />

                <div className="flex-1 min-w-0 pr-6">
                    <div className="flex justify-between items-start gap-2">
                        <p className={`text-sm font-semibold leading-tight truncate ${isUnread ? 'text-zinc-100' : 'text-zinc-300 group-hover:text-zinc-100'}`}>
                            {note.title}
                        </p>
                        {isUnread && <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 shadow-[0_0_4px_rgba(168,85,247,0.5)]" />}
                    </div>

                    <p className={`text-xs mt-1 font-normal line-clamp-2 leading-snug ${isUnread ? 'text-zinc-300' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                        {note.body}
                    </p>
                    <span className="text-[10px] text-zinc-600 mt-2 flex items-center gap-1 font-mono opacity-80">
                        <Clock size={10} /> {note.timeLabel}
                    </span>
                </div>
            </button>
            {/* Acciones Rápidas Ocultas (Delete) */}
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 bg-zinc-900 border border-transparent text-zinc-500 hover:text-red-400 hover:border-red-500/30 rounded-lg  opacity-70 md:opacity-0 scale-90 md:scale-75 group-hover:opacity-100 group-hover:scale-100 focus:opacity-100 focus:scale-100 transition-all z-10"
                title="Eliminar"
                type="button"
                aria-label="Acción">
                <Trash2 size={13} />
            </button>
        </motion.div>
    );
};



export default NotificationsMenu;