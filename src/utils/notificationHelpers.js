/**
 * notificationHelpers.js
 *
 * Utilidades ultra-defensivas para el manejo de la Web Notifications API.
 * Blindado contra:
 * - Extensiones anti-fingerprinting y escudos de privacidad (Brave Shields, CanvasBlocker, etc.)
 *   que definen window.Notification como un objeto vacío o sin requestPermission.
 * - Contextos restringidos (WebViews incrustados, iframes sandbox, SSR).
 * - Chrome en Android (donde `new Notification()` lanza TypeError: Illegal constructor).
 * - Diferencias de implementación (Promise vs callback legado).
 */

/**
 * Verifica de forma segura si la API de Notificaciones está disponible y es operable.
 * @returns {boolean}
 */
export const isNotificationSupported = () => {
    return (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        typeof window.Notification === 'function' &&
        typeof window.Notification.requestPermission === 'function'
    );
};

/**
 * Obtiene el estado actual del permiso de notificaciones de forma segura.
 * Retorna 'denied' si el entorno no soporta la API o si el acceso a la propiedad falla.
 * @returns {NotificationPermission | 'denied'}
 */
export const getNotificationPermission = () => {
    if (!isNotificationSupported()) return 'denied';
    try {
        return window.Notification.permission || 'default';
    } catch {
        return 'denied';
    }
};

/**
 * Solicita permiso de notificaciones al sistema operativo de forma segura.
 * Soporta tanto la sintaxis moderna basada en Promesas como la API basada en callbacks,
 * capturando cualquier excepción síncrona o asíncrona.
 * @returns {Promise<NotificationPermission | 'denied'>}
 */
export const safeRequestNotificationPermission = async () => {
    if (!isNotificationSupported()) return 'denied';

    try {
        return await new Promise((resolve) => {
            let isResolved = false;
            const safeResolve = (perm) => {
                if (!isResolved) {
                    isResolved = true;
                    resolve(perm || 'denied');
                }
            };

            try {
                const promise = window.Notification.requestPermission((perm) => {
                    safeResolve(perm);
                });

                if (promise && typeof promise.then === 'function') {
                    promise.then(safeResolve).catch(() => safeResolve('denied'));
                }
            } catch {
                safeResolve('denied');
            }
        });
    } catch (err) {
        console.warn('[Notifications] safeRequestNotificationPermission failed defensively:', err);
        return 'denied';
    }
};

/**
 * Despacha una notificación nativa del SO únicamente si el navegador lo soporta,
 * el usuario dio permiso, y la ventana está oculta (background/otra pestaña).
 * @param {string} title
 * @param {NotificationOptions} [options]
 * @returns {Notification | null}
 */
export const safeNotifyNative = (title, options) => {
    if (typeof window === 'undefined') return null;
    if (document.visibilityState !== 'hidden') return null;
    if (!isNotificationSupported() || getNotificationPermission() !== 'granted') return null;

    try {
        return new window.Notification(title, options);
    } catch (err) {
        // En Chrome Android y webviews móviles, `new Notification()` lanza TypeError: Illegal constructor.
        // Se suprime limpiamente para que la alerta in-app (Toast) siga operando sin errores.
        console.debug('[Notifications] Native notification creation bypassed:', err);
        return null;
    }
};
