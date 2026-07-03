import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

// Usa la variable de entorno para la clave pública VAPID
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Utilidad para convertir la clave VAPID a un array de bytes seguros para la URL
const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export const usePushNotifications = () => {
    const { user } = useAuth();
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
            console.error('Error checking push subscription:', error);
        }
    };

    const subscribe = async () => {
        if (!user || !isSupported) return;
        setLoading(true);

        try {
            const perm = await Notification.requestPermission();
            setPermission(perm);

            if (perm !== 'granted') {
                toast.error('Permiso denegado para notificaciones.');
                setLoading(false);
                return;
            }

            const registration = await navigator.serviceWorker.ready;

            // Suscribir al dispositivo a través del navegador (Google/Apple push servers)
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // Extraer datos necesarios para el backend
            const subData = JSON.parse(JSON.stringify(subscription));

            // Guardar en Supabase
            const { error } = await supabase
                .from('push_subscriptions')
                .upsert({
                    user_id: user.id,
                    endpoint: subData.endpoint,
                    p256dh: subData.keys.p256dh,
                    auth: subData.keys.auth
                }, { onConflict: 'user_id, endpoint' });

            if (error) throw error;

            setIsSubscribed(true);
            toast.success('¡Notificaciones activadas con éxito!');

        } catch (error) {
            console.error('Failed to subscribe:', error);
            toast.error('Hubo un error al activar las notificaciones.');
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
                const endpoint = subscription.endpoint;
                
                // Desuscribir en el navegador
                await subscription.unsubscribe();
                
                // Borrar de Supabase
                if (user) {
                    await supabase
                        .from('push_subscriptions')
                        .delete()
                        .eq('user_id', user.id)
                        .eq('endpoint', endpoint);
                }
                
                setIsSubscribed(false);
                toast.info('Notificaciones desactivadas.');
            }
        } catch (error) {
            console.error('Error unsubscribing:', error);
            toast.error('Error al desactivar notificaciones.');
        } finally {
            setLoading(false);
        }
    };

    return {
        isSupported,
        permission,
        isSubscribed,
        loading,
        subscribe,
        unsubscribe
    };
};
