import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocationResolver } from './useLocationResolver';
import { GeoService } from '../services/geoService';
import { MatchService } from '../services/matchService';
import { applicationService } from '../services/applicationService';
import { VacancyService } from '../services/vacancyService';
import { normalizeVacancy } from '../domain/vacancy.mapper';

export const useWorkerDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const [recommendationsLoading, setRecommendationsLoading] = useState(true);
    const [recommended, setRecommended] = useState([]);
    const [appliedIds, setAppliedIds] = useState(new Set());
    const [isApplying, setIsApplying] = useState(null);

    // 🛰️ Cascading Location Resolver (GPS -> Profile -> IP -> National)
    const location = useLocationResolver();

    // ── Real-time Sync for Applied Status (SSOT via Service) ─────────────────
    const fetchAppliedIds = useCallback(async () => {
        if (!isAuthenticated || !user?.id) {
            setAppliedIds(new Set());
            return;
        }
        const { data, error } = await applicationService.getAppliedVacancyIds(user.id);
        if (!error) setAppliedIds(new Set(data));
    }, [isAuthenticated, user?.id]);

    useEffect(() => {
        fetchAppliedIds();
        if (!isAuthenticated || !user?.id) return;

        // 🛡️ Suscripción Delegada al Servicio
        const channel = applicationService.subscribeToUserApplications(user.id, () => {
            fetchAppliedIds();
        });

        return () => { 
            import('../services/supabaseClient').then(m => m.supabase.removeChannel(channel));
        };
    }, [fetchAppliedIds, isAuthenticated, user?.id]);

    const lastFetchedCoord = useRef({ lat: null, lng: null });

    // 🔄 FETCH REAL RECOMMENDATIONS
    useEffect(() => {
        let isCancelled = false;
        const timer = setTimeout(async () => {
            if (location.loading || !user) return;

            const lat = location.lat;
            const lng = location.lng;

            if (!lat || !lng) {
                setRecommendationsLoading(false);
                return;
            }

            // 🛡️ ANTI-DDOS: Prevenir llamados si la coordenada no cambió significativamente (0.5km)
            if (lastFetchedCoord.current.lat) {
                const dist = GeoService.calculateDistance(lat, lng, lastFetchedCoord.current.lat, lastFetchedCoord.current.lng);
                if (dist < 0.5) return;
            }

            try {
                // 🚀 Optimized Fetch via PostGIS RPC (Bypasses RLS issues and filters by distance on DB)
                // Se solicitan 100 para que el algoritmo de Match tenga suficientes vacantes para calificar
                const { data, error } = await GeoService.fetchNearby(lat, lng, location.radiusKm || 30, user.id, 100);

                if (!error && data && !isCancelled) {
                    lastFetchedCoord.current = { lat, lng };
                    // 2. Normalize and inject distance for UI
                    const normalized = data.map(v => {
                        const norm = normalizeVacancy(v, new Map(), false);
                        return {
                            ...norm,
                            distance: (v.distancia_mts != null && v.distancia_mts < 1000) 
                                ? '< 1 km' 
                                : (v.distancia_mts ? `${(v.distancia_mts / 1000).toFixed(1)} km` : '< 1 km')
                        };
                    });

                    const userProfile = {
                        ...user,
                        lat,
                        lng,
                        categories: user?.categorias || user?.categories || [],
                    };

                    // 3. Score and Sort by Relevance
                    const scored = MatchService.scoreVacancies(normalized, userProfile);
                    setRecommended(scored.slice(0, 3));
                }
            } catch (err) {
                console.error('[useWorkerDashboard] Error loading recommendations:', err);
            } finally {
                if (!isCancelled) setRecommendationsLoading(false);
            }
        }, 800); // 🛡️ 800ms Debounce to let GPS stabilize

        return () => {
            isCancelled = true;
            clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.loading, location.lat, location.lng, location.radiusKm, user?.id]);

    // ── Apply to vacancy ──────────────────────────────────────────────────────
    const applyToVacancy = useCallback(async (vacancyId) => {
        if (!isAuthenticated || !user?.id) return { success: false, message: 'Inicia sesión.' };

        setIsApplying(vacancyId);
        setAppliedIds(prev => {
            const next = new Set(prev);
            next.add(vacancyId);
            return next;
        });

        try {
            const { error: applyError } = await VacancyService.apply(vacancyId, user.id);
            if (applyError) throw applyError;
            return { success: true, message: '¡Postulación enviada!' };
        } catch (err) {
            setAppliedIds(prev => {
                const revert = new Set(prev);
                revert.delete(vacancyId);
                return revert;
            });
            return { success: false, message: 'Error al postularse.' };
        } finally {
            setIsApplying(null);
        }
    }, [isAuthenticated, user?.id]);

    const dashboardData = useMemo(() => {
        if (!user) return null;

        const profileFields = [
            user?.nombre_display,
            user?.avatar_url,
            user?.bio,
            user?.sector,
            user?.direccion,
            user?.skills?.length > 0,
        ];
        const filledFields = profileFields.filter(Boolean).length;
        const profileProgress = Math.round((filledFields / profileFields.length) * 100);
        const showOnboarding = profileProgress < 80;

        const priorityAction = {
            type: 'RECOMMENDATIONS',
            data: recommended,
            title: 'Vacantes para ti hoy',
            subtitle: location.locationMode === 'gps' 
                ? 'Basado en tu ubicación exacta' 
                : location.locationMode === 'profile'
                    ? 'Basado en la ciudad de tu perfil'
                    : 'Recomendaciones generales',
            actionLabel: 'Explorar Todo',
        };

        return {
            user,
            profileProgress,
            showOnboarding,
            priorityAction,
        };
    }, [user, recommended, location.locationMode]);

    return {
        ...dashboardData,
        recommendationsLoading,
        appliedIds,
        isApplying,
        applyToVacancy,
        locationMode: location.locationMode,
        cityName: location.cityName,
    };
};
