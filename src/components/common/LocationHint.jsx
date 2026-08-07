import React from 'react';
import { m as motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * 📍 LocationHint (Componente Universal de Degradación Elegante)
 * 
 * Muestra un banner transparente al usuario explicando el origen de las
 * coordenadas que se están usando para mostrarle resultados (Perfil, IP, Nacional).
 * 
 * Single Responsibility: Renderizar alertas contextuales basadas en locationMode.
 * 
 * @param {Object} props
 * @param {string} props.locationMode - 'exact' | 'profile' | 'manual' | 'approximate' | 'national'
 * @param {string} [props.cityName] - Nombre de la ciudad detectada o forzada.
 * @param {Function} [props.onManualOverride] - (Opcional) Acción personalizada al hacer clic en "Cambiar ubicación".
 */
const LocationHint = ({ locationMode, cityName, onManualOverride }) => {
    const navigate = useNavigate();

    // Si la ubicación es exacta por GPS, no mostramos banner. El sistema es transparente.
    if (locationMode === 'exact') return null;

    const handleManualOverride = () => {
        if (onManualOverride) {
            onManualOverride();
        } else {
            // Comportamiento por defecto: redirigir a una vista con mapa o selector de filtros.
            navigate('/dashboard/buscar-talento');
        }
    };

    const messages = {
        profile: {
            icon: <MapPin size={14} className="text-emerald-400" />,
            text: 'Basado en la dirección de tu perfil.',
            action: null,
            onClick: null,
        },
        manual: {
            icon: <MapPin size={14} className="text-emerald-400" />,
            text: `Ubicación manual${cityName ? ` (${cityName})` : ''}.`,
            action: 'Cambiar ubicación',
            onClick: handleManualOverride,
        },
        approximate: {
            icon: <Navigation size={14} className="text-amber-400" />,
            text: `Basado en tu conexión de internet${cityName ? ` (${cityName})` : ''}. `,
            action: '¿No estás ahí? Cambiar ubicación',
            onClick: handleManualOverride,
        },
        national: {
            icon: <Navigation size={14} className="text-amber-400" />,
            text: 'Mostrando resultados destacados de toda Colombia. ',
            action: 'Filtra cerca de ti',
            onClick: handleManualOverride,
        },
    };

    const msg = messages[locationMode];
    if (!msg) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.04] text-[12px] text-zinc-400 mb-4"
        >
            {msg.icon}
            <span>
                {msg.text}
                {msg.action && (
                    <button
                        onClick={msg.onClick}
                        className="ml-1 text-emerald-400 hover:text-emerald-300 font-bold transition-colors underline underline-offset-2"
                        type="button"
                    >
                        {msg.action}
                    </button>
                )}
            </span>
        </motion.div>
    );
};

export default LocationHint;
