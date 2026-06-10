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
     * @returns {string|null} URL completa o null.
     */
    getAvatar(path) {
        if (!path) return null;
        if (path.startsWith('http')) return path; // Ya es una URL completa (ej: Google Auth)
        
        // Regla de Negocio: Los avatares viven en el bucket 'avatars'
        return `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
    },

    /**
     * Resuelve la URL pública de un logo de empresa.
     * @param {string|null} path - Ruta guardada en la DB.
     * @returns {string|null} URL completa o null.
     */
    getLogo(path) {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        
        // Regla de Negocio: Las empresas usan el bucket 'avatars' o 'logos' (según config Turnes)
        // Optamos por 'avatars' que es el estándar actual del proyecto.
        return `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
    }
};
