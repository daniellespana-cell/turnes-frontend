import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { notificationObserver } from '../services/notificationObserver';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

/**
 * Convierte la clave pública VAPID (Base64-URL) al formato Uint8Array
 * que requiere el PushManager del navegador.
 */
const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

/**
 * usePushNotifications
 *
 * SSOT: La UI nunca escribe directamente en la BD.
 * Toda persistencia pasa por la Edge Function `subscribe-push`,
 * que valida el JWT del usuario y usa service_role para escribir.
 */
export const usePushNotifications = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (error) {
            console.error('[Push] Error al verificar suscripción:', error);
        }
    };

    const subscribe = async () => {
        if (!user || !isSupported) return;
        setLoading(true);

        try {
            // 1. Pedir permiso al sistema operativo
            const perm = await Notification.requestPermission();
            setPermission(perm);
            if (perm !== 'granted') {
                showToast('Permiso de notificaciones denegado por el sistema operativo.', 'error');
                return;
            }

            // 2. Registrar al dispositivo en el servidor Push (Google/Apple)
            const registration = await navigator.serviceWorker.ready;
            const pushSub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            const subJson = pushSub.toJSON ? pushSub.toJSON() : JSON.parse(JSON.stringify(pushSub));
            const endpoint = subJson.endpoint;
            const keys = subJson.keys || {};

            // 3. Obtener el JWT activo del usuario para enviarlo al backend
            const session = await authService.getSession();
            if (!session) throw new Error('Sesión expirada. Inicia sesión de nuevo.');

            // 4. SSOT: Enviar la suscripción a la Edge Function (nunca directo a la BD)
            const res = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/subscribe-push`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                        endpoint,
                        p256dh: keys.p256dh,
                        auth: keys.auth,
                    }),
                }
            );

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Error al guardar suscripción');

            setIsSubscribed(true);
            showToast('¡Notificaciones activadas! Ya recibirás alertas de nuevas ofertas.', 'success');

        } catch (error) {
            console.error('[Push] Error al suscribir:', error);
            showToast(`Error: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const unsubscribe = async () => {
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();

                // Borrar de la BD a través del servicio desacoplado
                if (user) {
                    await notificationObserver.deletePushSubscription(user.id, subscription.endpoint);
                }

                setIsSubscribed(false);
                showToast('Notificaciones desactivadas.', 'info');
            }
        } catch (error) {
            console.error('[Push] Error al desuscribir:', error);
            showToast('Error al desactivar notificaciones.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return { isSupported, permission, isSubscribed, loading, subscribe, unsubscribe };
};
