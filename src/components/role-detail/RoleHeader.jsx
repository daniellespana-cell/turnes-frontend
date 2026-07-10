import React from 'react';
import { m as motion } from 'framer-motion';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const RoleHeader = ({ rol }) => {
    return (
        <motion.header variants={fadeInUp} className="text-center mb-16 pt-8 pb-4">
            {/* Micro-Interaction Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 backdrop-blur-md mb-6 hover:bg-emerald-500/20 transition-colors cursor-default">
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-emerald-300 tracking-widest uppercase">
                    Rol Verificado
                </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tighter leading-tight">
                <span className="block text-zinc-400 text-lg md:text-xl font-medium tracking-widest uppercase mb-2 font-mono">Oportunidades para</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 filter drop-shadow-lg">
                    {rol.title}
                </span>
            </h1>

            <p className="text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed font-light">
                {rol.description}
            </p>
        </motion.header>
    );
};

export default RoleHeader;
