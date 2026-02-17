import { BaseService } from './base/BaseService';

/**
 * 🗺️ GEO SERVICE
 * Maneja toda la lógica espacial y de ubicación.
 * Principio KISS: Cálculos locales precisos y preparación para PostGIS.
 */
export const GeoService = {

    // Radio de la Tierra en Kilómetros
    EARTH_RADIUS_KM: 6371,

    /**
     * Calcula la distancia entre dos puntos (Fórmula Haversine)
     * @param {number} lat1 
     * @param {number} lon1 
     * @param {number} lat2 
     * @param {number} lon2 
     * @returns {number} Distancia en Kilómetros (1 decimal)
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 999;

        const dLat = this._toRad(lat2 - lat1);
        const dLon = this._toRad(lon2 - lon1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this._toRad(lat1)) * Math.cos(this._toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return parseFloat((this.EARTH_RADIUS_KM * c).toFixed(1));
    },

    /**
     * Obtiene vacantes cercanas (Filtrado en Cliente por ahora)
     * @param {Array} vacancies - Lista completa de vacantes
     * @param {Object} userLocation - { lat, lng }
     * @param {number} radiusKm - Radio en KM
     */
    filterNearby(vacancies, userLocation, radiusKm = 10) {
        if (!userLocation?.lat || !userLocation?.lng) return vacancies;

        return vacancies.map(v => {
            const dist = this.calculateDistance(userLocation.lat, userLocation.lng, v.lat, v.lng);
            return {
                ...v,
                realDistance: dist,
                distanceLabel: `${dist} km`
            };
        }).filter(v => v.realDistance <= radiusKm)
            .sort((a, b) => a.realDistance - b.realDistance);
    },

    /**
     * Helper interno para conversión a radianes
     */
    _toRad(value) {
        return value * Math.PI / 180;
    }
};
