import React from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bell, CheckCircle } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import NotificationItem from '../../components/notifications/NotificationItem';

import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsContext } from '../../context/NotificationsContext';
import { ChatStorage } from '../../services/chat';

/**
 * Sección de grupo (Hoy / Anteriores).
 * Declarado FUERA del render para evitar que React la desmonte
 * y remonte en cada re-render del padre (anti-patrón component-in-render).
 */
const Section = ({ label, items, onClick, onDelete }) => {
    if (items.length === 0) return null;
    return (
        <div>
            <p className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-600 border-b border-white/5">{label}</p>
            <AnimatePresence>
                {items.map((n, i) => (
                    <NotificationItem key={n.id} note={n} isLast={i === items.length - 1} onClick={onClick} onDelete={onDelete} />
                ))}
            </AnimatePresence>
        </div>
    );
};

const NotificationsPage = () => {
    const navigate = useNavigate();
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotificationsContext();

    const handleClick = useCallback((note) => {
        markAsRead(note.id);
        if (!note.link) return;

        // 🛡️ ANTI-GHOST: Si la notificación apunta a un chat, verificar que no esté eliminado/bloqueado
        const chatMatch = note.link.match(/\/dashboard\/chat\/([^?]+)/);
        if (chatMatch) {
            const chatId = chatMatch[1];
            const snapshot = ChatStorage.getSnapshot();
            const conv = snapshot?.conversations?.[chatId];
            const myVisibility = conv?.protocol_state?.visibility?.[note.referenceId] 
                              ?? conv?.protocol_state?.visibility;

            // Si el chat fue eliminado o bloqueado por el usuario, redirigir a la lista
            if (typeof myVisibility === 'object') {
                const userVis = Object.values(myVisibility).find(v => v === 'delete' || v === 'block');
                if (userVis) {
                    navigate('/dashboard/chats');
                    return;
                }
            }
        }

        navigate(note.link);
    }, [markAsRead, navigate]);
    const handleDelete = (noteId) => { deleteNotification(noteId); };

    const { today, earlier } = useMemo(() => {
        const todayStart = new Date().setHours(0, 0, 0, 0);
        return notifications.reduce((acc, n) => {
            (new Date(n.createdAt).getTime() >= todayStart ? acc.today : acc.earlier).push(n);
            return acc;
        }, { today: [], earlier: [] });
    }, [notifications]);

    return (
        <div className="min-h-screen bg-[#060606] text-white font-manrope pt-20 pb-12 px-4 md:px-8">
            <div className="max-w-3xl mx-auto mt-6">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2.5 rounded-full bg-zinc-900/60 border border-transparent hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all active:scale-95"
                            type="button"
                            aria-label="Acción">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">Centro de Notificaciones</h1>
                            <p className="text-sm text-zinc-500 mt-1">
                                {unreadCount > 0 ? <><span className="text-purple-400 font-bold">{unreadCount}</span> alertas sin leer</> : 'Todo al día'}
                            </p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-purple-400 hover:text-purple-300 font-semibold text-sm transition-colors active:scale-95 self-start md:self-auto flex items-center gap-1.5 pt-1"
                            type="button"
                            aria-label="Acción">
                            <CheckCircle size={16} /><span className="hidden sm:inline">Marcar todas como leídas</span>
                        </button>
                    )}
                </div>

                {loading && <div className="flex items-center justify-center py-20"><Spinner size="md" variant="muted" /></div>}

                {!loading && notifications.length === 0 && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center p-16 bg-zinc-900/30 rounded-[2rem] border border-transparent">
                        <div className="w-24 h-24 bg-zinc-800/50 border border-transparent rounded-full flex items-center justify-center mb-6">
                            <Bell size={40} className="text-zinc-600" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-3">Todo al día</h2>
                        <p className="text-zinc-500 text-center max-w-sm text-sm leading-relaxed">
                            No tienes notificaciones pendientes. Te avisaremos en tiempo real cuando haya novedades.
                        </p>
                    </motion.div>
                )}

                {!loading && notifications.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col">
                        <Section label="Hoy" items={today} onClick={handleClick} onDelete={handleDelete} />
                        <Section label="Anteriores" items={earlier} onClick={handleClick} onDelete={handleDelete} />
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
