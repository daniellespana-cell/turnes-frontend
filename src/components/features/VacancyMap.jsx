import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { MapMarkerFactory } from '../../utils/mapMarkerFactory';

/**
 * 🛰️ VACANCY MAP — Production-Ready
 *
 * FIXES:
 *  - useLayoutEffect → useEffect (SSR-safe, sin warnings)
 *  - zoomMap definido una sola vez (era duplicado)
 *  - onSelectVacancy con fallback no-op para evitar crash si no se pasa
 *  - Limpieza de líneas en blanco vacías
 */

// Zoom levels tuned per radius — outside component to avoid re-creation
const ZOOM_BY_RADIUS = { 2: 14.5, 3: 14, 5: 13.5, 7: 13, 10: 12.5, 15: 12, 20: 11.5 };

// A11: Debounced map updater — prevents flyTo spam on rapid radius slider changes
const MapUpdater = ({ center, radius = 3 }) => {
    const map = useMap();
    const targetZoom = ZOOM_BY_RADIUS[radius] ?? 13;
    const timerRef = useRef(null);

    useEffect(() => {
        if (!center) return;
        // Debounce: only fly after user stops moving for 600ms
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            map.flyTo(center, targetZoom, { duration: 1.2 });
        }, 600);
        return () => clearTimeout(timerRef.current);
    }, [center, targetZoom, map]);

    // Invalidate size once on mount (fixes blank map on mobile)
    useEffect(() => {
        const timer = setTimeout(() => map.invalidateSize(), 200);
        return () => clearTimeout(timer);
    }, [map]);

    return null;
};

const VacancyMap = ({
    vacancies = [],
    userLocation,
    centerPoint,
    explorationCenter,
    setExplorationCenter,
    radius = 7,
    onSelectVacancy,   // FIX: sin default → puede ser undefined → crash
    selectedId
}) => {
    const initialCenter = centerPoint || [7.0682, -73.1698];
    const initialZoom = ZOOM_BY_RADIUS[radius] || 13;

    // FIX: fallback no-op si onSelectVacancy no se pasa
    const handleVacancyClick = onSelectVacancy ?? (() => {});

    const handleDragEnd = (e) => {
        const position = e.target.getLatLng();
        if (setExplorationCenter) {
            setExplorationCenter({ lat: position.lat, lng: position.lng });
        }
    };

    return (
        <div className="map-fixed-container shadow-inner">
            <MapContainer
                center={initialCenter}
                zoom={initialZoom}
                className="w-full h-full"
                scrollWheelZoom={false}
                attributionControl={false}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; OSM &copy; CARTO'
                    subdomains="abcd"
                    maxZoom={20}
                />

                <MapUpdater center={centerPoint} radius={radius} />

                {/* Radio dinámico de exploración */}
                {explorationCenter && (
                    <Circle
                        center={[explorationCenter.lat, explorationCenter.lng]}
                        radius={radius * 1000}
                        pathOptions={{
                            color: '#10b981',
                            fillColor: '#10b981',
                            fillOpacity: 0.05,
                            weight: 1.5,
                            dashArray: '12, 12',
                            className: 'animate-pulse-slow'
                        }}
                    />
                )}

                {/* Hub móvil (La Esfera) */}
                {explorationCenter && (
                    <Marker
                        position={[explorationCenter.lat, explorationCenter.lng]}
                        icon={MapMarkerFactory.createHubIcon()}
                        draggable={true}
                        eventHandlers={{ dragend: handleDragEnd }}
                        zIndexOffset={2000}
                    >
                        <Popup className="glass-popup" closeButton={false}>
                            <div className="p-1 px-2 text-center">
                                <p className="text-[10px] font-black uppercase text-emerald-400 leading-none mb-1">Centro de Exploración</p>
                                <p className="text-[9px] text-zinc-400">Arrastra para mover la esfera</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Marcador del usuario */}
                {userLocation && (
                    <Marker
                        position={[userLocation.lat, userLocation.lng]}
                        icon={MapMarkerFactory.createUserIcon()}
                    >
                        <Popup className="glass-popup">
                            <span className="text-xs font-bold">Estás aquí</span>
                        </Popup>
                    </Marker>
                )}

                <MarkerClusterGroup 
                    chunkedLoading 
                    showCoverageOnHover={false} 
                    maxClusterRadius={45}
                >
                    {/* Marcadores de vacantes */}
                    {vacancies.map(v => {
                        const lat = parseFloat(v.lat);
                        const lng = parseFloat(v.lng);
                        // Skip vacancies without coordinates — they show in list view only
                        if (!v.hasCoords || isNaN(lat) || isNaN(lng)) return null;

                        return (
                            <Marker
                                key={v.id}
                                position={[lat, lng]}
                                icon={MapMarkerFactory.createVacancyIcon(v.category)}
                                opacity={selectedId && selectedId !== v.id ? 0.6 : 1}
                                eventHandlers={{ click: () => handleVacancyClick(v) }}
                            />
                        );
                    })}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
};

export default VacancyMap;
