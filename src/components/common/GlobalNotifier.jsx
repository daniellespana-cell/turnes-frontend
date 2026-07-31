import { useEffect, useRef, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { ChatStorage } from '../../services/chat';
import { useNotificationsContext } from '../../context/NotificationsContext';

const notifyUser = (title, body) => {
    // 1. Toast In-App (Siempre visible dentro de la app sin importar la ruta)
    toast.info(title, { description: body, duration: 6000 });

    // 2. Alerta Nativa (Windows/Mac/Android) si está en OTRA pestaña
    if (document.visibilityState === 'hidden' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/pwa-192x192.png' });
    }
};

const GlobalNotifier = () => {
    // SSOT 1: Estado global de alertas generales
    const { unreadCount, notifications } = useNotificationsContext();
    
    // SSOT 2: Estado global de chats (Realtime)
    const chatSnapshot = useSyncExternalStore(ChatStorage.subscribe, ChatStorage.getSnapshot);
    const unreadChatsTotal = Object.values(chatSnapshot.unreadCounts || {}).reduce((a, b) => a + b, 0);

    // Refs para rastrear incrementos sin causar re-renders innecesarios
    const prevUnreadChats = useRef(unreadChatsTotal);
    const prevUnreadNotes = useRef(unreadCount);

    useEffect(() => {
        // Pedimos permiso nativo silenciosamente al inicializar (para alertas fuera de pestaña)
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().catch(() => {});
        }
    }, []);

    // ── LISTENER DE MENSAJES DE CHAT ──
    useEffect(() => {
        // Solo alertamos si el número TOTAL de no leídos AUMENTA.
        // Esto ignora las lecturas (cuando baja a 0) y evita notificar cuando el usuario envía un mensaje (no sube el unreadCount).
        if (unreadChatsTotal > prevUnreadChats.current) {
            notifyUser("Tienes un nuevo mensaje", "Revisa tu bandeja para responder.");
        }
        prevUnreadChats.current = unreadChatsTotal;
    }, [unreadChatsTotal]);

    // ── LISTENER DE MATCHES Y NOTIFICACIONES INTERNAS ──
    useEffect(() => {
        if (unreadCount > prevUnreadNotes.current) {
            const latestNote = notifications[0];
            const isMatch = latestNote?.tipo === 'MATCH_ESTABLISHED';
            
            const title = isMatch ? "¡Nueva conexión!" : "Tienes una nueva alerta";
            const body = latestNote?.texto || "Revisa tu centro de notificaciones.";
            
            notifyUser(title, body);
        }
        prevUnreadNotes.current = unreadCount;
    }, [unreadCount, notifications]);

    // Componente puramente Lógico/Reactivo (SSOT listener), sin anidamiento visual
    return null;
};

export default GlobalNotifier;
