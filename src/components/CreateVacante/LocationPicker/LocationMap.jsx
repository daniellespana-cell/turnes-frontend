import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { MapMarkerFactory } from '../../../utils/mapMarkerFactory';

/**
 * 🛰️ MapController — Production-Ready
 *
 * FIXES:
 *  - useEffect (no useLayoutEffect) → seguro para SSR y evita warnings
 *  - Solo un timer de recalibración a 150ms (el de 800ms era ruido)
 *  - flyTo solo si center realmente cambia
 */
const MapController = ({ center }) => {
    const map = useMap();

    // Centrado suave al cambiar ciudad
    useEffect(() => {
        if (center) map.flyTo(center, 15, { duration: 0.8 });
    }, [center, map]);

    // Recalibración de tamaño al montar
    // 1 sola invalidación diferida es suficiente con el layout flex-center
    useEffect(() => {
        const timer = setTimeout(() => map.invalidateSize(), 150);
        return () => clearTimeout(timer);
    }, [map]);

    return null;
};

/**
 * 🗺️ LocationMap — Atomic & Stable
 * MapContainer con posición absoluta para renderizado correcto en Leaflet.
 */
export const LocationMap = ({ center, pos, setPos, onDragEnd }) => {
    return (
        <MapContainer
            center={center}
            zoom={15}
            scrollWheelZoom={true}
            zoomControl={false}
            attributionControl={false}
            style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />
            <MapController center={center} />
            <Marker
                position={[pos.lat, pos.lng]}
                draggable={true}
                icon={MapMarkerFactory.createHubIcon()}
                eventHandlers={{
                    dragend: (e) => {
                        const { lat, lng } = e.target.getLatLng();
                        setPos({ lat, lng });
                        if (onDragEnd) onDragEnd(lat, lng);
                    }
                }}
            />
        </MapContainer>
    );
};

export default LocationMap;
