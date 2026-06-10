import { useState } from 'react';
import { AssetResolver } from '../../utils/assetHelper';

/**
 * 🃏 TalentCard (Ultramoderno v4.0)
 * Unificado con la estética del Radar del Dashboard.
 * Mantiene la funcionalidad dual: Invitar y Ver Perfil.
 */
const TalentCard = ({ candidate, onOpenProfile, onDirectInvite }) => {
    const [isHovered, setIsHovered] = useState(false);
    if (!candidate) return null;

    // 🛡️ Datos de la Verdad Absoluta
    const displayRating = (candidate.rating !== undefined && candidate.rating !== null) 
        ? Number(candidate.rating).toFixed(1) 
        : "0.0";
        
    const displayDistance = candidate.display_distance || (candidate.distancia_mts ? (candidate.distancia_mts / 1000).toFixed(1) : "0.0");
    const skills = (candidate.skills || []).slice(0, 3);
    const isVerified = candidate.verificado || candidate.verified;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onOpenProfile}
            className="group relative cursor-pointer"
        >
            {/* Card Body */}
            <div className={`
                relative rounded-[2.5rem] p-6 overflow-hidden transition-all duration-500
                bg-gradient-to-br from-zinc-900/80 to-zinc-950/90
                border border-white/[0.04] hover:border-emerald-500/20
                shadow-xl hover:shadow-emerald-500/[0.06]
            `}>
                {/* Ambient glow on hover */}
                <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full transition-all duration-700 pointer-events-none ${isHovered ? 'bg-emerald-500/[0.08] scale-150' : 'bg-transparent scale-100'}`} />

                <div className="flex gap-4 items-center mb-5">
                    {/* AVATAR MINI */}
                    <div className="relative shrink-0">
                        <div className={`
                            w-14 h-14 rounded-2xl overflow-hidden transition-all duration-500
                            border-2 ${isHovered ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-white/[0.06]'}
                        `}>
                            <img
                                src={AssetResolver.getAvatar(candidate.avatar_url || candidate.avatar) || `https://ui-avatars.com/api/?name=${candidate.nombre_display}&background=1a1a2e&color=10b981&bold=true`}
                                alt={candidate.nombre_display}
                                className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
                            />
                        </div>
                        {isVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black p-1 rounded-full border-2 border-zinc-950 shadow-lg">
                                <ShieldCheck size={8} strokeWidth={3} />
                            </div>
                        )}
                    </div>

                    {/* INFO CENTRAL */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-black text-white truncate uppercase tracking-widest group-hover:text-emerald-400 transition-colors">
                            {candidate.nombre_display}
                        </h3>
                        
                        <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-emerald-400">
                                <Star size={11} className="fill-emerald-400" />
                                <span className="text-[11px] font-black">{displayRating}</span>
                            </div>
                            <div className="w-px h-2.5 bg-zinc-800" />
                            <div className="flex items-center gap-1 text-zinc-500">
                                <MapPin size={11} />
                                <span className="text-[10px] font-bold uppercase tracking-tighter">{displayDistance} km</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skills Tags (AI Inspired) */}
                {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {skills.map((skill, i) => (
                            <span 
                                key={i}
                                className={`
                                    text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg
                                    ${i === 0 
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                                        : 'bg-white/5 text-zinc-500 border border-white/5'}
                                `}
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                {/* FOOTER DUAL (Acciones Atómicas) */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDirectInvite?.(); }}
                        className="w-full sm:flex-1 h-12 bg-emerald-500 text-black rounded-full flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_5px_15px_rgba(16,185,129,0.2)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)] shrink-0"
                    >
                        <UserPlus size={14} strokeWidth={3} />
                        <span className="text-[11px] font-black uppercase tracking-widest">Invitar</span>
                    </button>
                    
                    <button
                        onClick={(e) => { e.stopPropagation(); onOpenProfile?.(); }}
                        className="w-full sm:flex-1 h-12 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5 rounded-full flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
                    >
                        <Eye size={14} />
                        <span className="text-[11px] font-black uppercase tracking-widest">Ver Perfil</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default TalentCard;
