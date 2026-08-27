import React from 'react';

/**
 * 🛡️ LAZY WITH RETRY (Enterprise Self-Healing Dynamic Importer)
 * 
 * Principio SSOT: Centraliza toda la carga diferida de páginas y componentes.
 * 
 * Capacidades:
 * 1. Resistencia a micro-cortes de red móvil (4G/5G) mediante reintento con backoff.
 * 2. Auto-recuperación transparente ante despliegues de producción (Chunk Mismatch / 404).
 * 3. Purga automática de CacheStorage / Service Worker si el bundle cambió en el servidor.
 * 4. Protección contra bucles infinitos de recarga mediante cerrojo en sessionStorage.
 *
 * @param {() => Promise<{ default: React.ComponentType<any> }>} componentImport - Función de importación dinámica (ej. () => import('./MiComponente'))
 * @returns {React.LazyExoticComponent<React.ComponentType<any>>} Componente lazy seguro
 */
export const lazyWithRetry = (componentImport) =>
    React.lazy(async () => {
        const isRefreshLocked = typeof window !== 'undefined' && 
            JSON.parse(window.sessionStorage.getItem('turnes_lazy_refresh_locked') || 'false');

        try {
            const module = await componentImport();
            if (typeof window !== 'undefined') {
                window.sessionStorage.removeItem('turnes_lazy_refresh_locked');
            }
            return module;
        } catch (initialError) {
            // Intento 2: Pequeño retardo de 500ms para sobrepasar micro-cortes de red móvil
            try {
                await new Promise((resolve) => setTimeout(resolve, 500));
                const retryModule = await componentImport();
                if (typeof window !== 'undefined') {
                    window.sessionStorage.removeItem('turnes_lazy_refresh_locked');
                }
                return retryModule;
            } catch (persistentError) {
                // Intento 3: Si el error persiste (despliegue nuevo o hash cambiado en CDN)
                if (typeof window !== 'undefined' && !isRefreshLocked) {
                    window.sessionStorage.setItem('turnes_lazy_refresh_locked', 'true');

                    // Purgar CacheStorage para eliminar chunks obsoletos
                    if ('caches' in window) {
                        try {
                            const cacheNames = await caches.keys();
                            await Promise.all(cacheNames.map((name) => caches.delete(name)));
                        } catch {
                            // Silencioso
                        }
                    }

                    // Recarga forzada limpia desde el servidor
                    window.location.reload();
                    return { default: () => null };
                }

                throw persistentError;
            }
        }
    });

export default lazyWithRetry;
