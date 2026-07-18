import React from 'react';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { notificationObserver } from '../services/notificationObserver';
import { resolveNotificationText } from '../domain/notificationTranslations';

const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    /**
     * Normaliza una fila DB al formato UI.
     * `userRole` se calcula DENTRO del callback para evitar
     * el riesgo de stale closure si el rol cambia sin cambiar user.id.
     */
    const normalize = useCallback((row) => {
        const role = user?.rol === 'postulante' ? 'candidato' : 'empresa';
        const resolved = resolveNotificationText(row.tipo, role, row.metadata || {}, row.reference_id);
        const ts = row.created_at;
        const timeLabel = ts
            ? new Date(ts).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
            : 'Ahora';
        return {
            id: row.id,
            tipo: row.tipo,
            leida: row.leida,
            referenceId: row.reference_id,
            metadata: row.metadata,
            createdAt: ts,
            timeLabel,   // Pre-formateado: evita instanciar Date en el render de NotificationItem
            ...resolved
        };
    }, [user?.id, user?.rol]);  // Solo depende de valores reales del usuario

    /**
     * 🛡️ MOTOR DE DEDUPLICACIÓN SENIOR (O(n log n))
     * Elimina ruidos de la DB: Notificaciones idénticas en una ventana de 10s.
     */
    const deduplicate = useCallback((list) => {
        const seen = new Set();
        return list.filter(n => {
            // Clave única: Tipo + Referencia + Ventana de 10 segundos
            const window = Math.floor(new Date(n.createdAt).getTime() / 10000); 
            const key = `${n.tipo}-${n.referenceId}-${window}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, []);

    // Carga historial desde DB
    useEffect(() => {
        if (!user?.id) { setNotifications([]); setLoading(false); return; }
        let cancelled = false;
        notificationObserver.fetchHistory(user.id).then(({ data: rows, error }) => {
            if (!cancelled && !error) { 
                const normalized = rows.map(normalize);
                const deduped = deduplicate(normalized);
                // 🚀 Senior Fix: Sort explicitly to guarantee Newest First (Descending) order
                const sorted = deduped.sort((a, b) => {
                    const dateA = new Date(a.createdAt).getTime() || 0;
                    const dateB = new Date(b.createdAt).getTime() || 0;
                    return dateB - dateA;
                });
                setNotifications(sorted); 
                setLoading(false); 
            }
        });
        return () => { cancelled = true; };
    }, [user?.id, normalize, deduplicate]);

    // Realtime: Conectar canal y suscribir INSERT/UPDATE
    useEffect(() => {
        if (!user?.id) { notificationObserver.disconnect(); return; }
        notificationObserver.connect(user.id);

        const unsubInsert = notificationObserver.subscribe('INSERT', (row) => {
            setNotifications(prev => {
                const newNote = normalize(row);
                const newList = [newNote, ...prev];
                // 🚀 Aplicamos deduplicación global para limpiar y ordenamos de forma estricta (Newest First)
                return deduplicate(newList).sort((a, b) => {
                    const dateA = new Date(a.createdAt).getTime() || 0;
                    const dateB = new Date(b.createdAt).getTime() || 0;
                    return dateB - dateA;
                });
            });
        });

        const unsubUpdate = notificationObserver.subscribe('UPDATE', (row) =>
            setNotifications(prev => prev.map(n => n.id === row.id ? normalize(row) : n))
        );
        const unsubDelete = notificationObserver.subscribe('DELETE', (row) =>
            setNotifications(prev => prev.filter(n => n.id !== row.id))
        );
        return () => { unsubInsert(); unsubUpdate(); unsubDelete(); };
    }, [user?.id, normalize, deduplicate]);

    const markAsRead = useCallback((id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
        notificationObserver.markAsRead(id);
    }, []);

    const markAllAsRead = useCallback(() => {
        if (!user?.id) return;
        setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
        notificationObserver.markAllAsRead(user.id);
    }, [user?.id]);

    const dispatch = useCallback((targetUserId, tipo, referenceId, metadata) =>
        notificationObserver.dispatch(targetUserId, tipo, referenceId, metadata), []);

    const deleteNotification = useCallback(async (id) => {
        // Optimistic UI: sacar inmediatamente
        const snapshot = notifications;
        setNotifications(prev => prev.filter(n => n.id !== id));
        try {
            await notificationObserver.deleteNotification(id);
        } catch {
            // 🛡️ RLS o error de red: revertir al estado previo
            setNotifications(snapshot);
        }
    }, [notifications]);

    const unreadCount = useMemo(() => notifications.filter(n => !n.leida).length, [notifications]);
    const userRole = user?.rol === 'postulante' ? 'candidato' : 'empresa';

    return (
        <NotificationsContext.Provider value={{ notifications, unreadCount, loading, userRole, markAsRead, markAllAsRead, dispatch, deleteNotification }}>
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotificationsContext = () => {
    const ctx = useContext(NotificationsContext);
    if (!ctx) throw new Error('useNotificationsContext must be used within NotificationsProvider');
    return ctx;
};
