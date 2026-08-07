import React, { useState } from 'react';
import { m as motion } from 'framer-motion';
import { ShieldCheck, Star, ChevronRight, MapPin, Briefcase } from 'lucide-react';
import { AssetResolver } from '../../utils/assetHelper';

/**
 * 🃏 RadarCard (Atomic Component)
 * 
 * Tarjeta interactiva e individual para los talentos descubiertos por el radar.
 * Refactorizada para acatar el principio SRP (Single Responsibility).
 */
const RadarCard = ({ candidate, idx, onView, showDistance = true, locationMode }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    // Normalización defensiva
    const displayRating = Number(candidate?.rating || 0).toFixed(1);
    const displayDistance = candidate?.display_distance || '—';
    const skills = (candidate?.skills || []).slice(0, 3);
    const isVerified = candidate?.verificado || candidate?.verified;
    const candidateCity = candidate?.ciudad_nombre || candidate?.ciudad || 'Colombia';
    const displayName = candidate?.nombre_display || 'Usuario Anónimo';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: idx * 0.08, type: "spring", stiffness: 260, damping: 24 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onView}
            className="group relative w-[290px] md:w-[340px] shrink-0 snap-center cursor-pointer select-none"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onView()}
        >
            {/* Card Body */}
            <div className={`
                relative rounded-3xl p-5 md:p-6 overflow-hidden transition-all duration-500
                bg-gradient-to-br from-zinc-900/80 to-zinc-950/90
                border border-white/[0.04] hover:border-emerald-500/20
                shadow-xl hover:shadow-emerald-500/[0.06] hover:shadow-2xl
            `}>
                {/* Ambient glow on hover */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full transition-all duration-700 pointer-events-none ${isHovered ? 'bg-emerald-500/[0.06] scale-150' : 'bg-transparent scale-100'}`} />

                {/* Top Section: Avatar + Info */}
                <div className="relative flex gap-4 mb-4">
                    {/* Avatar with verified badge */}
                    <div className="relative shrink-0">
                        <div className={`
                            w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden transition-all duration-500
                            border-2 ${isHovered ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-white/[0.06]'}
                        `}>
                            <img
                                src={AssetResolver.getAvatar(candidate?.avatar_url) || `https://ui-avatars.com/api/?name=${displayName}&background=1a1a2e&color=10b981&bold=true`}
                                alt={displayName}
                                className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-105' : 'scale-100'}`}
                            />
                        </div>
                        {isVerified && (
                            <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-black p-1 rounded-full border-2 border-zinc-950 shadow-lg">
                                <ShieldCheck size={10} strokeWidth={3} />
                            </div>
                        )}
                    </div>

                    {/* Name + Rating + Distance */}
                    <div className="flex-1 min-w-0 pt-0.5">
                        <h4 className="text-[15px] md:text-base font-bold text-white truncate leading-tight group-hover:text-emerald-300 transition-colors duration-300"
                            style={{ fontFamily: "'Google Sans', 'Inter', system-ui, sans-serif" }}>
                            {displayName}
                        </h4>

                        <div className="flex items-center gap-3 mt-1.5">
                            {/* Rating */}
                            <div className="flex items-center gap-1">
                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                <span className="text-[12px] font-bold text-amber-300/90">{displayRating}</span>
                            </div>

                            {/* Distance — Solo se muestra si la ubicación es precisa */}
                            {showDistance && locationMode !== 'national' && (
                                <>
                                    <div className="w-px h-3 bg-zinc-700/50" />
                                    <div className="flex items-center gap-1 text-zinc-500">
                                        <MapPin size={11} />
                                        <span className="text-[11px] font-semibold">{displayDistance} km</span>
                                    </div>
                                </>
                            )}

                            {/* Badge de ciudad para modo Nacional (Reemplaza a la distancia) */}
                            {locationMode === 'national' && (
                                <>
                                    <div className="w-px h-3 bg-zinc-700/50" />
                                    <div className="flex items-center gap-1 text-zinc-400">
                                        <MapPin size={11} />
                                        <span className="text-[11px] font-semibold tracking-wide" style={{ fontFamily: "'Google Sans', 'Inter', system-ui, sans-serif" }}>
                                            {candidateCity}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Skills Tags */}
                {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                        {skills.map((skill, i) => (
                            <span
                                key={i}
                                className={`
                                    text-[10px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-all duration-300
                                    ${i === 0
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                                        : 'bg-white/[0.03] text-zinc-400 border border-white/[0.05]'
                                    }
                                `}
                                style={{ fontFamily: "'Google Sans', 'Inter', system-ui, sans-serif" }}
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                {/* CTA Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onView(); }}
                    className={`
                        w-full h-11 flex items-center justify-center gap-2.5 rounded-xl
                        text-[12px] font-bold tracking-wide transition-all duration-500 active:scale-[0.97]
                        ${isHovered
                            ? 'bg-emerald-500 text-black shadow-[0_4px_20px_rgba(16,185,129,0.25)]'
                            : 'bg-white/[0.04] text-zinc-400 border border-white/[0.06] hover:bg-white/[0.06]'
                        }
                    `}
                    style={{ fontFamily: "'Google Sans', 'Inter', system-ui, sans-serif" }}
                    type="button"
                    aria-label="Acción"
                >
                    <Briefcase size={14} />
                    <span>Ver Perfil</span>
                    <ChevronRight size={14} className={`transition-transform duration-300 ${isHovered ? 'translate-x-0.5' : ''}`} />
                </button>
            </div>
        </motion.div>
    );
};

export default RadarCard;
