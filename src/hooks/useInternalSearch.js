import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { talentService } from '../services/talentService';
import { GeoService } from '../services/geoService';
import { AssetResolver } from '../utils/assetHelper';
import { getCiudadCoords } from '../domain/geography.config';

// ─── Fallback Geo ─────────────────────────────────────────────────────────────
/** Centro geográfico por defecto (Girón, Santander) cuando no hay geo disponible */
const DEFAULT_COORDS = { lat: 4.5709, lng: -74.2973 };

/** Radio de búsqueda estricto en km */
const SEARCH_RADIUS_KM = 5;

// ─── Normalizadores puros (sin side-effects) ─────────────────────────────────

/**
 * Convierte un resultado de búsqueda de talento al shape de la UI.
 * @param {Object} item  - Registro raw de talento del RPC
 * @param {string} locationStr - Ciudad de búsqueda (del URL)
 * @returns {SearchResult}
 */
const normalizeTalentResult = (item, locationStr) => ({
    id:       item.id,
    type:     'worker',
    title:    item.bio || 'Profesional de Turnes',
    name:     item.nombre_display,
    location: locationStr || 'Cercano a ti',
    price:    '$ -- / turno',
    rating:   item.rating || 5.0,
    tags:     item.skills || [],
    image:    AssetResolver.getAvatar(item.avatar_url)
           || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nombre_display)}&background=random`
});

/**
 * Convierte una vacante cercana al shape de la UI.
 * @param {Object} v          - Registro raw de vacante
 * @param {string} locationStr - Ciudad de búsqueda (del URL)
 * @returns {SearchResult}
 */
const normalizeVacancyResult = (v, locationStr) => ({
    id:       v.id,
    type:     'job',
    title:    v.titulo,
    name:     v.empresa_nombre_comercial,
    location: locationStr || 'Cercano',
    price:    `$${v.pago_monto?.toLocaleString('es-CO') || '0'} / turno`,
    rating:   4.9,
    tags:     [v.tipo_turno, v.modalidad, v.categoria].filter(Boolean),
    image:    AssetResolver.getAvatar(v.empresa_logo_url)
           || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80'
});

/**
 * Filtra vacantes por texto libre (título, descripción o categoría).
 * Función pura — sin side effects.
 * @param {Array}  vacancies - Lista de vacantes normalizadas
 * @param {string} query     - Texto de búsqueda del usuario
 */
const filterByQuery = (vacancies, query) => {
    if (!query) return vacancies;
    const q = query.toLowerCase();
    return vacancies.filter(v =>
        v.titulo?.toLowerCase().includes(q) ||
        v.descripcion?.toLowerCase().includes(q) ||
        v.categoria?.toLowerCase().includes(q)
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useInternalSearch
 *
 * Encapsula TODA la lógica de búsqueda interna de Turnes:
 *   - Lectura de parámetros de URL (?q=&loc=)
 *   - Resolución de coordenadas desde el nombre de ciudad
 *   - Búsqueda bifurcada: talento (modo empresa) / vacantes (modo candidato)
 *   - Normalización de resultados al shape de la UI
 *   - Filtrado client-side por query text
 *
 * La página InternalSearch.jsx SOLO consume este hook — nunca habla con servicios directamente.
 */
export const useInternalSearch = () => {
    const { user }          = useAuth();
    const [searchParams]    = useSearchParams();

    const query       = searchParams.get('q')   || '';
    const locationStr = searchParams.get('loc') || '';
    const isBusiness  = user?.role === 'BUSINESS_ROLE';

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    const fetchResults = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Resolver coordenadas desde el nombre de ciudad (dominio geográfico)
            const coords = locationStr
                ? (getCiudadCoords(locationStr) ?? DEFAULT_COORDS)
                : DEFAULT_COORDS;

            const { lat, lng } = coords;

            if (isBusiness) {
                // ── MODO EMPRESA: Buscar candidatos cercanos ──────────────────
                const { data, error: rpcError } = await talentService.searchTalent(
                    lat, lng, query, SEARCH_RADIUS_KM
                );
                if (rpcError) throw rpcError;

                setResults((data || []).map(item => normalizeTalentResult(item, locationStr)));

            } else {
                // ── MODO CANDIDATO: Buscar vacantes cercanas ──────────────────
                // Limit=100 para replicar el comportamiento previo (falta paginación real aquí)
                const { data, error: rpcError } = await GeoService.fetchNearby(
                    lat, lng, SEARCH_RADIUS_KM, null, 100
                );
                if (rpcError) throw rpcError;

                const filtered = filterByQuery(data || [], query);
                setResults(filtered.map(v => normalizeVacancyResult(v, locationStr)));
            }

        } catch (err) {
            setError('Hubo un error al cargar los resultados. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    }, [query, locationStr, isBusiness]);

    useEffect(() => { fetchResults(); }, [fetchResults]);

    return {
        results,
        loading,
        error,
        query,
        locationStr,
        isBusiness,
        retry: fetchResults
    };
};
