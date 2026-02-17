import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationsContext = createContext();

// Mock inicial
// Estado inicial vacío para producción
const INITIAL_NOTIFICATIONS = [];

export const NotificationsProvider = ({ children }) => {
    // 1. Estado de IDs leídos (Persistencia)
    const [readIds, setReadIds] = useState(() => {
        try {
            const saved = localStorage.getItem('turnes_notifications_read');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Error reading notifications from localStorage", e);
            return [];
        }
    });

    // 2. Data de notificaciones
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

    // 3. Sincronizar con LocalStorage
    useEffect(() => {
        try {
            localStorage.setItem('turnes_notifications_read', JSON.stringify(readIds));
        } catch (e) {
            console.error("Error saving notifications to localStorage", e);
        }
    }, [readIds]);

    // 4. Acciones
    const addNotification = useCallback((type, title, desc, link = '/dashboard') => {
        const newNote = {
            id: Date.now(), // ID temporal basado en timestamp
            category: 'new',
            title,
            desc,
            time: 'Ahora',
            type, // success, warning, info, error, rating_pending
            link
        };
        setNotifications(prev => [newNote, ...prev]);
    }, []);

    const markAsRead = useCallback((id) => {
        setReadIds(prev => {
            if (prev.includes(id)) return prev;
            return [...prev, id];
        });
    }, []);

    const markAllAsRead = useCallback(() => {
        const allIds = notifications.map(n => n.id);
        setReadIds(allIds);
    }, [notifications]);

    // Helper para verificar estado
    const isUnread = useCallback((id) => !readIds.includes(id), [readIds]);

    // Contador derivado
    const unreadCount = notifications.filter(n => !readIds.includes(n.id) && n.category === 'new').length;

    const value = {
        notifications,
        unreadCount,
        readIds,
        isUnread,
        addNotification,
        markAsRead,
        markAllAsRead
    };

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotificationsContext = () => {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error('useNotificationsContext must be used within a NotificationsProvider');
    }
    return context;
};
