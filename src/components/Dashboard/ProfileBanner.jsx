import React from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronRight } from 'lucide-react';

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProfileBanner = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(true);

    // 1. Calculate Profile Completeness (Smart Logic)
    const completeness = useMemo(() => {
        if (!user) return 0;

        let score = 0;
        let total = 5; // Base fields

        // Check essential fields
        if (user.nombre_display && user.nombre_display !== 'Usuario Nuevo') score++;
        if (user.avatar_url) score++;
        if (user.telefono) score++;
        if (user.role) score++;

        // Business vs Worker specific checks
        if (user.role === 'empresa') {
            total = 8;
            if (user.nit || user.nit_rut) score++;
            if (user.direccion) score++;
            if (user.bio) score++;
            if (user.skills && user.skills.length > 0) score++;
        } else {
            total = 7;
            if (user.skills && user.skills.length > 0) score++;
            if (user.bio) score++;
            if (user.direccion) score++;
        }

        return Math.round((score / total) * 100);
    }, [user]);

    // 2. Auto-Hide if 100% Complete or Dismissed
    if (!user || completeness >= 100 || !isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{
                    opacity: 0,
                    scale: 0.95
                }}
                animate={{
                    opacity: 1,
                    scale: 1
                }}
                exit={{
                    opacity: 0,
                    scale: 0.9
                }}
                transition={{ duration: 0.4, type: "spring" }}
                className="w-full mb-8"
            >
                {/* Glassmorphism Container: Senior Hierarchy */}
                <div className="relative overflow-hidden glass-card p-8 group shadow-2xl">

                    {/* Decorative Blob: More vivid and layered */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-700" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

                        {/* Left Content */}
                        <div className="flex items-start gap-6">
                            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center shadow-xl">
                                <Sparkles className="text-emerald-400 drop-shadow-[0_0_8px_#10B981]" size={32} />
                            </div>

                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-4">
                                    <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                        Perfil al <span className="text-emerald-400">{completeness}%</span>
                                    </h3>
                                    <span className="px-4 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[12px] font-black text-emerald-400 uppercase tracking-widest no-select">
                                        Recomendado
                                    </span>
                                </div>

                                <p className="text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed font-medium">
                                    Los perfiles completos reciben <span className="text-white font-bold">3x más visitas</span>. 
                                    Destaca en la <span className="text-emerald-500/80 italic font-black">Red de Confianza</span> hoy mismo.
                                </p>

                                {/* Progress Bar: High visibility */}
                                <div className="w-full max-w-[320px] h-3 bg-zinc-900 rounded-full mt-4 overflow-hidden border border-white/5 p-0.5">
                                    <motion.div
                                        initial={{}}
                                        animate={{}}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_15px_#10B981]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Actions: Large hit targets */}
                        <div className="flex items-center gap-4 w-full lg:w-auto">
                            <button
                                onClick={() => {
                                    const targetPath = user?.role === 'empresa' ? '/dashboard/perfil' : '/perfil';
                                    navigate(targetPath);
                                }}
                                className="flex-1 lg:flex-none h-14 px-8 bg-white text-black font-black text-base rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 group/btn shadow-xl active:scale-95 no-select"
                                type="button"
                                aria-label="Acción">
                                Completar Perfil
                                <ChevronRight size={20} className="text-black/60 group-hover/btn:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => setIsVisible(false)}
                                className="h-14 w-14 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-500 hover:text-white transition-all active:scale-95"
                                title="Descartar"
                                type="button"
                                aria-label="Acción">
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ProfileBanner;
