import { GeoService } from './geoService';
import { SECTOR_MAP, ROLE_MAP } from '../domain/vacantes.taxonomy';

/**
 * 🎯 MATCH ENGINE v2.0 — Precision-First Algorithm
 *
 * SCORING TIERS (max 100 pts):
 *   1. Distancia        → max 35 pts  (proximidad geográfica)
 *   2. Rol Exacto       → max 40 pts  (coincidencia de cargo específico)
 *   3. Sector General   → max 10 pts  (mismo sector pero distinto rol)
 *   4. Reputación       → max 15 pts  (empresa verificada / bien calificada)
 *
 * PENALIZACIONES:
 *   - Si la vacante requiere un ROL ESPECIALIZADO (ej. Panadero) y el usuario
 *     NO tiene ese rol en sus habilidades → -15 pts (empuja la vacante al fondo)
 */
export const MATCH_WEIGHTS = {
    DISTANCE:      35,
    ROLE_EXACT:    40,
    SECTOR_FUZZY:  10,
    REPUTATION:    15,
    ROLE_MISMATCH_PENALTY: -15,
};

export const MatchService = {

    /**
     * Puntúa y ordena una lista de vacantes para un usuario.
     * @param {Array} vacancies
     * @param {Object} userProfile
     * @returns {Array} Vacancies ordenadas por matchScore desc
     */
    scoreVacancies(vacancies, userProfile) {
        if (!userProfile) return vacancies.map(v => ({ ...v, matchScore: 0, isHighMatch: false }));

        return vacancies.map(vacancy => {
            const score = this.calculateScore(vacancy, userProfile);
            return {
                ...vacancy,
                matchScore: score,
                isHighMatch: score >= 80,
            };
        }).sort((a, b) => b.matchScore - a.matchScore);
    },

    /**
     * Algoritmo de Scoring Individual v2.0 (0-100).
     * @param {Object} vacancy
     * @param {Object} user
     * @returns {number} Score 0-100
     */
    calculateScore(vacancy, user) {
        let score = 0;

        // Normalizar habilidades del usuario (puede venir como skills[] o categories[])
        const userSkills = (user.skills ?? user.categories ?? []).map(s => String(s).toLowerCase().trim());

        // ── TIER 1: DISTANCIA (max 35 pts) ──────────────────────────────────
        const hasCoords = user.lat != null && user.lng != null &&
                          vacancy.lat != null && vacancy.lng != null;
        if (hasCoords) {
            const dist = GeoService.calculateDistance(user.lat, user.lng, vacancy.lat, vacancy.lng);
            if (dist < 2)       score += MATCH_WEIGHTS.DISTANCE;            // 35 pts — A la vuelta
            else if (dist < 5)  score += MATCH_WEIGHTS.DISTANCE * 0.75;    // 26 pts — Muy cerca
            else if (dist < 10) score += MATCH_WEIGHTS.DISTANCE * 0.50;    // 17 pts — Cerca
            else if (dist < 20) score += MATCH_WEIGHTS.DISTANCE * 0.25;    // 8 pts  — Alcanzable
            else if (dist < 30) score += MATCH_WEIGHTS.DISTANCE * 0.10;    // 3 pts  — Lejos pero posible
        }

        // ── TIER 2 & 3: COMPATIBILIDAD DE CARGO (max 50 pts total) ─────────
        const vacancyCategory = vacancy.category || vacancy.categoria || '';
        const vacancyTags = (vacancy.tags || vacancy.etiquetas || []).map(t => String(t).toLowerCase().trim());
        const vacancyTitle = String(vacancy.titulo || vacancy.title || '').toLowerCase();

        // Resolver el sector de la vacante para obtener sus roles permitidos
        const sectorData = SECTOR_MAP.get(vacancyCategory?.toUpperCase());
        const allowedRoleIds = sectorData ? (sectorData.roles || []).map(r => r.id.toLowerCase()) : [];
        const allowedRoleLabels = sectorData ? (sectorData.roles || []).map(r => r.label.toLowerCase()) : [];

        // 2a. Rol Exacto: ¿alguna habilidad del usuario coincide directamente con el título/etiqueta de la vacante?
        const hasExactRoleMatch = userSkills.some(skill => {
            const skillClean = skill.toLowerCase();
            // Chequear contra el título de la vacante
            if (vacancyTitle.includes(skillClean) || skillClean.includes(vacancyTitle.split(' ')[0])) return true;
            // Chequear contra las etiquetas de la vacante
            if (vacancyTags.some(tag => tag.includes(skillClean) || skillClean.includes(tag))) return true;
            // Chequear contra los roles del sector buscando el ID del rol
            const roleEntry = Array.from(ROLE_MAP.values()).find(r =>
                r.label.toLowerCase() === skillClean || skillClean.includes(r.label.toLowerCase().split(' ')[0])
            );
            if (roleEntry && vacancyTitle.includes(roleEntry.label.toLowerCase())) return true;
            return false;
        });

        if (hasExactRoleMatch) {
            // Coincidencia exacta de rol → puntuación máxima de compatibilidad
            score += MATCH_WEIGHTS.ROLE_EXACT;
        } else {
            // 2b. Sector General: ¿el usuario pertenece al mismo sector aunque sea distinto rol?
            const userBelongsToSector = userSkills.some(skill => {
                return allowedRoleLabels.some(roleLabel =>
                    roleLabel.includes(skill.split(' ')[0]) || skill.includes(roleLabel.split(' ')[0])
                );
            });

            if (userBelongsToSector) {
                // Mismo sector, distinto rol → puntuación baja (no merecen prioridad)
                score += MATCH_WEIGHTS.SECTOR_FUZZY;

                // ── PENALIZACIÓN por Rol Especializado Incompatible ──────────
                // Si la vacante exige un rol muy específico (ej. Panadero, Bartender, Barista)
                // y el usuario no lo tiene → penalizar para que baje en el ranking
                const isSpecializedVacancy = this._isSpecializedRole(vacancyTitle, vacancyTags);
                if (isSpecializedVacancy) {
                    score += MATCH_WEIGHTS.ROLE_MISMATCH_PENALTY; // -15 pts
                }
            }
            // Si no pertenece al sector: 0 pts (sigue mostrándose pero al final)
        }

        // ── TIER 4: REPUTACIÓN DE EMPRESA (max 15 pts) ──────────────────────
        if (vacancy.isVerified) score += MATCH_WEIGHTS.REPUTATION * 0.6;        // 9 pts
        if ((vacancy.rating || 0) >= 4.5) score += MATCH_WEIGHTS.REPUTATION * 0.4; // 6 pts

        return Math.max(0, Math.min(100, Math.round(score)));
    },

    /**
     * Detecta si una vacante requiere un rol especializado que no es genérico.
     * Se considera especializado si el título contiene keywords de roles específicos.
     * @param {string} title
     * @param {string[]} tags
     * @returns {boolean}
     */
    _isSpecializedRole(title, tags) {
        const SPECIALIZED_KEYWORDS = [
            'panadero', 'bartender', 'barista', 'sommelier', 'repostero', 'pastelero',
            'parrillero', 'sushi', 'chef', 'electricista', 'plomero', 'soldador',
            'contador', 'abogado', 'médico', 'enfermero', 'conductor', 'taxista',
            'mecánico', 'estilista', 'barbero', 'manicurista', 'terapeuta',
        ];
        const combined = `${title} ${tags.join(' ')}`.toLowerCase();
        return SPECIALIZED_KEYWORDS.some(kw => combined.includes(kw));
    }
};
