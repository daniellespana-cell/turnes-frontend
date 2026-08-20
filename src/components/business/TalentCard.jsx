import React, { useState } from 'react';
import { Star, MapPin, UserPlus, Eye, ShieldCheck } from 'lucide-react';
import { m as motion } from 'framer-motion';
import { AssetResolver } from '../../utils/assetHelper';

/**
 * 🃏 TalentCard (Ultramoderno v4.2 - High-End Responsive)
 * Diseño amplio, responsivo para móviles y desktops. Cero amontonamiento.
 */
const TalentCard = ({ candidate, onOpenProfile, onDirectInvite }) => {
    const [isHovered, setIsHovered] = useState(false);
    if (!candidate) return null;

    // 🛡️ Datos Normalizados
    const displayRating = (candidate.rating !== undefined && candidate.rating !== null) 
        ? Number(candidate.rating).toFixed(1) 
        : "0.0";
        
    const displayDistance = candidate.display_distance 
        || (candidate.distancia_mts != null 
            ? (candidate.distancia_mts <= 100 ? 'Muy cerca' : (candidate.distancia_mts < 1000 ? '< 1 km' : `${(candidate.distancia_mts / 1000).toFixed(1)} km`))
            : (candidate.ciudad_nombre || candidate.ciudad || 'En tu zona'));
    const skills = (candidate.skills || []).slice(0, 3);
    const isVerified = candidate.verificado || candidate.verified;
    const displayName = candidate.nombre_display || candidate.nombre || 'Candidato';

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onOpenProfile}
            className="group relative cursor-pointer w-full min-w-0"
            role="button"
            tabIndex={0}
            aria-label={`Ver perfil de ${displayName}`}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenProfile?.()}
        >
            {/* Card Body */}
            <div className={`
                relative rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-6 overflow-hidden transition-all duration-500
                bg-gradient-to-br from-zinc-900/80 via-zinc-900/60 to-zinc-950/90
                border border-white/[0.06] hover:border-emerald-500/30
                shadow-lg hover:shadow-emerald-500/[0.08] flex flex-col justify-between h-full
            `}>
                {/* Ambient glow on hover */}
                <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full transition-all duration-700 pointer-events-none ${isHovered ? 'bg-emerald-500/[0.08] scale-150' : 'bg-transparent scale-100'}`} />

                <div>
                    <div className="flex gap-3.5 items-center mb-4 min-w-0">
                        {/* AVATAR */}
                        <div className="relative shrink-0">
                            <div className={`
                                w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden transition-all duration-500
                                border-2 ${isHovered ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-white/[0.06]'}
                            `}>
                                <img
                                    src={AssetResolver.getAvatar(candidate.avatar_url || candidate.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1a1a2e&color=10b981&bold=true`}
                                    alt={displayName}
                                    className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
                                />
                            </div>
                            {isVerified && (
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black p-0.5 sm:p-1 rounded-full border-2 border-zinc-950 shadow-lg" title="Verificado">
                                    <ShieldCheck size={9} strokeWidth={3} />
                                </div>
                            )}
                        </div>

                        {/* INFO CENTRAL */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-[15px] font-black text-white truncate uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
                                {displayName}
                            </h3>
                            
                            <div className="flex items-center gap-2 sm:gap-3 mt-1 min-w-0">
                                <div className="flex items-center gap-1 text-emerald-400 shrink-0">
                                    <Star size={11} className="fill-emerald-400" />
                                    <span className="text-[11px] font-black tabular-nums">{displayRating}</span>
                                </div>
                                <div className="w-px h-2.5 bg-zinc-800 shrink-0" />
                                <div className="flex items-center gap-1 text-zinc-400 min-w-0 truncate">
                                    <MapPin size={11} className="shrink-0" />
                                    <span className="text-[10px] font-bold uppercase tracking-tighter truncate">{displayDistance}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skills Tags */}
                    {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-5">
                            {skills.map((skill, i) => (
                                <span 
                                    key={i}
                                    className={`
                                        text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg truncate max-w-[140px]
                                        ${i === 0 
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                                            : 'bg-white/5 text-zinc-400 border border-white/5'}
                                    `}
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* FOOTER DUAL (Acciones Atómicas con excelente ergonomía móvil) */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 pt-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDirectInvite?.(); }}
                        className="w-full sm:flex-1 h-10 sm:h-11 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.35)] shrink-0 cursor-pointer"
                        type="button"
                        aria-label={`Invitar a ${displayName} a una vacante`}
                    >
                        <UserPlus size={13} strokeWidth={3} />
                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">Invitar</span>
                    </button>
                    
                    <button
                        onClick={(e) => { e.stopPropagation(); onOpenProfile?.(); }}
                        className="w-full sm:flex-1 h-10 sm:h-11 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5 rounded-full flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0 cursor-pointer"
                        type="button"
                        aria-label={`Ver perfil completo de ${displayName}`}
                    >
                        <Eye size={13} />
                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">Ver Perfil</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default TalentCard;
