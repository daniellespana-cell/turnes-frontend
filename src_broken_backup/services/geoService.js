import { supabase } from './supabaseClient';
import { BaseService } from './base/BaseService';

/**
 * 🗺️ GEO SERVICE — Production Ready
 * Maneja toda la lógica espacial y de ubicación.
 */
export const GeoService = {

    EARTH_RADIUS_KM: 6371,

    // AbortController para cancelar geocoding previo en drags rápidos
    _geocodeController: null,
    _geocodeTimer: null,

    /**
     * Distancia Haversine entre dos puntos.
     * FIXED: lat == null en vez de !lat para soportar coordenada 0 (ecuador).
     * @returns {number} km (1 decimal), 999 si datos inválidos
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 999;

        const dLat = this._toRad(lat2 - lat1);
        const dLon = this._toRad(lon2 - lon1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this._toRad(lat1)) * Math.cos(this._toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return parseFloat((this.EARTH_RADIUS_KM * c).toFixed(1));
    },

    /**
     * Vacantes cercanas via PostGIS (Server-Side).
     */
    async fetchNearby(lat, lng, radiusKm = 15, timeout = 12000) {
        if (lat == null || lng == null) return { data: [], error: 'Coordenadas requeridas' };

        const query = supabase.rpc('buscar_vacantes_cercanas', {
            user_lat: lat,
            user_lng: lng,
            radio_km: radiusKm
        });

        return BaseService.handle(query, timeout);
    },

    /**
     * Filtrado de vacantes en cliente.
     * @deprecated Usar fetchNearby con PostGIS.
     */
    filterNearby(vacancies, userLocation, radiusKm = 10) {
        if (!vacancies) return [];
        const hasUserLoc = userLocation?.lat != null && userLocation?.lng != null;

        return vacancies.map(v => {
            if (!hasUserLoc || v.lat == null || v.lng == null) {
                return { ...v, realDistance: 999, distanceLabel: 'Distancia a convenir' };
            }
            const dist = this.calculateDistance(userLocation.lat, userLocation.lng, v.lat, v.lng);
            return { ...v, realDistance: dist, distanceLabel: `${dist} km` };
        }).filter(v => v.realDistance <= radiusKm || v.realDistance === 999)
            .sort((a, b) => a.realDistance - b.realDistance);
    },

    /**
     * Reverse geocoding con Nominatim.
     * FIXED: User-Agent requerido por ToS + AbortController para cancelar requests obsoletas.
     * Usa debounce interno de 500ms para respetar el rate limit de 1 req/seg.
     * @param {number} lat
     * @param {number} lng
     * @returns {Promise<string|null>}
     */
    reverseGeocode(lat, lng) {
        if (lat == null || lng == null) return Promise.resolve(null);

        // Cancelar request anterior si el usuario sigue arrastrando el pin
        if (this._geocodeController) this._geocodeController.abort();
        if (this._geocodeTimer) clearTimeout(this._geocodeTimer);

        return new Promise((resolve) => {
            this._geocodeTimer = setTimeout(async () => {
                this._geocodeController = new AbortController();
                const { signal } = this._geocodeController;

                try {
                    const resp = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                        {
                            signal,
                            headers: {
                                // Requerido por ToS de Nominatim
                                'User-Agent': 'Turnes/2.0 (contact@turnes.app)',
                                'Accept-Language': 'es-CO,es;q=0.9'
                            }
                        }
                    );

                    const data = await resp.json();

                    if (data?.address) {
                        const road = data.address.road || data.address.pedestrian;
                        const city = data.address.city || data.address.town || data.address.village;
                        const suburb = data.address.suburb || data.address.neighbourhood;

                        if (road) {
                            const num = data.address.house_number ? ` #${data.address.house_number}` : '';
                            resolve(`${road}${num}, ${city || ''}`.trim());
                        } else {
                            resolve(`${suburb || city || ''}, ${data.address.state || ''}`.trim());
                        }
                    } else {
                        resolve(data.display_name || 'Ubicación Confirmada');
                    }
                } catch (err) {
                    if (err.name === 'AbortError') return; // Request cancelada intencionalmente
                    console.error('[GeoService] reverseGeocode error:', err.message);
                    resolve('Ubicación confirmada por mapa');
                }
            }, 500); // Debounce: respeta el rate limit de Nominatim (1 req/s)
        });
    },

    /**
     * Valida si un punto está dentro de un radio aceptable de su ciudad.
     * FIXED: fail-safe retorna false (inválido) si los datos son nulos para no guardar vacantes sin coords.
     */
    validateBoundary(lat, lng, refCityLat, refCityLng, maxRadiusKm = 40) {
        if (lat == null || lng == null || refCityLat == null || refCityLng == null) return false;
        const dist = this.calculateDistance(lat, lng, refCityLat, refCityLng);
        return dist <= maxRadiusKm;
    },

    _toRad(value) {
        return value * Math.PI / 180;
    }
};
