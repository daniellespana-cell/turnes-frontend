import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { GeoService } from '../services/geoService';
import { useToast } from '../context/ToastContext';

/**
 * 🛰️ useLocationPicker — Production-Ready Headless Logic
 * Estado y lógica de geolocalización. Sin dependencias de UI.
 *
 * FIXES:
 *  - GPS con timeout y enableHighAccuracy (evita freeze en iOS)
 *  - validateBoundary fail-safe ahora es false (coordenadas null = inválido)
 *  - handleConfirm limpia sus timers en caso de unmount prematuro
 *  - setIsMapReady usa un delay de 250ms para respetar la animación de entrada
 */
export const useLocationPicker = ({ isOpen, initialPos, cityLabel, onConfirm, onClose }) => {
    const { showToast } = useToast();

    // Ref para limpiar el setTimeout de handleConfirm si el modal cierra antes
    const confirmTimerRef = useRef(null);
    const mapReadyTimerRef = useRef(null);

    // --- ESTADO MAESTRO ---
    const validInitial = useMemo(() => {
        if (initialPos?.lat != null && initialPos?.lng != null) {
            return [initialPos.lat, initialPos.lng];
        }
        return [7.0682, -73.1698]; // Girón fallback
    }, [initialPos]);

    const [tempPos, setTempPos] = useState({ lat: validInitial[0], lng: validInitial[1] });
    const [resolvedAddress, setResolvedAddress] = useState(cityLabel || '');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isResolving, setIsResolving] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);

    // --- SINCRONIZACIÓN (con delay para respetar animación de entrada) ---
    useEffect(() => {
        if (isOpen) {
            setTempPos({ lat: validInitial[0], lng: validInitial[1] });
            setResolvedAddress(cityLabel || '');
            setIsConfirmed(false);

            // Delay 250ms: permite que la animación de entrada complete
            // antes de que Leaflet calcule las dimensiones del contenedor
            mapReadyTimerRef.current = setTimeout(() => {
                setIsMapReady(true);
            }, 250);
        } else {
            setIsMapReady(false);
        }

        return () => {
            if (mapReadyTimerRef.current) clearTimeout(mapReadyTimerRef.current);
        };
    }, [isOpen, validInitial, cityLabel]);

    // Limpiar todos los timers al desmontar
    useEffect(() => {
        return () => {
            if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
            if (mapReadyTimerRef.current) clearTimeout(mapReadyTimerRef.current);
        };
    }, []);

    // --- GEOCODING INVERSO ---
    const resolveLocationData = useCallback(async (lat, lng) => {
        setIsResolving(true);
        try {
            const address = await GeoService.reverseGeocode(lat, lng);
            if (address) setResolvedAddress(address);
        } catch (error) {
            // AbortError es esperado cuando el usuario arrastra rápido — no es un fallo real
            if (error?.name !== 'AbortError') {
                console.error('[useLocationPicker] geocode error:', error.message);
            }
        } finally {
            setIsResolving(false);
        }
    }, []);

    // --- GPS — FIX: timeout + enableHighAccuracy para evitar freeze en iOS ---
    const handleUseMyLocation = useCallback(() => {
        if (!navigator.geolocation) {
            showToast('Tu navegador no soporta geolocalización.', 'error');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setTempPos({ lat: latitude, lng: longitude });
                resolveLocationData(latitude, longitude);
                setIsLocating(false);
            },
            (err) => {
                console.error('[useLocationPicker] GPS error:', err.message);
                const msg = err.code === 1
                    ? 'Permiso denegado. Habilita la ubicación en tu navegador.'
                    : 'No pudimos obtener tu ubicación. Intenta de nuevo.';
                showToast(msg, 'error');
                setIsLocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,      // Máximo 10s antes de llamar al error callback
                maximumAge: 30000    // Aceptar posición cacheada de hasta 30s
            }
        );
    }, [resolveLocationData, showToast]);

    // --- CONFIRMACIÓN CON VALIDACIÓN DE BOUNDARY ---
    const handleConfirm = useCallback(() => {
        // FIX: validateBoundary ahora retorna false si coords son null
        const isWithinBoundary = GeoService.validateBoundary(
            tempPos.lat, tempPos.lng,
            validInitial[0], validInitial[1]
        );

        if (!isWithinBoundary) {
            showToast(`El punto está demasiado lejos de ${cityLabel || 'la ciudad seleccionada'}.`, 'error');
            return;
        }

        setIsConfirmed(true);

        // Guardar la referencia del timer para poder cancelarlo si se desmonta
        confirmTimerRef.current = setTimeout(() => {
            onConfirm(tempPos.lat, tempPos.lng, resolvedAddress);
            onClose();
            setIsConfirmed(false);
        }, 600);
    }, [tempPos, validInitial, cityLabel, resolvedAddress, onConfirm, onClose, showToast]);

    return {
        tempPos, setTempPos,
        resolvedAddress,
        isConfirmed,
        isResolving, isLocating, isMapReady,
        validInitial,
        handleUseMyLocation,
        handleConfirm,
        resolveLocationData
    };
};
