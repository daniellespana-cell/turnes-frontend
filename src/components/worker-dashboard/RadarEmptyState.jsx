import React from 'react';
import { Radar, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

/**
 * RadarEmptyState — Componente Atómico de Estado Vacío
 *
 * Responsabilidad Única:
 * - Representar visualmente el radar activo cuando no hay vacantes recomendadas en la zona.
 * - Permitir la activación rápida de notificaciones Push (si el navegador lo soporta).
 * - Cero captura de datos de usuario (desacoplado de formularios de onboarding).
 */
const RadarEmptyState = () => {
    const { isSupported, permission, isSubscribed, subscribe, loading: pushLoading } = usePushNotifications();

    const hasPush = isSubscribed || permission === 'granted';

    return (
        <div className="w-full bg-zinc-900/40 rounded-3xl border border-emerald-500/10 p-6 md:p-8 relative overflow-hidden group shadow-lg backdrop-blur-sm animate-fade-in">
            {/* Background animated radar icon */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                <Radar size={140} className="text-emerald-400" />
            </div>

            <div className="relative z-10 space-y-4 max-w-lg">
                
                {/* Status Indicator */}
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-[11px]">
                        Radar de Talento Activo
                    </h3>
                </div>

                {/* Main Message */}
                <div className="space-y-1.5">
                    <h4 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                        Escaneando turnos cerca de ti...
                    </h4>
                    <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-medium">
                        No hay vacantes activas en este instante en tu zona, pero las empresas publican turnos continuamente. Te notificaremos al instante cuando se abra una oportunidad para tu perfil.
                    </p>
                </div>

                {/* Push Call to Action */}
                {isSupported && !hasPush && permission !== 'denied' && (
                    <div className="pt-2">
                        <button
                            onClick={subscribe}
                            disabled={pushLoading}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3.5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(16,185,129,0.25)] disabled:opacity-50 cursor-pointer"
                            type="button"
                            aria-label="Activar notificaciones de turnos"
                        >
                            <Bell size={16} />
                            {pushLoading ? 'Activando...' : 'Activar Alertas Inmediatas'}
                        </button>
                    </div>
                )}

                {/* Subscribed Badge */}
                {hasPush && (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-2xl w-fit text-xs font-bold">
                        <CheckCircle2 size={16} />
                        <span>Alertas instantáneas activadas para tu zona</span>
                    </div>
                )}

                {/* Blocked Permission Warning */}
                {permission === 'denied' && (
                    <div className="flex items-start gap-2.5 bg-red-500/5 border border-red-500/20 rounded-2xl p-3.5">
                        <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-300/80 leading-relaxed">
                            Las notificaciones están bloqueadas en tu navegador. Puedes habilitarlas en los ajustes de tu navegador para que el radar te alerte al instante.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RadarEmptyState;
