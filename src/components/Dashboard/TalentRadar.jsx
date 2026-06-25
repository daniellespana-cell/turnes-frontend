import React from 'react';
import { Sparkles, ShieldCheck, Star, ChevronRight, MapPin, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import { talentService } from '../../services/talentService';
import { AssetResolver } from '../../utils/assetHelper';
import { GeoService } from '../../services/geoService';

/**
 * 🛰️ TalentRadar (Premium Interactive v4.0)
 * Dashboard Radar: Interactive cards with real data only.
 * No fake KPIs. Uses: name, photo, rating, skills, distance, verified badge.
 */
const TalentRadar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const geo = useGeolocation();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const lastFetchedCoord = useRef({ lat: null, lng: null });

    useEffect(() => {
        let isCancelled = false;
        const timer = setTimeout(async () => {
            if (geo.loading || !user) return;
            
            const lat = geo.lat || 7.0682;
            const lng = geo.lng || -73.1698;

            // 🛡️ ANTI-DDOS: Prevenir llamados si la coordenada no cambió significativamente (0.5km)
            if (lastFetchedCoord.current.lat) {
                const dist = GeoService.calculateDistance(lat, lng, lastFetchedCoord.current.lat, lastFetchedCoord.current.lng);
                if (dist < 0.5) return;
            }

            if (!isCancelled) setLoading(true);

            try {
                const data = await talentService.getRadarTalent(lat, lng, '');
                if (!isCancelled) {
                    lastFetchedCoord.current = { lat, lng };
                    setCandidates(data || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (!isCancelled) setLoading(false);
            }
        }, 800);

        return () => {
            isCancelled = true;
            clearTimeout(timer);
        };
    }, [user, geo.loading, geo.lat, geo.lng]);

    const hasCandidates = candidates && candidates.length > 0;

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <div className="relative flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 shadow-[0_0_10px_#10B981]"></span>
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <Sparkles size={16} className="text-emerald-400" />
                        Radar de Talento Local
                    </h3>
                </div>
                <button
                    onClick={() => navigate('/dashboard/buscar-talento')}
                    className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors font-black uppercase tracking-widest no-select"
                >
                    Ver Mapa completo
                </button>
            </div>

            <div className="overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide flex gap-5 snap-x snap-mandatory">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="min-w-[300px] h-[220px] rounded-3xl bg-zinc-900/60 animate-pulse" />
                        ))
                    ) : !hasCandidates ? (
                        <div className="w-full py-12 text-center glass-card border-dashed border-white/10">
                            <p className="text-xs text-zinc-500 font-black uppercase tracking-widest">Buscando talentos disponibles...</p>
                        </div>
                    ) : (
                        candidates.map((candidate, idx) => (
                            <RadarCard
                                key={candidate.id}
                                candidate={candidate}
                                idx={idx}
                                onView={() => navigate('/dashboard/buscar-talento', { state: { candidateId: candidate.id } })}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>

            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
};

// ── RADAR CARD (Atomic Component) ────────────────────────────
const RadarCard = ({ candidate, idx, onView }) => {
    const [isHovered, setIsHovered] = useState(false);
    const displayRating = Number(candidate.rating || 0).toFixed(1);
    const displayDistance = candidate.display_distance || '—';
    const skills = (candidate.skills || []).slice(0, 3);
    const isVerified = candidate.verificado || candidate.verified;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: idx * 0.08, type: "spring", stiffness: 260, damping: 24 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onView}
            className="group relative min-w-[290px] md:min-w-[340px] snap-center cursor-pointer select-none"
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
                                src={AssetResolver.getAvatar(candidate.avatar_url) || `https://ui-avatars.com/api/?name=${candidate.nombre_display}&background=1a1a2e&color=10b981&bold=true`}
                                alt={candidate.nombre_display}
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
                            {candidate.nombre_display}
                        </h4>

                        <div className="flex items-center gap-3 mt-1.5">
                            {/* Rating */}
                            <div className="flex items-center gap-1">
                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                <span className="text-[12px] font-bold text-amber-300/90">{displayRating}</span>
                            </div>

                            <div className="w-px h-3 bg-zinc-700/50" />

                            {/* Distance */}
                            <div className="flex items-center gap-1 text-zinc-500">
                                <MapPin size={11} />
                                <span className="text-[11px] font-semibold">{displayDistance} km</span>
                            </div>
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
                >
                    <Briefcase size={14} />
                    <span>Ver Perfil</span>
                    <ChevronRight size={14} className={`transition-transform duration-300 ${isHovered ? 'translate-x-0.5' : ''}`} />
                </button>
            </div>
        </motion.div>
    );
};

export default TalentRadar;
