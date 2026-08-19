/**
 * ⚡ VERSION SERVICE — Sentinel Anti-Caché Zombie & Gestor de Actualizaciones PWA (Turnes)
 *
 * Single Source of Truth para versionado de la aplicación, detección de nuevas
 * versiones en el Service Worker y recuperación suave de ChunkLoadErrors tras un deploy.
 */

import { logger } from '../utils/logger';

export const APP_METADATA = {
    VERSION: '0.1.0',
    BUILD_TIMESTAMP: '2026-08-19T03:50:00Z',
    STORAGE_KEY: 'turnes_app_version',
    CHUNK_RETRY_KEY: 'turnes_chunk_reload_count'
};

class VersionService {
    constructor() {
        this.updateAvailable = false;
        this.updateCallback = null;
        this.listeners = new Set();
        this.swRegistration = null;
    }

    /**
     * Inicializa el sentinel de versionado y registra listeners de ciclo de vida
     */
    init(registerSWFn = null) {
        // 1. Guardar versión actual en almacenamiento local
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                const storedVersion = localStorage.getItem(APP_METADATA.STORAGE_KEY);
                if (storedVersion && storedVersion !== APP_METADATA.VERSION) {
                    logger.info(`🔄 [VersionService] Actualización de versión detectada: ${storedVersion} ➔ ${APP_METADATA.VERSION}`);
                }
                localStorage.setItem(APP_METADATA.STORAGE_KEY, APP_METADATA.VERSION);
            } catch {
                // Ignore storage quota errors
            }
        }

        // 2. Registro del Service Worker con hooks de actualización
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && typeof registerSWFn === 'function') {
            try {
                this.updateCallback = registerSWFn({
                    immediate: true,
                    onNeedRefresh: () => {
                        logger.info('🚀 [VersionService] Nueva versión lista para activar.');
                        this.notifyUpdateAvailable();
                    },
                    onRegisteredSW: (swUrl, registration) => {
                        this.swRegistration = registration;
                        logger.dev('🛰️ [VersionService] Service Worker registrado en:', swUrl);

                        // Chequeo periódico cada 60 minutos
                        if (registration) {
                            setInterval(() => {
                                registration.update().catch(() => {});
                            }, 60 * 60 * 1000);
                        }
                    },
                    onRegisterError: (err) => {
                        logger.warn('⚠️ [VersionService] Error registrando SW:', err);
                    }
                });
            } catch (err) {
                logger.warn('⚠️ [VersionService] Fallo inicializando registerSW:', err);
            }
        }

        // 3. Listener de retorno a primer plano (Chequea si hay nueva versión al abrir la app)
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    this.checkForUpdates();
                }
            });
        }
    }

    /**
     * Notifica a los observadores (UI Toast) que hay una actualización pendiente
     */
    notifyUpdateAvailable() {
        this.updateAvailable = true;
        this.listeners.forEach(fn => {
            try {
                fn(true);
            } catch (err) {
                logger.warn('[VersionService] Error en listener de actualización:', err);
            }
        });
    }

    /**
     * Suscribe un componente a cambios de estado de actualización
     * @param {Function} callback - Función que recibe (hasUpdate: boolean)
     * @returns {Function} Unsubscribe cleanup function
     */
    subscribe(callback) {
        this.listeners.add(callback);
        if (this.updateAvailable) {
            callback(true);
        }
        return () => this.listeners.delete(callback);
    }

    /**
     * Consulta al Service Worker si existe una versión más reciente en el servidor
     */
    async checkForUpdates() {
        if (this.swRegistration) {
            try {
                await this.swRegistration.update();
            } catch {
                // Silencioso en desconexión
            }
        }
    }

    /**
     * Aplica la actualización activando el nuevo SW y recargando la ventana
     */
    applyUpdate() {
        logger.info('⚡ [VersionService] Aplicando nueva versión...');
        if (this.updateCallback) {
            this.updateCallback(true);
        } else {
            window.location.reload();
        }
    }

    /**
     * Manejador de errores de carga de chunks (Anti-Zombie tras despliegues)
     */
    handleChunkError() {
        if (typeof window === 'undefined') return;

        try {
            const reloadCount = parseInt(sessionStorage.getItem(APP_METADATA.CHUNK_RETRY_KEY) || '0', 10);
            if (reloadCount < 2) {
                sessionStorage.setItem(APP_METADATA.CHUNK_RETRY_KEY, String(reloadCount + 1));
                logger.warn('🔄 [VersionService] ChunkLoadError detectado. Purgando caché y recargando...');
                
                // Limpiar cachés de navegación si están soportadas
                if ('caches' in window) {
                    caches.keys().then(names => {
                        names.forEach(name => caches.delete(name));
                    }).finally(() => {
                        window.location.reload();
                    });
                } else {
                    window.location.reload();
                }
            } else {
                sessionStorage.removeItem(APP_METADATA.CHUNK_RETRY_KEY);
                logger.error('❌ [VersionService] La recarga automática de chunks excedió el límite seguro.');
            }
        } catch {
            window.location.reload();
        }
    }
}

export const versionService = new VersionService();
export default versionService;
