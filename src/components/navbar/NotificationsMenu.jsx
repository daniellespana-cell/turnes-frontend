import React, { useState, useMemo, useRef } from 'react';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { useClickOutside } from '../../hooks/useClickOutside';

const NotificationsMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    // Cerebro: Lógica de negocio y persistencia
    const {
        notifications,
        unreadCount,
        readIds,
        markAsRead,
        markAllAsRead
    } = useNotifications();

    // 1. Cierre al hacer click fuera (Hook Real)
    useClickOutside(menuRef, (e) => {
        // Evitar cierre si el click fue en el botón trigger
        if (buttonRef.current && buttonRef.current.contains(e.target)) return;
        setIsOpen(false);
    });

    // 2. Performance: Memorizar agrupación para evitar re-calculos en cada render
    const groupedNotifications = useMemo(() => {
        return {
            new: notifications.filter(n => n.category === 'new'),
            today: notifications.filter(n => n.category === 'today'),
            earlier: notifications.filter(n => n.category === 'earlier')
        };
    }, [notifications]);

    // OPTIMIZACIÓN: Set para lookup O(1) de leídos
    const readIdsSet = useMemo(() => new Set(readIds), [readIds]);
    const isUnread = (id) => !readIdsSet.has(id);

    // 3. Manejo de Navegación Inteligente
    const handleNotificationClick = (note) => {
        markAsRead(note.id);
        setIsOpen(false);

        // Lógica de Negocio: Inyección de parámetros según tipo
        let path = note.link;
        if (note.type === 'rating_pending' && note.metadata?.action === 'rate') {
            // Ejemplo: /dashboard/candidatos?action=rate&candidateId=123
            path = `${note.link}?action=rate&candidateId=${note.metadata.candidateId}`;
        }

        navigate(path);
    };

    // 4. Accesibilidad: Teclado ESC (Solo si está abierto)
    const handleKeyDown = (e) => {
        if (!isOpen) return;
        if (e.key === 'Escape') setIsOpen(false);
    };

    return (
        <div className="relative" onKeyDown={handleKeyDown}>
            {/* Trigger Button */}
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label={`Notificaciones ${unreadCount > 0 ? `(${unreadCount} nuevas)` : ''}`}
                className={`relative z-50 p-2 rounded-full transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isOpen ? 'text-white bg-zinc-800/50' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
                <Bell size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-12' : 'group-hover:rotate-12'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
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
                        className="absolute top-10 right-0 w-64 max-w-[calc(100vw-20px)] bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl shadow-black overflow-hidden ring-1 ring-white/5 z-50 max-h-[80vh] flex flex-col origin-top-right"
                        role="dialog"
                        aria-label="Lista de notificaciones"
                    >
                        {/* Header */}
                        <div className="px-3 py-2.5 border-b border-white/5 flex justify-between items-center bg-zinc-900/20 shrink-0">
                            <h3 className="text-[10px] font-bold text-white tracking-wide uppercase">Notificaciones</h3>
                            <button
                                onClick={() => {
                                    markAllAsRead();
                                    setIsOpen(false);
                                }}
                                className="text-[9px] text-zinc-500 hover:text-emerald-400 transition-colors flex items-center gap-1 font-medium hover:bg-white/5 px-1.5 py-0.5 rounded focus:outline-none focus:bg-white/10"
                                aria-label="Marcar todas como leídas"
                            >
                                <CheckCircle size={9} />
                                Leídas
                            </button>
                        </div>

                        {/* Contenido Scrollable */}
                        <div className="overflow-y-auto custom-scrollbar flex-1">

                            {/* SECCIÓN: NUEVAS */}
                            {groupedNotifications.new.length > 0 && (
                                <>
                                    <SectionHeader title="Nuevas" />
                                    {groupedNotifications.new.map((note) => (
                                        <NotificationItem
                                            key={note.id}
                                            note={note}
                                            onClick={() => handleNotificationClick(note)}
                                            isUnread={isUnread(note.id)} // Usar ID para check O(1)
                                        />
                                    ))}
                                </>
                            )}

                            {/* SECCIÓN: HOY */}
                            {groupedNotifications.today.length > 0 && (
                                <>
                                    <SectionHeader title="Hoy" />
                                    {groupedNotifications.today.map((note) => (
                                        <NotificationItem
                                            key={note.id}
                                            note={note}
                                            onClick={() => handleNotificationClick(note)}
                                            isUnread={isUnread(note.id)}
                                        />
                                    ))}
                                </>
                            )}

                            {/* SECCIÓN: ANTERIORES */}
                            {groupedNotifications.earlier.length > 0 && (
                                <>
                                    <SectionHeader title="Anteriores" />
                                    {groupedNotifications.earlier.map((note) => (
                                        <NotificationItem
                                            key={note.id}
                                            note={note}
                                            onClick={() => handleNotificationClick(note)}
                                            isUnread={isUnread(note.id)}
                                        />
                                    ))}
                                </>
                            )}

                            {/* EMPTY STATE */}
                            {notifications.length === 0 && (
                                <div className="p-6 text-center text-zinc-600">
                                    <Bell size={24} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-[10px]">Sin novedades</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Link */}
                        <button
                            onClick={() => { setIsOpen(false); navigate('/dashboard/notifications'); }}
                            className="border-t border-white/5 px-3 py-2 bg-zinc-900/30 text-center hover:bg-zinc-900/50 cursor-pointer transition-colors shrink-0 w-full focus:outline-none focus:bg-zinc-800"
                        >
                            <span className="text-[9px] font-bold text-zinc-500 tracking-wider hover:text-white uppercase transition-colors">
                                Ver todas
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
    <div className="px-3 py-1 bg-[#0a0a0a]/95 border-y border-white/5 backdrop-blur-sm sticky top-0 z-10 flex items-center">
        <h4 className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{title}</h4>
    </div>
);

const NotificationItem = ({ note, onClick, isUnread }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-3 py-2 border-b border-white/[0.02] hover:bg-white/5 transition-colors group flex gap-2.5 items-start focus:outline-none focus:bg-white/10 ${isUnread ? 'bg-purple-500/[0.05]' : ''}`}
        role="menuitem"
    >
        {/* Indicador de Tipo */}
        <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${note.type === 'success' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' :
            note.type === 'warning' ? 'bg-amber-500' :
                note.type === 'rating_pending' ? 'bg-pink-500 shadow-[0_0_6px_rgba(236,72,153,0.4)]' : // Nuevo estilo para rating
                    'bg-blue-500'
            }`} />

        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
                <p className={`text-[10px] font-semibold leading-tight truncate ${isUnread ? 'text-zinc-100' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                    {note.title}
                </p>
                {isUnread && <span className="w-1 h-1 rounded-full bg-purple-500 shrink-0 shadow-[0_0_4px_rgba(168,85,247,0.5)]" />}
            </div>

            <p className={`text-[9px] mt-0.5 font-light line-clamp-1 leading-snug ${isUnread ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {note.desc}
            </p>
            <span className="text-[8px] text-zinc-700 mt-1 flex items-center gap-1 font-mono opacity-60">
                <Clock size={7} /> {note.time}
            </span>
        </div>
    </button>
);

export default NotificationsMenu;