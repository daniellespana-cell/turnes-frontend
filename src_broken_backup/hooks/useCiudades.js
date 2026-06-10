import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { CIUDADES_COORDS } from '../domain/geography.config';
import { logger } from '../utils/logger';

/**
 * 🌎 useCiudades — Single Source of Truth
 *
 * Carga las ciudades desde la tabla `ciudades_coords` en Supabase.
 * El array `geography.config.js` actúa como FALLBACK offline/inicial
 * mientras el fetch no completa — garantiza que el autocomplete
 * funcione instantáneamente sin parpadeos de carga.
 *
 * Si la tabla no existe todavía en la BD, usa el fallback local.
 */
export const useCiudades = () => {
    // Fallback instantáneo: keys del config local (sin fetch)
    const [ciudades, setCiudades] = useState(Object.keys(CIUDADES_COORDS));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchCiudades = async () => {
            try {
                const { data, error } = await supabase
                    .from('ciudades_coords')
                    .select('nombre, lat, lng, departamento')
                    .eq('activa', true)
                    .order('nombre', { ascending: true });

                if (error) throw error;

                if (mounted) {
                    // Solo actualizamos si hay datos válidos (evita borrar la lista si la tabla está vacía)
                    if (data && data.length > 0) {
                        // 🧠 Senior Fallback: Previene la pérdida de ciudades si la BD no corrió todo el Seed (< 100)
                        const dbNames = data.map(c => c.nombre);
                        if (data.length < 100) {
                            const localNames = Object.keys(CIUDADES_COORDS);
                            const merged = [...new Set([...localNames, ...dbNames])].sort((a,b) => a.localeCompare(b));
                            setCiudades(merged);
                            console.warn('[useCiudades] DB incompleta detectada (' + data.length + '). Fusionado con fallback local.');
                        } else {
                            setCiudades(dbNames); // Source of truth puro
                        }
                    } else {
                        logger.info('[useCiudades] La tabla remota está vacía. Manteniendo fallback local.');
                    }
                }
            } catch (err) {
                // El fallback local ya se activó en el initState del useState
                console.warn('[useCiudades] Usando fallback local. DB error:', err.message);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchCiudades();
        return () => { mounted = false; };
    }, []);

    // 🧠 Senior Mapping: Preparar objetos enriquecidos para el selector
    const ciudadesFull = ciudades.map(nombre => {
        // Buscar primero en el config local para máxima precisión
        const local = CIUDADES_COORDS[nombre];
        return {
            nombre,
            nombre_lower: nombre.toLowerCase(),
            lat: local?.lat || null,
            lng: local?.lng || null
        };
    });

    return { ciudades, ciudadesFull, loading };
};
