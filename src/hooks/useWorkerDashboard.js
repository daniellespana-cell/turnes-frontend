import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from './useGeolocation';
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

    // 🛰️ GPS SENSOR
    const geo = useGeolocation();

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

    // 🔄 FETCH REAL RECOMMENDATIONS
    useEffect(() => {
        async function loadRecommendations() {
            if (geo.loading || !user) return;

            // Coordenadas reales: GPS > perfil del usuario > null
            const lat = geo.lat ?? user?.lat ?? null;
            const lng = geo.lng ?? user?.lng ?? null;

            if (!lat || !lng) {
                setRecommendationsLoading(false);
                return;
            }

            try {
                // 🚀 Optimized Fetch via PostGIS RPC (Bypasses RLS issues and filters by distance on DB)
                const { data, error } = await GeoService.fetchNearby(lat, lng, 30, user.id);

                if (!error && data) {
                    // 2. Normalize and inject distance for UI
                    const normalized = data.map(v => {
                        const norm = normalizeVacancy(v, new Map(), false);
                        return {
                            ...norm,
                            distance: v.distancia_mts ? `${(v.distancia_mts / 1000).toFixed(1)} km` : '1.0 km'
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
                setRecommendationsLoading(false);
            }
        }

        loadRecommendations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [geo.loading, geo.lat, geo.lng, user?.id, user?.lat, user?.lng]);

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
            subtitle: geo.lat ? 'Basado en tu ubicación actual' : 'Recomendaciones generales',
            actionLabel: 'Explorar Todo',
        };

        return {
            user,
            profileProgress,
            showOnboarding,
            priorityAction,
        };
    }, [user, recommended, geo.lat]);

    return {
        ...dashboardData,
        recommendationsLoading,
        appliedIds,
        isApplying,
        applyToVacancy,
        gpsAvailable: Boolean(geo.lat),
        gpsDenied: geo.denied,
    };
};
