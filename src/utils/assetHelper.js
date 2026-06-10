/**
 * 🎨 ASSET HELPER
 * Centraliza la resolución de URLs de recursos externos (Supabase Storage).
 * Evita hardcoding de URLs en componentes de UI y mappers.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const AssetResolver = {
    /**
     * Resuelve la URL pública de un avatar de perfil.
     * @param {string|null} path - Ruta guardada en la DB.
     * @param {string} fallbackName - Nombre para generar iniciales.
     * @returns {string} URL completa o fallback.
     */
    getAvatar(path, fallbackName = 'Turnes') {
        if (!path) {
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=10b981&color=fff&bold=true&rounded=true`;
        }
        if (path.startsWith('http')) return path; // Ya es una URL completa (ej: Google Auth)
        
        // Regla de Negocio: Los avatares viven en el bucket 'avatars'
        return `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
    },

    /**
     * Resuelve la URL pública de un logo de empresa.
     * @param {string|null} path - Ruta guardada en la DB.
     * @param {string} fallbackName - Nombre para generar iniciales.
     * @returns {string} URL completa o fallback.
     */
    getLogo(path, fallbackName = 'Empresa') {
        if (!path) {
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=3f3f46&color=fff&bold=true&rounded=true&format=svg`;
        }
        if (path.startsWith('http')) return path;
        
        return `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
    }
};
