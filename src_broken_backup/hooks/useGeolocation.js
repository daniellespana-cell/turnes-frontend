import { useState, useEffect, useRef } from 'react';

/**
 * 🛰️ useGeolocation — Senior version
 *
 * FIX A8: Migrated from getCurrentPosition → watchPosition.
 *         The position now updates as the user moves, enabling
 *         accurate real-time proximity search for mobile workers.
 *
 * FIX A12: Exposes `denied` state so the UI can display a
 *          contextual "Enable GPS for better results" hint.
 */
const DEFAULT_OPTIONS = {
    enableHighAccuracy: true,
    timeout:            15000,  // 15s: gives slower hardware GPS time to lock
    maximumAge:         30000,  // Accept a cached position up to 30s old (fast UX)
};

export const useGeolocation = (options = {}) => {
    const [location, setLocation] = useState({
        lat:      null,
        lng:      null,
        accuracy: null,
        loading:  true,
        error:    null,
        denied:   false,
    });

    // Persist the watch ID for cleanup
    const watchIdRef = useRef(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation(prev => ({
                ...prev,
                loading: false,
                error:   'Geolocalización no soportada en este dispositivo.',
            }));
            return;
        }

        const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

        const onSuccess = ({ coords }) => {
            setLocation({
                lat:      coords.latitude,
                lng:      coords.longitude,
                accuracy: coords.accuracy,
                loading:  false,
                error:    null,
                denied:   false,
            });
        };

        const onError = (err) => {
            setLocation(prev => ({
                ...prev,
                loading: false,
                error:   err.message,
                denied:  err.code === err.PERMISSION_DENIED,
            }));
        };

        // A8: watchPosition updates on every significant device movement
        watchIdRef.current = navigator.geolocation.watchPosition(
            onSuccess, onError, mergedOptions
        );

        return () => {
            if (watchIdRef.current != null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // options is intentionally excluded — shouldn't cause re-watches

    return location;
};
