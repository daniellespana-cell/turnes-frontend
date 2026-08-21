import { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from './useNotifications';
import { useClickOutside } from './useClickOutside';
import { ChatStorage } from '../services/chat';

/**
 * Orquestador del Menú de Notificaciones (Bell Icon Dropdown)
 * Adaptado al Observer Pattern: Lee `note.leida` en lugar del
 * array `readIds` que ya no existe en el nuevo contexto.
 */
export const useNotificationsMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications();

    const handleClickOutside = useCallback((e) => {
        if (buttonRef.current && buttonRef.current.contains(e.target)) return;
        setIsOpen(false);
    }, []);

    // Cierre al hacer click fuera
    useClickOutside(menuRef, handleClickOutside);

    /**
     * Verificación O(1) de si una notificación es no-leída.
     * Ahora usamos directamente el campo `leida` de la notificación
     * en lugar del Set de IDs (ya que la DB es la fuente de verdad).
     */
    const isUnread = (note) => !note.leida;

    /**
     * Agrupación por categoría temporal en un solo pase O(n).
     * Separa las notificaciones de "Hoy" y "Anteriores"
     * para el dropdown compacto del header.
     */
    const groupedNotifications = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        return notifications.reduce((acc, note) => {
            const ts = note.createdAt ? new Date(note.createdAt).getTime() : now.getTime();
            const isToday = ts >= todayStart;

            // Las no leídas van al grupo "Nuevas" independientemente de cuándo llegaron
            if (!note.leida) {
                acc.new.push(note);
            } else if (isToday) {
                // Ya leídas de hoy
                acc.today.push(note);
            } else {
                // Leídas y anteriores
                acc.earlier.push(note);
            }
            return acc;
        }, { new: [], today: [], earlier: [] });
    }, [notifications]);

    // Navegación inteligente al hacer clic en una notificación
    const handleNotificationClick = (note) => {
        markAsRead(note.id);
        setIsOpen(false);
        if (!note.link) return;

        // Auto-reactivar chat en caso de haber sido eliminado/archivado previamente
        const chatMatch = note.link.match(/\/dashboard\/chat\/([^?]+)/);
        if (chatMatch) {
            const chatId = chatMatch[1];
            const snapshot = ChatStorage.getSnapshot();
            const conv = snapshot?.conversations?.[chatId];
            const visibility = conv?.protocol_state?.visibility;

            // Si hay un bloqueo real de seguridad (block), redirigir
            if (typeof visibility === 'object' && Object.values(visibility).some(v => v === 'block')) {
                navigate('/dashboard/chats');
                return;
            }

            // Auto-resurrección de chat archivado/eliminado
            ChatStorage.manageChatVisibility(chatId, 'unarchive').catch(() => {});
        }

        navigate(note.link);
    };

    // Accesibilidad: cerrar con ESC
    const handleKeyDown = (e) => {
        if (!isOpen) return;
        if (e.key === 'Escape') setIsOpen(false);
    };

    const toggleMenu = () => setIsOpen(prev => !prev);

    const handleMarkAll = () => {
        markAllAsRead();
        setIsOpen(false);
    };

    const handleViewAll = () => {
        setIsOpen(false);
        navigate('/dashboard/notifications');
    };

    return {
        isOpen,
        toggleMenu,
        menuRef,
        buttonRef,
        handleKeyDown,
        unreadCount,
        groupedNotifications,
        notificationsCount: notifications.length,
        isUnread,
        handleNotificationClick,
        handleMarkAll,
        handleViewAll,
        deleteNotification
    };
};
