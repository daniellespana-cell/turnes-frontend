import React from 'react';

import { useMemo } from 'react';

const AntigravityBackground = ({ role }) => {

    // 🔥 DYNAMIC COLOR PALETTE BASED ON ROLE
    const colors = useMemo(() => {
        if (!role) return {
            primary: 'bg-indigo-500',
            secondary: 'bg-emerald-500',
            accent: 'bg-purple-500'
        };
        if (role === 'company') return {
            primary: 'bg-blue-600',
            secondary: 'bg-cyan-400',
            accent: 'bg-indigo-400'
        };
        if (role === 'jobseeker') return {
            primary: 'bg-red-600',
            secondary: 'bg-rose-500',
            accent: 'bg-orange-400'
        };
        return { primary: 'bg-gray-500', secondary: 'bg-zinc-500', accent: 'bg-slate-500' };
    }, [role]);

    // 🚀 PERFORMANCE OMEGAPTIMIZATION: Static Backgrounds only.
    // No JS loops, no particles, just pure CSS heavy-lifting.

    // Noise Texture Data URI (Inlined to avoid network RTT)
    const NOISE_URI = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E";

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#09090b] transition-colors duration-1000">

            {/* 1. MAIN ATMOSPHERIC GLOW (Static) */}
            <div className={`absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120vw] h-[70vh] ${colors.primary} rounded-[100%] blur-3xl md:blur-[120px] opacity-15 mix-blend-screen transition-colors duration-1000`}></div>

            {/* 2. SECONDARY AMBIENT LIGHT (Static) */}
            <div className={`absolute bottom-[-10%] right-[-10%] w-[80vw] h-[50vh] ${colors.secondary} rounded-full blur-3xl md:blur-[100px] opacity-10 transition-colors duration-1000`}></div>

            {/* 3. NOISE (Local Data URI - Zero Latency - Tiled) */}
            <div
                className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                style={{
                    backgroundImage: `url("${NOISE_URI}")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '100px 100px'
                }}
            ></div>
        </div>
    );
};

export default AntigravityBackground;
