import { useMemo } from 'react';
import { GeoService } from '../services/geoService';
import { MatchService } from '../services/matchService';

/**
 * useVacancyScoring
 *
 * Single responsibility: applying the match scoring algorithm and
 * all client-side filter predicates to a list of raw normalized vacancies.
 *
 * Scoring uses rawLat/rawLng (not jitter coords) to ensure accurate distances.
 * Filtering respects all 5 dimensions: category, search, type, schedule, skills, urgente, distance.
 */
export const useVacancyScoring = (vacancies, userLocation, filters, activeCategory, searchQuery, radius, appliedIds) => {

    // ── Scoring Layer ─────────────────────────────────────────────────────────
    // Computed separately so scoring doesn't re-run when filters change
    const scoredVacancies = useMemo(() => {
        const { lat, lng } = userLocation;
        const userCategories = userLocation.user?.skills ?? userLocation.user?.categories ?? [];

        return vacancies.map(v => {
            const dist  = GeoService.calculateDistance(lat, lng, v.rawLat, v.rawLng);
            const score = MatchService.calculateScore(
                { ...v, lat: v.rawLat, lng: v.rawLng },
                { lat, lng, categories: userCategories }
            );

            let distanceStr = dist < 1 ? '< 1 km' : (dist < 999 ? `${dist.toFixed(1)} km` : 'Desconocida');
            if (userLocation.showDistance === false) {
                // Si la ubicación es aproximada (IP) o Nacional, ocultamos los km irreales
                distanceStr = userLocation.locationMode === 'national' ? 'Destacada' : 'Aprox';
            }

            return {
                ...v,
                realDistance: dist,
                distance:     distanceStr,
                matchScore:   score,
                isHighMatch:  score >= 85,
            };
        });
    }, [vacancies, userLocation]);

    // ── Filtering Layer ───────────────────────────────────────────────────────
    const filteredVacancies = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();

        // 🔴 Bug 2 Fix: Hide applied vacancies instantly
        const isNotApplied     = (v) => !appliedIds || !appliedIds.has(v.id);
        const matchesCategory  = (v) => activeCategory === 'TODOS' || v.category === activeCategory;
        const matchesSearch    = (v) => !query || v.title.toLowerCase().includes(query) || v.business.toLowerCase().includes(query);
        const matchesType      = (v) => filters.types.length === 0    || (v.type && filters.types.includes(v.type));
        const matchesSchedule  = (v) => filters.schedules.length === 0 || (v.turnoId && filters.schedules.includes(v.turnoId));
        const matchesSkills    = (v) => filters.skills.length === 0   || filters.skills.every(sk => v.skills.includes(sk));
        const matchesUrgente   = (v) => !filters.urgente              || v.esUrgente === true;
        // ⚠️ DB jitter: vacantes_public & buscar_vacantes_cercanas add ±0.09° (~±5km) random noise.
        // We compensate with a buffer so nearby vacancies are not incorrectly rejected by the radius filter.
        const JITTER_BUFFER_KM = 6;
        // Fallback vacancies bypass strict distance — they're shown with a banner notice
        const matchesDistance  = (v) => v.isFallback || !v.hasCoords || v.realDistance <= (radius + JITTER_BUFFER_KM);

        // 🟢 Strict Match: Only filter when we have real distance data (GPS available).
        // If coords are null, matchScore=0 is spurious — do NOT filter on it.
        const userHasSkills = (userLocation.user?.skills?.length ?? 0) > 0;
        const userHasCoords = userLocation.lat != null && userLocation.lng != null;
        const matchesStrict = (v) => {
            if (!userHasSkills || !userHasCoords) return true; // no GPS = no strict filter
            if (v.isFallback) return true;                     // fallback feed is never penalized
            return v.matchScore >= 30;                         // soft threshold
        };

        return scoredVacancies
            .filter(v =>
                isNotApplied(v) && matchesCategory(v) && matchesSearch(v) && matchesType(v) &&
                matchesSchedule(v) && matchesSkills(v) && matchesUrgente(v) && matchesDistance(v) &&
                matchesStrict(v)
            )
            .sort((a, b) => b.matchScore - a.matchScore);
    }, [scoredVacancies, activeCategory, searchQuery, filters, radius, appliedIds, userLocation]);

    return { filteredVacancies, scoredVacancies };
};
