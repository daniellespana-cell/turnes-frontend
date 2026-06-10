import React from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, Sparkles, ChevronRight } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VerificationBanner = ({ variant = 'business' }) => { // 'business' | 'worker'
    const navigate = useNavigate();
    const { user } = useAuth();

    // 🧹 CLEANUP: Hide for workers (logic removed)
    if (variant === 'worker') return null;

    // 🧠 SMART LOGIC: Auto-hide if already verified
    if (user?.verificado) return null;

    // Configuración por Rol (Precios Fijos - No Inventados)
    const config = variant === 'worker' ? {
        title: "Verificación Profesional",
        badge: "Talento",
        desc: "Destaca tu perfil y accede a vacantes VIP.",
        stat: "prioridad de contratación",
        price: "$15.000",
        route: `/plan-action/verify` 
    } : {
        title: "Verificación Elite",
        badge: "Premium",
        desc: "Atrae más postulantes con el sello de confianza.",
        stat: "más postulantes",
        price: "$25.000",
        route: `/plan-action/verify`
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full relative overflow-hidden rounded-2xl p-[1px] group cursor-pointer"
            onClick={() => navigate(config.route)}
        >
            {/* Borde Gradiente Animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-emerald-400 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient" />

            <div className="relative bg-[#09090b] rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden">

                {/* Fondo Decorativo */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Contenido Izquierda */}
                <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-emerald-500/20 border border-transparent flex items-center justify-center shrink-0">
                        <BadgeCheck size={28} className="text-emerald-400" fill="currentColor" fillOpacity={0.2} />
                    </div>

                    <div className="text-left">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            {config.title}
                            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-emerald-500 text-[9px] font-black uppercase tracking-wider text-white shadow-lg">
                                {config.badge}
                            </span>
                        </h3>
                        <p className="text-sm text-zinc-400 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <Sparkles size={12} className="text-purple-400" />
                            Obtén <span className="text-white font-bold">40% más {config.stat}</span> con el sello.
                        </p>
                    </div>
                </div>

                {/* Contenido Derecha (Precio + CTA) */}
                <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Inversión Única</p>
                        <p className="text-xl font-black text-white">{config.price}</p>
                    </div>

                    <button
                        className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 group/btn shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                    >
                        Validar Perfil
                        <ChevronRight size={16} className="text-black/60 group-hover/btn:translate-x-1 transition-transform" />
                    </button>

                    {/* Precio Móvil */}
                    <div className="text-right sm:hidden">
                        <p className="text-lg font-black text-white">
                            {config.price.replace('.000', 'k')}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default VerificationBanner;
