import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { IconMap } from '../../data/IconMap';
import L from 'leaflet';

// --- CONFIGURACIÓN DE ICONOS ---
const createCustomIcon = (category) => {
    // Colores HEX explícitos para asegurar renderizado fuera de Tailwind
    const colors = {
        'GASTRO': '#f97316', // Orange
        'CONSTRUCCION': '#eab308', // Yellow
        'LOGISTICA': '#3b82f6', // Blue
        'BELLEZA': '#ec4899', // Pink
        'CUIDADO': '#10b981', // Emerald
        'HOGAR': '#a855f7', // Purple
        'EVENTOS': '#ef4444', // Red
        'AGRO': '#16a34a', // Green
        'default': '#71717a' // Zinc
    };

    const color = colors[category] || colors['default'];

    // Usamos estilos INLINE para garantizar que Leaflet los renderice
    const html = `
        <div style="
            width: 28px; 
            height: 28px; 
            background-color: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        ">
            <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
        </div>
    `;

    return L.divIcon({
        className: '', // Sin clases para no interferir
        html: html,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
    });
};

const MapUpdater = ({ center }) => {
    const map = useMap();
    useMemo(() => {
        if (center) map.flyTo(center, 13);
    }, [center, map]);
    return null;
};

const VacancyMap = ({ vacancies, onSelectVacancy, userLocation }) => {
    // Centro por defecto: ubicación del usuario o Bogotá
    const centerPoint = userLocation ? [userLocation.lat, userLocation.lng] : [4.6097, -74.0817];

    return (
        <div className="w-full h-[350px] md:h-[450px] rounded-[1.5rem] overflow-hidden border border-white/10 shadow-2xl relative z-0">
            <MapContainer
                center={centerPoint}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                {/* MAPA OSCURO (CartoDB Dark Matter) */}
                <TileLayer
                    attribution='&copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <MapUpdater center={centerPoint} />

                {/* --- RADIO DE 5KM --- */}
                {userLocation && (
                    <Circle
                        center={[userLocation.lat, userLocation.lng]}
                        radius={5000} // 5000 metros = 5km
                        pathOptions={{
                            color: '#10b981', // Emerald 500
                            fillColor: '#10b981',
                            fillOpacity: 0.15,
                            weight: 1.5,
                            dashArray: '6, 8'
                        }}
                    />
                )}

                {/* MARKER DEL USUARIO */}
                {userLocation && (
                    <Marker
                        position={[userLocation.lat, userLocation.lng]}
                        icon={L.divIcon({
                            className: '',
                            html: `<div style="width: 14px; height: 14px; background-color: #3b82f6; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(59,130,246,0.8);"></div>`,
                            iconSize: [14, 14]
                        })}
                    >
                        <Popup className="glass-popup"><span className="text-xs font-bold font-manrope">Estás aquí</span></Popup>
                    </Marker>
                )}

                {/* VACANTES */}
                {vacancies.map(v => {
                    if (!v.lat || !v.lng) return null;
                    return (
                        <Marker
                            key={v.id}
                            position={[v.lat, v.lng]}
                            icon={createCustomIcon(v.category)}
                            eventHandlers={{
                                click: () => onSelectVacancy(v), // Pass full object for preview
                            }}
                        >
                            {/* Popup removed for Bottom Sheet UX */}
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default VacancyMap;
