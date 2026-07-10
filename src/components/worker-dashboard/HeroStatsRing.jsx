import React from 'react';
import { m as motion } from 'framer-motion';

import { useEffect, useState } from 'react';
import { AssetResolver } from '../../utils/assetHelper';
import Skeleton from '../ui/Skeleton';

/**
 * HeroStatsRing — Anillo SVG animado tipo Apple Watch Activity Ring.
 * 3 anillos concéntricos: Turnos, Ganancias, Perfil.
 * Al centro: avatar del postulante con pulso si tiene actividad.
 */
const RING_CONFIG = [
    { label: 'Turnos', color: '#10b981', trackColor: '#10b98115', key: 'shifts' },
    { label: 'Ganancias', color: '#06b6d4', trackColor: '#06b6d415', key: 'earnings' },
    { label: 'Perfil', color: '#a855f7', trackColor: '#a855f715', key: 'profile' },
];

const AnimatedRing = ({ radius, strokeWidth, progress, color, trackColor, delay }) => {
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const [offset, setOffset] = useState(circumference);

    useEffect(() => {
        const timer = setTimeout(() => {
            const clampedProgress = Math.min(100, Math.max(0, progress));
            setOffset(circumference - (clampedProgress / 100) * circumference);
        }, delay);
        return () => clearTimeout(timer);
    }, [progress, circumference, delay]);

    return (
        <>
            {/* Track */}
            <circle
                cx="90" cy="90" r={normalizedRadius}
                fill="none" stroke={trackColor} strokeWidth={strokeWidth}
                strokeLinecap="round"
            />
            {/* Progress */}
            <circle
                cx="90" cy="90" r={normalizedRadius}
                fill="none" stroke={color} strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 90 90)"
                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
        </>
    );
};

const HeroStatsRing = ({ stats, avatarUrl, userName, loading }) => {
    if (loading || !stats) return <Skeleton className="w-full h-[228px]" />;

    const shiftsGoal = Math.max(1, stats.totalShifts >= 10 ? Math.ceil(stats.totalShifts * 1.2) : 10);
    const shiftsPercent = Math.min(100, Math.round((stats.totalShifts / shiftsGoal) * 100));
    const earningsPercent = stats.monthlyGoal > 0 
        ? Math.min(100, Math.round((stats.totalEarned / stats.monthlyGoal) * 100)) 
        : 0;
    const profilePercent = stats.profileCompletion || 0;

    const rings = [
        { ...RING_CONFIG[0], progress: shiftsPercent, radius: 82, strokeWidth: 8 },
        { ...RING_CONFIG[1], progress: earningsPercent, radius: 68, strokeWidth: 8 },
        { ...RING_CONFIG[2], progress: profilePercent, radius: 54, strokeWidth: 8 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative bg-zinc-900/40 rounded-3xl ring-1 ring-white/5 p-6 overflow-hidden"
        >
            {/* Background glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-500/5 blur-[60px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                {/* SVG Ring */}
                <div className="relative w-[180px] h-[180px] shrink-0">
                    <svg width="180" height="180" viewBox="0 0 180 180">
                        {rings.map((ring, i) => (
                            <AnimatedRing
                                key={ring.key}
                                radius={ring.radius}
                                strokeWidth={ring.strokeWidth}
                                progress={ring.progress}
                                color={ring.color}
                                trackColor={ring.trackColor}
                                delay={200 + i * 300}
                            />
                        ))}
                    </svg>
                    {/* Avatar Center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-zinc-800 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                            <img
                                src={AssetResolver.getAvatar(avatarUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'T')}&background=21c99a&color=fff&bold=true&size=64`}
                                alt="Tu avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-3 w-full">
                    {rings.map((ring, i) => (
                        <motion.div
                            key={ring.key}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.15 }}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ring.color }} />
                                <span className="text-xs text-zinc-400 font-medium">{ring.label}</span>
                            </div>
                            <span className="text-sm font-black text-white tabular-nums">{ring.progress}%</span>
                        </motion.div>
                    ))}

                    {/* Total Earned Highlight */}
                    <div className="pt-3 border-t border-white/5">
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Ganancias Estimadas</p>
                        <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tabular-nums">
                            ${stats.totalEarned?.toLocaleString('es-CO') || '0'}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default HeroStatsRing;
