import { useEffect, useRef, useSyncExternalStore } from 'react';
import { ChatStorage } from '../../services/chat';
import { useNotificationsContext } from '../../context/NotificationsContext';
import { useToast } from '../../context/ToastContext';

const notifyNative = (title, body) => {
    // Alerta Nativa (Windows/Mac/Android) si está en OTRA pestaña
    if (document.visibilityState === 'hidden' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/pwa-192x192.png' });
    }
};

const GlobalNotifier = () => {
    // SSOT 1: Estado global de alertas generales
    const { unreadCount, notifications } = useNotificationsContext();
    const { showToast } = useToast();
    
    // SSOT 2: Estado global de chats (Realtime)
    const chatSnapshot = useSyncExternalStore(ChatStorage.subscribe, ChatStorage.getSnapshot);
    const unreadChatsTotal = Object.values(chatSnapshot.unreadCounts || {}).reduce((a, b) => a + b, 0);

    // Refs para rastrear incrementos sin causar re-renders innecesarios
    const prevUnreadChats = useRef(unreadChatsTotal);
    const prevUnreadNotes = useRef(unreadCount);

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().catch(() => {});
        }
    }, []);

    // ── LISTENER DE MENSAJES DE CHAT ──
    useEffect(() => {
        if (unreadChatsTotal > prevUnreadChats.current) {
            const isChatOpen = window.location.pathname.includes('/chat');
            if (!isChatOpen) {
                showToast({
                    title: "Nuevo Mensaje",
                    body: "Tienes mensajes no leídos en tu bandeja.",
                    type: "info"
                });
            }
            notifyNative("Tienes un nuevo mensaje", "Revisa tu bandeja para responder.");
        }
        prevUnreadChats.current = unreadChatsTotal;
    }, [unreadChatsTotal, showToast]);

    // ── LISTENER DE MATCHES Y NOTIFICACIONES INTERNAS DE LA CAMPANITA ──
    useEffect(() => {
        if (unreadCount > prevUnreadNotes.current && notifications.length > 0) {
            const latestNote = notifications[0];
            const title = latestNote?.title || "Notificación de Turnes";
            const body = latestNote?.body || latestNote?.texto || "Revisa tus alertas en la campanita.";
            
            showToast({
                title: title,
                body: body,
                icon: latestNote?.icon,
                type: latestNote?.color === 'red' ? 'error' : latestNote?.color === 'yellow' ? 'warning' : 'success'
            });

            notifyNative(title, body);
        }
        prevUnreadNotes.current = unreadCount;
    }, [unreadCount, notifications, showToast]);

    return null;
};

export default GlobalNotifier;
