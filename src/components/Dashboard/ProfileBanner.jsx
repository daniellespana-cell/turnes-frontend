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
                <div className="relative overflow-hidden glass-card p-5 lg:p-8 group shadow-2xl">

                    {/* Decorative Blob: More vivid and layered */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-700" />

                    {/* Close Button: Top Right without border */}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-4 right-4 lg:top-6 lg:right-6 p-2 text-zinc-500 hover:text-white transition-colors z-20"
                        title="Descartar"
                        type="button"
                        aria-label="Cerrar banner">
                        <X className="w-5 h-5 lg:w-6 lg:h-6" />
                    </button>

                    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8 pr-2 lg:pr-8">

                        {/* Left Content */}
                        <div className="flex flex-col flex-1 min-w-0 w-full">
                            {/* Header row */}
                            <div className="flex items-center gap-4 lg:gap-6">
                                <div className="flex-shrink-0 w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center shadow-xl">
                                    <Sparkles className="text-emerald-400 drop-shadow-[0_0_8px_#10B981] w-7 h-7 lg:w-8 lg:h-8" />
                                </div>

                                <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-4">
                                    <h3 className="text-xl lg:text-3xl font-black text-white tracking-tight leading-none lg:leading-normal">
                                        Perfil al <span className="text-emerald-400">{completeness}%</span>
                                    </h3>
                                    <div className="w-fit">
                                        <span className="px-2.5 py-0.5 lg:px-4 lg:py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] lg:text-[12px] font-black text-emerald-400 uppercase tracking-widest no-select">
                                            Recomendado
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Text & Progress */}
                            <div className="mt-4 lg:mt-3 lg:ml-[88px] space-y-4 lg:space-y-3">
                                <p className="text-sm lg:text-lg text-zinc-400 max-w-2xl leading-relaxed font-medium">
                                    Los perfiles completos reciben <span className="text-white font-bold">3x más visitas</span>. 
                                    Destaca en la <span className="text-emerald-500/80 italic font-black">Red de Confianza</span> hoy mismo.
                                </p>

                                {/* Progress Bar: High visibility */}
                                <div className="w-full max-w-full lg:max-w-[320px] h-2.5 lg:h-3 bg-zinc-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completeness}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_15px_#10B981]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Actions: Large hit targets */}
                        <div className="flex shrink-0 w-full lg:w-auto mt-4 lg:mt-0">
                            <button
                                onClick={() => {
                                    const targetPath = user?.role === 'empresa' ? '/dashboard/perfil' : '/perfil';
                                    navigate(targetPath);
                                }}
                                className="flex-1 lg:flex-none h-12 lg:h-14 px-6 lg:px-8 bg-white text-black font-black text-sm lg:text-base rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 lg:gap-3 group/btn shadow-xl active:scale-95 no-select"
                                type="button"
                                aria-label="Acción">
                                Completar Perfil
                                <ChevronRight className="w-5 h-5 text-black/60 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ProfileBanner;
