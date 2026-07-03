import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

// Reemplazo automático del Service Worker viejo
self.skipWaiting();
clientsClaim();

// Limpia cachés antiguas y precachea los assets generados por Vite
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

// ---------------------------------------------------------
// WEB PUSH NOTIFICATIONS LOGIC
// ---------------------------------------------------------

// Evento: Recibir la notificación Push del servidor
self.addEventListener('push', (event) => {
    let data = {
        title: 'Turnes',
        body: 'Tienes una nueva notificación',
        url: '/'
    };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
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
        self.registration.showNotification(data.title, options)
    );
});

// Evento: Clic en la notificación
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Cierra la notificación
    
    const urlToOpen = event.notification.data?.url || '/';

    // Intenta enfocar una pestaña existente si ya está abierta la app
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
