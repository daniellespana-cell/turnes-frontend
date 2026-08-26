import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

// 🛡️ Activación controlada (Zero Reload Loop):
// Solo salta la espera cuando el usuario acepta actualizar o en nuevo ciclo de pestañas
self.addEventListener('message', (event) => {
    if (event.data && (event.data.type === 'SKIP_WAITING' || event.data === 'skipWaiting')) {
        self.skipWaiting();
    }
});
clientsClaim();

// Limpia cachés antiguas y precachea los assets generados por Vite
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

// ---------------------------------------------------------
// WEB PUSH NOTIFICATIONS LOGIC
// ---------------------------------------------------------

// Evento: Recibir la notificación Push del servidor
self.addEventListener('push', (event) => {
    // 🛡️ Verificar permisos antes de invocar showNotification (Evita TypeError en consola)
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
        return;
    }

    let data = {
        title: 'Turnes',
        body: 'Tienes una nueva notificación',
        url: '/'
    };

    if (event.data) {
        try {
            data = event.data.json();
        } catch {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        },
        requireInteraction: true // Mantiene la notificación visible hasta que el usuario interactúe
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options).catch((err) => {
            // Manejo seguro si el permiso fue revocado
            console.warn('[SW] No se pudo mostrar la notificación Push:', err?.message || err);
        })
    );
});

// Evento: Clic en la notificación
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Cierra la notificación
    
    const urlToOpen = event.notification.data?.url || '/';

    // Intenta enfocar una pestaña existente si ya está abierta la app
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});
