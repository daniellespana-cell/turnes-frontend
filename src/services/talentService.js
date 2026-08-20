import { supabase } from './supabaseClient';
import { normalizeCandidateProfile } from '../domain/profile.mapper';
import { GeoService } from './geoService';

/**
 * TalentService
 * Centraliza la búsqueda y filtrado de talento.
 * Mantiene la UI limpia de llamadas a la base de datos.
 */
class TalentService {
    /**
     * Motor de Búsqueda de Talento (Radar)
     */
    async getRadarTalent(lat, lng, query = '', radiusKm = 5) {
        try {
            // 🛑 ZERO-TRUST: Mismo bloqueo estricto que en searchTalent
            if (!lat || !lng) {
                console.warn("[TalentService] GPS requerido para radar.");
                return [];
            }

            // 1. Llamada primaria al Radar (PostGIS)
            const { data, error } = await supabase.rpc('buscar_talento_cercano', {
                user_lat: lat,
                user_lng: lng,
                radio_km: radiusKm,
                search_query: query,
                p_limit: 50
            });

            if (error) throw error;
            
            // 🛡️ MAPEO SSOT: Aseguramos que el radar lea la columna oficial
            const processedData = (data || []).map(candidate => ({
                ...candidate,
                rating: candidate.reputation_score ?? candidate.rating ?? 0.0,
                reviewsCount: candidate.reputation_count ?? 0
            }));

            return this._formatTalent(processedData);

        } catch (e) {
            console.error("TalentService Critical Error:", e);
            return [];
        }
    }

    /**
     * Búsqueda general de talento (Soporta Paginación Espacial Cursor-based)
     */
    async searchTalent(lat, lng, query, radiusKm = 5, limit = 20, cursor = null, sector = 'TODOS', signal = null) {
        try {
            // 🛑 ZERO-TRUST: Si el usuario/empresa no tiene ubicación configurada ni GPS activo,
            // cancelamos la petición al instante. NO se inyectan coordenadas falsas.
            if (!lat || !lng) {
                return { data: [], error: { message: "GPS_REQUIRED" } };
            }

            let queryBuilder = supabase.rpc('buscar_talento_cercano', {
                user_lat: lat,
                user_lng: lng,
                radio_km: radiusKm,
                search_query: query || '',
                p_limit: limit,
                p_last_distance: cursor?.lastDistance ?? null,
                p_last_id: cursor?.lastId ?? null,
                p_sector: sector
            });

            if (signal) {
                queryBuilder = queryBuilder.abortSignal(signal);
            }

            const { data, error } = await queryBuilder;

            if (error) throw error;
            return { data: this._formatTalent(data), error: null };
        } catch (e) {
            // Ignoramos el error si fue por aborto provocado
            if (e.name === 'AbortError' || (e.message && e.message.includes('aborted'))) {
                return { data: [], error: { isAbort: true } };
            }
            console.error("TalentService Critical Error:", e);
            return { data: [], error: e };
        }
    }

    /**
     * 🕵️ AUDITORÍA DE LA VERDAD: Obtiene el perfil con el rating real de la tabla reviews
     */
    async getDetailedProfile(candidateId) {
        if (!candidateId) return null;

        try {
            const { data: profile, error } = await supabase
                .from('perfiles')
                .select('*')
                .eq('id', candidateId)
                .single();

            if (error) throw error;
            return normalizeCandidateProfile(profile);
        } catch (e) {
            console.error("TalentService Critical Error:", e);
            return null;
        }
    }

    _formatTalent(data) {
        return (data || []).map(t => {
            const normalized = normalizeCandidateProfile(t);
            return {
                ...normalized,
                // 🛡️ REFUERZO DE DATOS: Aseguramos que nombre_display sea el de la DB real
                // Se eliminó la sobreescritura de rating para que el mapper aplique el Beneficio de la duda (5.0)
                nombre_display: t.nombre_display,
                distancia_mts: t.distancia_mts,
                display_distance: GeoService.formatDistance(t.distancia_mts, false),
                match_score: t.match_score || 0
            };
        });
    }
}

export const talentService = new TalentService();
