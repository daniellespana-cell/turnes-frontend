import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Building2, ChevronRight, Sparkles } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

/**
 * SkillMatchRadar — Muestra las top 3 empresas afines
 * al postulante basándose en sus habilidades vs vacantes activas.
 */
const SkillMatchRadar = ({ companies, loading }) => {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="bg-zinc-900/40 rounded-3xl ring-1 ring-white/5 p-6 space-y-4 animate-pulse">
                <div className="h-4 w-40 bg-zinc-800 rounded-lg" />
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-zinc-800/50 rounded-2xl" />
                ))}
            </div>
        );
    }

    if (!companies || companies.length === 0) {
        return (
            <div className="bg-zinc-900/40 rounded-3xl ring-1 ring-white/5 p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto">
                    <Building2 size={24} className="text-purple-400" />
                </div>
                <p className="text-sm font-bold text-white">Aún no encontramos empresas afines</p>
                <p className="text-xs text-zinc-500 max-w-[220px] mx-auto">
                    Agrega tus habilidades y tu ubicación base en tu perfil para encontrar empresas cerca de ti.
                </p>
                <button
                    onClick={() => navigate('/perfil')}
                    className="text-[11px] text-purple-400 font-bold uppercase tracking-widest hover:text-purple-300 transition-colors"
                >
                    Completar Perfil →
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900/40 rounded-3xl ring-1 ring-white/5 p-5 space-y-4 overflow-hidden relative"
        >
            {/* Background glow */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/5 blur-[60px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-cyan-400" />
                    <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">
                        Empresas Afines
                    </h3>
                </div>
            </div>

            <div className="space-y-2.5 relative z-10">
                {companies.map((company, i) => (
                    <motion.div
                        key={company.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.12 }}
                        onClick={() => navigate('/dashboard/explorar')}
                        className="group flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-800/30 hover:bg-zinc-800/60 border border-transparent hover:border-cyan-500/10 transition-all duration-300 cursor-pointer"
                    >
                        {/* Logo */}
                        <div className="relative shrink-0">
                            <div className="w-11 h-11 rounded-xl overflow-hidden bg-zinc-800 ring-1 ring-white/5">
                                <img
                                    src={company.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=27272a&color=a1a1aa&size=44`}
                                    alt={company.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {company.verified && (
                                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border-2 border-[#0a0a0a]">
                                    <ShieldCheck size={8} />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                                {company.name}
                            </p>
                            <p className="text-[10px] text-zinc-500 font-medium">
                                {company.vacancyCount} vacante{company.vacancyCount !== 1 ? 's' : ''} disponible{company.vacancyCount !== 1 ? 's' : ''}
                                {company.distance && <span className="text-zinc-600"> · {company.distance}</span>}
                            </p>
                        </div>

                        {/* Affinity Badge */}
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                                <p className="text-sm font-black text-cyan-400 tabular-nums">{company.affinity}%</p>
                                <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Afinidad</p>
                            </div>
                            <ChevronRight size={14} className="text-zinc-700 group-hover:text-cyan-400 transition-colors" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default SkillMatchRadar;
