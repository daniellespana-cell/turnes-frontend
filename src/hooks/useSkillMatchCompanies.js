import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { GeoService } from '../services/geoService';
import { getCiudadCoords } from '../domain/geography.config';
import { useAppliedVacancies } from './useAppliedVacancies';

/**
 * useSkillMatchCompanies — Busca empresas con vacantes activas y DISPONIBLES
 * que coincidan con las habilidades Y la zona geográfica del postulante.
 * 
 * Flujo:
 *   1. Lee user.skills, ubicación y appliedIds (vacantes a las que ya se postuló)
 *   2. Resuelve coordenadas de la ciudad/perfil del postulante
 *   3. Trae vacantes activas con coordenadas + tags + postulaciones + empresa
 *   4. Filtra vacantes ya aplicadas o con cupo cerrado
 *   5. Filtra por proximidad geográfica (radio configurable)
 *   6. Agrupa por empresa y descarta empresas con 0 vacantes disponibles
 *   7. Retorna top 3 ordenadas por afinidad
 */

const MAX_RADIUS_KM = 50; // Radio máximo de búsqueda
const PROXIMITY_BONUS = 15; // Puntos extra por estar en la misma zona

export const useSkillMatchCompanies = () => {
    const { user, isAuthenticated } = useAuth();
    const { appliedIds } = useAppliedVacancies();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    const userSkills = useMemo(() => {
        const rawSkills = user?.skills || user?.categorias || user?.categories || [];
        return rawSkills
            .map(s => String(s).toLowerCase().trim())
            .filter(Boolean);
    }, [user?.skills, user?.categorias, user?.categories]);

    const userCoords = useMemo(() => {
        if (user?.lat != null && user?.lng != null) {
            return { lat: Number(user.lat), lng: Number(user.lng) };
        }
        const userCity = user?.direccion || user?.ciudad_nombre || user?.ciudad || user?.location || '';
        return getCiudadCoords(userCity);
    }, [user?.lat, user?.lng, user?.direccion, user?.ciudad_nombre, user?.ciudad, user?.location]);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            setLoading(false);
            return;
        }

        const fetchMatchingCompanies = async () => {
            try {
                // Traer vacantes activas con coordenadas, postulaciones y datos de empresa
                const { data: vacantes, error } = await supabase
                    .from('vacantes')
                    .select(`
                        id,
                        titulo,
                        etiquetas,
                        categoria,
                        pago_monto,
                        lat,
                        lng,
                        status,
                        empresa_id,
                        postulaciones (
                            id,
                            status,
                            step,
                            user_id
                        ),
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

                    // ── 1. VALIDACIÓN DE DISPONIBILIDAD REAL ──
                    // Si el usuario ya se postuló a esta vacante, no cuenta como vacante disponible para él
                    const isAlreadyApplied = appliedIds.has(v.id) || (v.postulaciones || []).some(p => p.user_id === user.id);
                    if (isAlreadyApplied) return;

                    // Si la vacante ya fue cerrada, contratada o finalizada, no está disponible
                    const isFulfilled = (v.postulaciones || []).some(p => ['contratado', 'finalizado', 'sellado'].includes(p.status) || p.step === 4);
                    if (isFulfilled) return;

                    // ── 2. PROXIMITY CHECK ──
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

                    // ── 3. SKILLS OVERLAP ──
                    const vacancyTags = (v.etiquetas || []).map(t => String(t).toLowerCase().trim());
                    const vacancyCategory = v.categoria ? String(v.categoria).toLowerCase().trim() : '';

                    let matchCount = 0;
                    userSkills.forEach(skill => {
                        if (vacancyTags.some(t => t.includes(skill) || skill.includes(t))) matchCount++;
                        if (vacancyCategory && (vacancyCategory.includes(skill) || skill.includes(vacancyCategory))) matchCount++;
                    });

                    // Si el postulante tiene skills definidos pero no hay match en esta vacante, descartar
                    if (userSkills.length > 0 && matchCount === 0) return;

                    // ── 4. AGREGAR A EMPRESA DISPONIBLE ──
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

                // Filtrar solo empresas que TENGAN al menos 1 vacante disponible
                const availableCompanies = Array.from(companyMap.values()).filter(c => c.vacancyCount > 0);

                // Calcular % de afinidad compuesto y ordenar
                const ranked = availableCompanies
                    .map(c => {
                        let score = 0;

                        // Skills component (max 50 pts)
                        if (userSkills.length > 0) {
                            score += Math.round((c.totalMatchScore / userSkills.length) * 50);
                        } else {
                            score += 25; // Base score si aún no define skills
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
                            affinity: Math.min(100, Math.max(10, score)),
                            distance: c.nearestDistance !== Infinity 
                                ? GeoService.formatDistance(c.nearestDistance, true) 
                                : 'En tu zona',
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
    }, [isAuthenticated, user?.id, userSkills, userCoords, appliedIds]);

    return { companies, loading };
};
