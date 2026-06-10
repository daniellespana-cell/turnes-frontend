import { supabase } from './supabaseClient';

/**
 * 📦 Storage Service (Single Source of Truth)
 * 
 * Abstrae toda la comunicación con Supabase Storage (Buckets).
 * La UI no debe saber cómo se suben los archivos, solo debe pedir URLs.
 */
class StorageService {
    
    /**
     * Sube un avatar comprimido al bucket 'avatars'.
     * @param {Blob|File} fileBlob - El archivo binario (comprimido preferiblemente).
     * @param {string} userId - ID del usuario (para organizar las carpetas).
     * @returns {Promise<string>} La URL final pública del avatar.
     */
    async uploadAvatar(fileBlob, userId) {
        try {
            if (!fileBlob || !userId) throw new Error("Archivo o UserId faltante");

            // Generamos un nombre único para evitar colisiones de caché
            const timestamp = new Date().getTime();
            // Formato: /userId/1715456456.jpg
            const filePath = `${userId}/${timestamp}.jpg`;

            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(filePath, fileBlob, {
                    cacheControl: '3600',
                    upsert: false // False porque siempre creamos un nombre nuevo con el timestamp
                });

            if (error) throw error;

            // Retornamos la ruta que guardaremos en la base de datos (Postgres)
            // assetHelper.js se encargará de resolver esta ruta a URL completa cuando se lea.
            return data.path;

        } catch (error) {
            console.error("💥 StorageService.uploadAvatar Error:", error);
            throw new Error("No se pudo subir la imagen al servidor. Inténtalo de nuevo.");
        }
    }
}

export const storageService = new StorageService();
