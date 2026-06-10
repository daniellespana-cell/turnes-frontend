import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { GeoService } from '../services/geoService';
import { getCiudadCoords } from '../domain/geography.config';

/**
 * useSkillMatchCompanies — Busca empresas con vacantes activas
 * que coincidan con las habilidades Y la zona geográfica del postulante.
 * 
 * Flujo:
 *   1. Lee user.skills y user.direccion del AuthContext
 *   2. Resuelve coordenadas de la ciudad del postulante via CIUDADES_COORDS
 *   3. Trae vacantes activas con lat/lng + tags + empresa
 *   4. Filtra por proximidad geográfica (radio configurable)
 *   5. Calcula overlap de skills
 *   6. Agrupa por empresa, rankea por (skills + proximidad + verificación)
 *   7. Retorna top 3
 */

const MAX_RADIUS_KM = 50; // Radio máximo de búsqueda
const PROXIMITY_BONUS = 15; // Puntos extra por estar en la misma zona

export const useSkillMatchCompanies = () => {
    const { user, isAuthenticated } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        const fetchMatchingCompanies = async () => {
            try {
                const userSkills = (user?.skills || user?.categorias || user?.categories || [])
                    .map(s => String(s).toLowerCase().trim())
                    .filter(Boolean);

                // Resolver coordenadas del postulante desde su ciudad base
                const userCity = user?.direccion || user?.location || '';
                const userCoords = getCiudadCoords(userCity);

                // Si no hay skills NI ubicación, no podemos hacer match
                if (userSkills.length === 0 && !userCoords) {
                    setLoading(false);
                    return;
                }

                // Traer vacantes activas con coordenadas y datos de empresa
                const { data: vacantes, error } = await supabase
                    .from('vacantes')
                    .select(`
                        id,
                        titulo,
                        tags,
                        categoria,
                        pago_monto,
                        lat,
                        lng,
                        empresa_id,
                        empresas!inner(
                            id,
                            nombre_comercial,
                            logo_url,
                            verificado
                        )
                    `)
                    .eq('status', 'activa')
                    .limit(100);

                if (error) throw error;

                // Agrupar vacantes por empresa y calcular afinidad compuesta
                const companyMap = new Map();

                (vacantes || []).forEach(v => {
                    const empresa = v.empresas;
                    if (!empresa) return;

                    // ── PROXIMITY CHECK ──
                    let isInZone = false;
                    let distanceKm = null;

                    if (userCoords && v.lat != null && v.lng != null) {
                        distanceKm = GeoService.calculateDistance(
                            userCoords.lat, userCoords.lng,
                            v.lat, v.lng
                        );
                        isInZone = distanceKm <= MAX_RADIUS_KM;
                    }

                    // Si tenemos ubicación y la vacante está fuera de zona, descartarla
                    if (userCoords && !isInZone) return;

                    // ── SKILLS OVERLAP ──
                    const vacancyTags = (v.tags || []).map(t => String(t).toLowerCase().trim());
                    const vacancyCategory = v.categoria ? String(v.categoria).toLowerCase().trim() : '';

                    let matchCount = 0;
                    userSkills.forEach(skill => {
                        if (vacancyTags.some(t => t.includes(skill) || skill.includes(t))) matchCount++;
                        if (vacancyCategory && (vacancyCategory.includes(skill) || skill.includes(vacancyCategory))) matchCount++;
                    });

                    // Si tiene skills definidos pero no hay match, descartar
                    if (userSkills.length > 0 && matchCount === 0) return;

                    // ── AGREGAR A EMPRESA ──
                    const key = empresa.id;
                    if (!companyMap.has(key)) {
                        companyMap.set(key, {
                            id: empresa.id,
                            name: empresa.nombre_comercial,
                            logo: empresa.logo_url,
                            verified: empresa.verificado || false,
                            vacancyCount: 0,
                            totalMatchScore: 0,
                            nearestDistance: Infinity,
                            topVacancy: null,
                        });
                    }

                    const entry = companyMap.get(key);
                    entry.vacancyCount++;
                    entry.totalMatchScore += matchCount;

                    // Tracking la vacante más cercana
                    if (distanceKm !== null && distanceKm < entry.nearestDistance) {
                        entry.nearestDistance = distanceKm;
                    }

                    // Guardar la vacante con mejor pago como destacada
                    if (!entry.topVacancy || (v.pago_monto || 0) > (entry.topVacancy.pago_monto || 0)) {
                        entry.topVacancy = { id: v.id, titulo: v.titulo, pago_monto: v.pago_monto };
                    }
                });

                // Calcular % de afinidad compuesto y ordenar
                const ranked = Array.from(companyMap.values())
                    .map(c => {
                        let score = 0;

                        // Skills component (max 50 pts)
                        if (userSkills.length > 0) {
                            score += Math.round((c.totalMatchScore / userSkills.length) * 50);
                        }

                        // Proximity bonus (max 15 pts) — más cerca = más puntos
                        if (c.nearestDistance !== Infinity) {
                            const proxScore = Math.max(0, 1 - (c.nearestDistance / MAX_RADIUS_KM));
                            score += Math.round(proxScore * PROXIMITY_BONUS);
                        }

                        // Verification bonus (15 pts)
                        if (c.verified) score += 15;

                        // Volume bonus (max 10 pts) — más vacantes = más oportunidades
                        score += Math.min(10, c.vacancyCount * 3);

                        return {
                            ...c,
                            affinity: Math.min(100, score),
                            distance: c.nearestDistance !== Infinity 
                                ? `${c.nearestDistance.toFixed(0)} km` 
                                : null,
                        };
                    })
                    .sort((a, b) => b.affinity - a.affinity)
                    .slice(0, 3);

                setCompanies(ranked);
            } catch (err) {
                console.error('[useSkillMatchCompanies] Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMatchingCompanies();
    }, [isAuthenticated, user?.id, user?.skills?.length, user?.direccion]);

    return { companies, loading };
};
