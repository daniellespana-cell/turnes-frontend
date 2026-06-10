import { SECTOR_MAP, getSectorByTag } from '../domain/vacantes.taxonomy';
import { supabase } from '../services/supabaseClient';

import { useState, useCallback, useEffect, useRef } from 'react';
import { VacancyService } from '../services/vacancyService';
import { GeoService } from '../services/geoService';
import { normalizeVacancy } from '../domain/vacancy.mapper';

// ─── Constants ────────────────────────────────────────────────────────────────
const UNCATEGORIZED_IDS = new Set([null, undefined, '', 'VARIOS', 'otros', 'OTROS']);

const GEO_THRESHOLD_KM = 0.5;
const RPC_BUFFER_KM = 3;

export const useVacancyFetch = (explorationCenter, radius) => {
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [isFallbackMode, setIsFallbackMode] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);

    const PAGE_SIZE = 15;
    const mountedRef = useRef(true);
    const lastFetchedRef = useRef({ lat: null, lng: null });
    const vacanciesCountRef = useRef(0);
    const radiusRef = useRef(radius);
    const centerRef = useRef(explorationCenter);
    const pageRef = useRef(0);
    const fetchIdRef = useRef(0);

    // Keep refs in sync
    useEffect(() => { radiusRef.current = radius; }, [radius]);
    useEffect(() => { centerRef.current = explorationCenter; }, [explorationCenter]);

    const fetch = useCallback(async (force = false, isLoadMore = false, isBackgroundRefresh = false) => {
        const myFetchId = ++fetchIdRef.current;
        const center = centerRef.current;
        const currentRadius = radiusRef.current;
        const currentPage = isLoadMore ? pageRef.current + 1 : 0;

        // Geofencing guard (Skip if movement is negligible)
        if (!force && !isLoadMore && lastFetchedRef.current.lat) {
            const dist = GeoService.calculateDistance(
                center.lat, center.lng,
                lastFetchedRef.current.lat, lastFetchedRef.current.lng
            );
            if (dist < GEO_THRESHOLD_KM) return;
        }

        if (mountedRef.current) {
            if (isLoadMore || isBackgroundRefresh) setIsRefreshing(true);
            else (vacanciesCountRef.current === 0 || force) ? setLoading(true) : setIsRefreshing(true);
            setError(null);
        }

        try {
            // 🚀 Senior Fix: Restaurado el uso de la RPC PostGIS para evitar descargas masivas (OOM Vulnerability)
            // La RPC 'buscar_vacantes_cercanas' ahora incluye 'fecha_turno' y 'empresa_id'
            const { data: rawData, error: fetchError } = await GeoService.fetchNearby(
                center.lat, 
                center.lng, 
                currentRadius + RPC_BUFFER_KM
            );

            if (myFetchId !== fetchIdRef.current) return;

            if (fetchError) throw fetchError;

            if (mountedRef.current) {
                const coordCounts = new Map();
                // 🛡️ Mapeo polimórfico adaptado a la salida de la nueva RPC (que emite columnas planas en lugar de objetos anidados)
                const normalized = (rawData || []).map(v => normalizeVacancy(v, coordCounts, false));

                if (isLoadMore) {
                    setVacancies(prev => [...prev, ...normalized]);
                } else {
                    setVacancies(normalized);
                }

                setHasMore(false);
                pageRef.current = currentPage;
                setPage(currentPage);
                vacanciesCountRef.current = normalized.length;
                lastFetchedRef.current = { lat: center.lat, lng: center.lng };
                setIsFallbackMode(false);
            }
        } catch (err) {
            if (myFetchId !== fetchIdRef.current) return;
            console.error('[useVacancyFetch] Fatal error:', err);
            if (mountedRef.current) setError('No se pudieron sincronizar las vacantes.');
        } finally {
            if (mountedRef.current && myFetchId === fetchIdRef.current) {
                setLoading(false);
                setIsRefreshing(false);
            }
        }
    }, []);

    const loadMore = useCallback(() => {
        if (!loading && !isRefreshing && hasMore) fetch(false, true);
    }, [fetch, loading, isRefreshing, hasMore]);

    const prevRadiusRef = useRef(radius);

    useEffect(() => {
        mountedRef.current = true;
        const timer = setTimeout(() => {
            const isRadiusChanged = prevRadiusRef.current !== radius;
            prevRadiusRef.current = radius;
            fetch(isRadiusChanged);
        }, 300);
        
        return () => {
            clearTimeout(timer);
            mountedRef.current = false;
        };
    }, [explorationCenter.lat, explorationCenter.lng, radius, fetch]);

    useEffect(() => {
        const onFocus = () => {
            if (mountedRef.current && pageRef.current === 0) fetch(false);
        };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [fetch]);

    const subscribeToRealTime = useCallback((isAuthenticated) => {
        if (!isAuthenticated) return () => { };
        const channel = VacancyService.subscribeToNew((payload) => {
            if (!mountedRef.current) return;
            const isDeleted = payload.eventType === 'DELETE';
            const isClosed = payload.eventType === 'UPDATE' && payload.new.status !== 'activa';

            if (isDeleted || isClosed) {
                const idToRemove = payload.old?.id || payload.new?.id;
                if (idToRemove) setVacancies(prev => prev.filter(v => v.id !== idToRemove));
                return;
            }

            if (payload.eventType === 'INSERT' && payload.new?.status === 'activa') {
                VacancyService.getById(payload.new.id).then(({ data, error }) => {
                    if (!data || error || !mountedRef.current) return;
                    const coordCounts = new Map();
                    const normalized = normalizeVacancy(data, coordCounts, false);
                    setVacancies(prev => {
                        if (prev.some(v => v.id === normalized.id)) return prev;
                        return [normalized, ...prev];
                    });
                });
            }
        });
        return () => VacancyService.unsubscribe(channel);
    }, [fetch]);

    return { vacancies, loading, isRefreshing, error, isFallbackMode, hasMore, loadMore, fetch, subscribeToRealTime };
};
