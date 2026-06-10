import { supabase } from './supabaseClient';
import { normalizeCandidateProfile } from '../domain/profile.mapper';

/**
 * TalentService
 * Centraliza la búsqueda y filtrado de talento.
 * Mantiene la UI limpia de llamadas a la base de datos.
 */
class TalentService {
    /**
     * Motor de Búsqueda de Talento (Radar)
     */
    async getRadarTalent(lat, lng, query = '') {
        try {
            // 1. Llamada primaria al Radar (PostGIS)
            const { data, error } = await supabase.rpc('buscar_talento_cercano', {
                user_lat: lat || 7.0682,
                user_lng: lng || -73.1698,
                radio_km: 5, // Radio máximo exigido
                search_query: query
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
     * Búsqueda general de talento (Soporta Paginación para Infinite Scroll)
     */
    async searchTalent(lat, lng, query, radiusKm = 5, limit = 20, offset = 0) {
        try {
            const { data, error } = await supabase.rpc('buscar_talento_cercano', {
                user_lat: lat || 7.0682,
                user_lng: lng || -73.1698,
                radio_km: radiusKm,
                search_query: query || '',
                p_limit: limit,
                p_offset: offset
            });

            if (error) throw error;
            return { data: this._formatTalent(data), error: null };
        } catch (e) {
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
                // 🛡️ REFUERZO DE DATOS: Aseguramos que rating y nombre_display sean los de la DB real
                rating: t.rating, 
                nombre_display: t.nombre_display,
                distancia_mts: t.distancia_mts,
                display_distance: t.distancia_mts ? (t.distancia_mts / 1000).toFixed(1) : "0.0",
                match_score: t.match_score || 0
            };
        });
    }
}

export const talentService = new TalentService();
