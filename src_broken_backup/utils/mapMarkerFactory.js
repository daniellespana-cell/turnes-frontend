import L from 'leaflet';
import { getCategoryUIConfig } from '../domain/vacantes.taxonomy';

/**
 * 🎨 MAP MARKER FACTORY
 * Generador centralizado de marcadores Leaflet.
 * FIXES:
 *  - Cache por categoría (evita instanciar L.divIcon en cada render)
 *  - iconAnchor corregido para marcadores circulares (centro, no base)
 *  - pulse-blue definido como keyframe inline (era referencia muerta)
 */

// Cache para no re-crear iconos que ya fueron generados
const _iconCache = new Map();

export const MapMarkerFactory = {

    /**
     * Marcador de vacante coloreado por categoría.
     * Usa cache para evitar re-instanciación en cada render.
     */
    createVacancyIcon: (category) => {
        if (_iconCache.has(category)) return _iconCache.get(category);

        try {
            const sector = getCategoryUIConfig(category);
            const color = sector.hex || '#71717a';
            const parts = sector.label?.split(' ') || [];
            const emoji = parts[parts.length - 1]?.length <= 2 ? parts[parts.length - 1] : '📍';

            const html = `
                <div style="
                    width: 34px; height: 34px;
                    background-color: ${color};
                    border: 2px solid white;
                    border-radius: 50%;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.4);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 18px;
                ">
                    ${emoji}
                </div>
            `;

            const icon = L.divIcon({
                className: 'custom-marker-vacancy',
                html,
                iconSize: [34, 34],
                iconAnchor: [17, 17],  // FIX: centro del circulo, no base de un pin
                popupAnchor: [0, -20]
            });

            _iconCache.set(category, icon);
            return icon;
        } catch (e) {
            console.error('[MapMarkerFactory] createVacancyIcon error:', e);
            return L.divIcon({ html: '📍', className: 'fallback-marker' });
        }
    },

    /**
     * Marcador de posición del usuario (punto azul pulsante).
     * FIX: animación pulse-blue definida inline (antes era referencia muerta).
     */
    createUserIcon: () => {
        const html = `
            <style>
                @keyframes pulse-blue {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.6); }
                    50% { box-shadow: 0 0 0 8px rgba(59,130,246,0); }
                }
            </style>
            <div style="
                width: 16px; height: 16px;
                background-color: #3b82f6;
                border: 2px solid white;
                border-radius: 50%;
                animation: pulse-blue 2s ease-in-out infinite;
            "></div>
        `;

        return L.divIcon({
            className: 'custom-marker-user',
            html,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
    },

    /**
     * Marcador hub móvil (La Esfera de exploración).
     */
    createHubIcon: () => {
        const html = `
            <div style="
                width: 20px; height: 20px;
                background: rgba(16,185,129,0.2);
                border: 1.5px solid #10b981;
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 0 15px rgba(16,185,129,0.3);
                cursor: grab;
            ">
                <div style="width: 6px; height: 6px; background: #10b981; border-radius: 50%;"></div>
            </div>
        `;

        return L.divIcon({
            className: 'custom-marker-hub',
            html,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
    }
};
