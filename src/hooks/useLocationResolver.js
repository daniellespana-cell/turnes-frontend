import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from './useGeolocation';
import { GeoService } from '../services/geoService';
import { CIUDADES_COORDS } from '../domain/geography.config';

/**
 * 🛰️ useLocationResolver — Cascada de Degradación Elegante
 *
 * Resuelve la mejor ubicación disponible del usuario siguiendo una jerarquía
 * de 4 niveles (el estándar de la industria: Uber, Airbnb, Indeed):
 *
 *   Nivel 1: GPS del dispositivo (useGeolocation)     → 'exact'
 *   Nivel 2: Perfil del usuario (user.lat/lng)        → 'profile'
 *   Nivel 3: IP Geolocation (Cloudflare Edge)         → 'approximate'
 *   Nivel 4: Vitrina Nacional (centro de Colombia)    → 'national'
 *
 * Retorna:
 *   - lat, lng:        Coordenadas resueltas (nunca null)
 *   - locationMode:    'exact' | 'profile' | 'approximate' | 'national'
 *   - cityName:        Nombre de la ciudad (si se conoce) o null
 *   - isLoading:       true mientras se resuelve la cascada
 *   - radiusKm:        Radio sugerido según el modo
 *   - showDistance:     Si la UI debe mostrar distancias en KM
 */

// Centro geográfico de Colombia (Bogotá) como fallback nacional
const COLOMBIA_CENTER = { lat: 4.5709, lng: -74.2973 };

// Radios sugeridos por modo
const RADIUS_BY_MODE = {
    exact:       5,
    profile:     10,
    approximate: 15,
    national:    2000,
};

export const useLocationResolver = () => {
    const geo = useGeolocation();
    const { user } = useAuth();

    const [ipLocation, setIpLocation] = useState(null);
    const [ipLoading, setIpLoading] = useState(false);
    const ipFetched = useRef(false);

    // ── Nivel 1: GPS del dispositivo ─────────────────────────────────────
    const hasGPS = geo.lat != null && geo.lng != null;

    // ── Nivel 1.5: Manual Override (LocalStorage) ────────────────────────
    const [manualLocation, setManualLocation] = useState(null);

    useEffect(() => {
        const handleStorageChange = () => {
            try {
                const stored = localStorage.getItem('turnes_manual_location');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed?.lat && parsed?.lng) {
                        setManualLocation(parsed);
                        return;
                    }
                }
            } catch (err) { /* ignore */ }
            setManualLocation(null);
        };

        handleStorageChange(); // Carga inicial
        window.addEventListener('storage', handleStorageChange);
        // Custom event por si se actualiza en la misma pestaña
        window.addEventListener('manual_location_updated', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('manual_location_updated', handleStorageChange);
        };
    }, []);

    const hasManual = manualLocation != null;

    // ── Nivel 2: Perfil del usuario (lat/lng de la tabla perfiles) ────────
    const profileLocation = useMemo(() => {
        // Primero: coordenadas directas del perfil
        if (user?.lat != null && user?.lng != null) {
            return { lat: user.lat, lng: user.lng, city: user.ciudad_nombre || null };
        }
        // Segundo: resolver ciudad_nombre desde el diccionario
        if (user?.ciudad_nombre) {
            const searchName = user.ciudad_nombre.trim().toLowerCase();
            const cityKey = Object.keys(CIUDADES_COORDS).find(k => k.toLowerCase() === searchName);
            if (cityKey && CIUDADES_COORDS[cityKey]) {
                const coords = CIUDADES_COORDS[cityKey];
                return { lat: coords.lat, lng: coords.lng, city: cityKey };
            }
        }
        return null;
    }, [user?.lat, user?.lng, user?.ciudad_nombre]);

    const hasProfile = profileLocation != null;

    // ── Nivel 3: IP Geolocation (Cloudflare Edge) ────────────────────────
    // Solo se ejecuta si NO tenemos GPS, Manual ni Perfil
    useEffect(() => {
        if (hasGPS || hasManual || hasProfile) return;
        if (geo.loading) return;
        if (ipFetched.current) return;

        ipFetched.current = true;
        setIpLoading(true);

        GeoService.fetchIPLocation()
            .then(result => {
                if (result?.lat && result?.lng) {
                    setIpLocation(result);
                }
            })
            .finally(() => setIpLoading(false));
    }, [hasGPS, hasManual, hasProfile, geo.loading]);

    // ── Resolución Final ─────────────────────────────────────────────────
    const resolved = useMemo(() => {
        // Nivel 1: GPS
        if (hasGPS) {
            return {
                lat: geo.lat,
                lng: geo.lng,
                locationMode: 'exact',
                cityName: null,
                showDistance: true,
                radiusKm: RADIUS_BY_MODE.exact,
            };
        }

        // Nivel 1.5: Manual Override
        if (hasManual) {
            return {
                lat: manualLocation.lat,
                lng: manualLocation.lng,
                locationMode: 'manual',
                cityName: manualLocation.city,
                showDistance: true,
                radiusKm: RADIUS_BY_MODE.exact,
            };
        }

        // Nivel 2: Perfil
        if (hasProfile) {
            return {
                lat: profileLocation.lat,
                lng: profileLocation.lng,
                locationMode: 'profile',
                cityName: profileLocation.city,
                showDistance: true,
                radiusKm: RADIUS_BY_MODE.profile,
            };
        }

        // Nivel 3: IP (Cloudflare Edge)
        if (ipLocation) {
            return {
                lat: ipLocation.lat,
                lng: ipLocation.lng,
                locationMode: 'approximate',
                cityName: ipLocation.city,
                showDistance: false, // No mostramos KM con ubicación aproximada
                radiusKm: RADIUS_BY_MODE.approximate,
            };
        }

        // Nivel 4: Vitrina Nacional
        return {
            lat: COLOMBIA_CENTER.lat,
            lng: COLOMBIA_CENTER.lng,
            locationMode: 'national',
            cityName: null,
            showDistance: false,
            radiusKm: RADIUS_BY_MODE.national,
        };
    }, [hasGPS, geo.lat, geo.lng, hasManual, manualLocation, hasProfile, profileLocation, ipLocation]);

    return {
        ...resolved,
        isLoading: geo.loading || ipLoading,
        isDenied: geo.denied ?? false,
    };
};
