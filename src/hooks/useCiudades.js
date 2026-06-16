import { useMemo } from 'react';
import { CIUDADES_COORDS } from '../domain/geography.config';

/**
 * 🌎 useCiudades — Single Source of Truth (Local-First)
 *
 * Lee directamente del config local `geography.config.js` (293 ciudades).
 * No hace fetch a la BD: los datos de geografía son estáticos y ya vienen
 * embebidos en el bundle — latencia cero, sin riesgo de límites de API,
 * sin parpadeos de carga y funciona offline.
 *
 * La tabla `ciudades_coords` en Supabase existe únicamente para
 * features futuras (filtros dinámicos por admin, zonas de cobertura, etc.)
 * pero NO es la fuente de verdad para el autocomplete del frontend.
 */
export const useCiudades = () => {
    const ciudades = useMemo(() => Object.keys(CIUDADES_COORDS).sort((a, b) =>
        a.localeCompare(b, 'es', { sensitivity: 'base' })
    ), []);

    const ciudadesFull = useMemo(() => ciudades.map(nombre => {
        const data = CIUDADES_COORDS[nombre];
        return {
            nombre,
            nombre_lower: nombre.toLowerCase(),
            lat:          data?.lat  ?? null,
            lng:          data?.lng  ?? null,
            departamento: data?.departamento ?? null,
        };
    }), [ciudades]);

    return { ciudades, ciudadesFull, loading: false };
};
