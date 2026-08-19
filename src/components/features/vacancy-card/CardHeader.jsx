import React from 'react';
import { MapPin, ShieldCheck, Briefcase, Zap, Clock } from 'lucide-react';
import { AssetResolver } from '../../../utils/assetHelper';

/**
 * CardHeader
 * Layout: CSS Grid de 3 columnas → [logo] [info] [badge-tipo]
 * Meta row: CSS Grid de 4 columnas → [dist] [•] [fecha] [horario]
 */
export const CardHeader = ({ vacancy }) => {
    const typeBadgeClass = vacancy.type === 'Fijo'
        ? 'bg-purple-500/5 text-purple-400 border-purple-500/10'
        : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10';

    return (
        <div
            className="grid items-start gap-x-3 mb-4 w-full"
            style={{ gridTemplateColumns: 'auto 1fr auto' }}
        >
            {/* ── LOGO ── */}
            <div className="relative self-center">
                <div className="w-11 h-11 rounded-xl bg-zinc-800 p-0.5 border border-white/5 overflow-hidden">
                    <img
                        src={AssetResolver.getLogo(vacancy.businessLogo, vacancy.business)}
                        alt={`Logo de ${vacancy.business}`}
                        className="w-full h-full object-cover rounded-lg opacity-90"
                    />
                </div>
                {vacancy.isVerified && (
                    <div
                        aria-label="Empresa verificada"
                        className="absolute -bottom-1 -right-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white p-1 rounded-full border-2 border-zinc-900 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-20"
                    >
                        <ShieldCheck size={10} strokeWidth={3} aria-hidden="true" />
                    </div>
                )}
            </div>

            {/* ── INFO (nombre + meta row) ── */}
            <div className="min-w-0 flex-1">
                <h3 className="text-white font-bold text-xs md:text-[13px] tracking-tight truncate mb-1">
                    {vacancy.business}
                </h3>

                {/* META ROW: flex-wrap fluido con truncate responsivo para evitar desbordes */}
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 w-full min-w-0">
                    {/* Distancia */}
                    {vacancy.distance && (
                        <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-medium shrink-0">
                            <MapPin size={9} className="text-zinc-600 shrink-0" aria-hidden="true" />
                            <span>{vacancy.distance}</span>
                        </div>
                    )}

                    {/* Separador */}
                    {vacancy.distance && <span className="text-zinc-700 text-[9px] shrink-0">•</span>}

                    {/* Fecha */}
                    <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-black uppercase tracking-tight shrink-0">
                        <Clock size={10} className="shrink-0 text-emerald-400" aria-hidden="true" />
                        <span>{vacancy.date || 'A convenir'}</span>
                    </div>

                    {/* Horario (A definir / Turno) con truncate inteligente */}
                    {vacancy.scheduleLabel && (
                        <div className="flex items-center gap-1 min-w-0 max-w-full">
                            <span className="text-zinc-700 text-[9px] shrink-0">•</span>
                            <span
                                className="text-emerald-400/90 text-[10px] font-black uppercase tracking-tight truncate max-w-[110px] xs:max-w-[140px] sm:max-w-[180px] md:max-w-none"
                                title={vacancy.scheduleLabel}
                            >
                                {vacancy.scheduleLabel}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── BADGE TIPO ── */}
            {vacancy.type && (
                <div
                    aria-label={`Tipo: ${vacancy.type}`}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border self-start shrink-0 ${typeBadgeClass}`}
                >
                    {vacancy.type === 'Fijo'
                        ? <Briefcase size={8} aria-hidden="true" />
                        : <Zap size={8} aria-hidden="true" />
                    }
                    {vacancy.type}
                </div>
            )}
        </div>
    );
};

export default CardHeader;
