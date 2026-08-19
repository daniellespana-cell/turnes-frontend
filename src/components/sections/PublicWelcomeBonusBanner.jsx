import React from 'react';
import { useNavigate } from 'react-router-dom';
import { m as motion } from 'framer-motion';
import { Star, CheckCircle2, Zap, ArrowRight } from 'lucide-react';
import { PATHS } from '../../config/routes.paths';

const PublicWelcomeBonusBanner = () => {
    const navigate = useNavigate();

    return (
        <div className="col-span-full mt-10 w-full rounded-[2rem] bg-[#0a0a0a] border border-zinc-800/50 overflow-hidden relative flex flex-col md:flex-row items-center justify-between p-8 md:p-14 min-h-[400px]">
            
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -translate-x-1/2 translate-y-1/2"></div>

            {/* Left Content */}
            <div className="w-full md:w-[50%] z-10 flex flex-col items-start text-left mb-12 md:mb-0">
                <span className="text-emerald-400 font-bold text-sm md:text-base mb-4 tracking-wide">
                    ¿Primera vez en Turnes?
                </span>
                
                <h2 className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
                    Tu primer turno temporal es <br className="hidden lg:block"/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Totalmente Gratis</span>
                </h2>
                
                <p className="text-zinc-400 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
                    Registra tu empresa y completa tu perfil. Te regalamos la comisión de conexión de tu primer candidato en turnos temporales para que pruebes la velocidad de nuestra red sin ningún riesgo.
                </p>
                
                <button 
                    onClick={() => navigate(PATHS.PUBLIC.REGISTER_COMPANY)}
                    className="group relative px-6 sm:px-8 py-3.5 sm:py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95 flex items-center gap-3 w-full sm:w-auto justify-center mt-2"
                >
                    Publicar Turno Gratis
                    <Zap size={20} className="text-yellow-500 fill-yellow-500" />
                </button>
            </div>

            {/* Right Visual Composition (CSS Mockup) */}
            <div className="w-full md:w-[45%] h-[300px] md:h-[400px] relative z-10 flex items-center justify-center pointer-events-none">
                
                {/* Floating Star 1 - Pulsante y Giratoria */}
                <motion.div 
                    animate={{ 
                        y: [-15, 15, -15], 
                        rotate: [0, 15, -10, 0],
                        scale: [1, 1.25, 0.95, 1]
                    }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-4 left-0 md:-left-8 text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.8)] z-30"
                >
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                </motion.div>

                {/* Floating Star 2 - Pulso Acelerado */}
                <motion.div 
                    animate={{ 
                        y: [10, -20, 10], 
                        rotate: [15, -15, 15],
                        scale: [0.8, 1.1, 0.8]
                    }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute bottom-8 right-0 md:-right-10 text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.7)] z-0"
                >
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                </motion.div>

                {/* Floating Star 3 - Mini destello lejano */}
                <motion.div 
                    animate={{ 
                        scale: [0.5, 1, 0.5],
                        opacity: [0.3, 1, 0.3],
                        rotate: [0, 180]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                    className="absolute top-1/2 right-4 text-yellow-200 drop-shadow-[0_0_10px_rgba(253,230,138,0.9)] z-30"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                </motion.div>

                {/* Main Card (Candidate Profile) */}
                <motion.div 
                    initial={{ rotate: -5, y: 20 }}
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute z-20 w-[260px] bg-white rounded-3xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-zinc-200"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-zinc-200 overflow-hidden border-2 border-white shadow-sm">
                            <img src="https://i.pravatar.cc/150?img=47" alt="Candidato" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h4 className="text-black font-bold text-lg leading-none mb-1">Sofía Castro</h4>
                            <div className="flex items-center text-yellow-500 text-sm font-bold">
                                <Star size={14} className="fill-yellow-500 mr-1" /> 5.0 
                                <span className="text-zinc-400 font-normal ml-1 text-xs">(24 reseñas)</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="h-2 w-full bg-zinc-100 rounded-full"></div>
                        <div className="h-2 w-3/4 bg-zinc-100 rounded-full"></div>
                    </div>
                    <div className="bg-emerald-500 text-white font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 w-full">
                        Contactar ahora <ArrowRight size={16} />
                    </div>
                </motion.div>

                {/* Secondary Card (Behind) */}
                <motion.div 
                    initial={{ rotate: 10, x: 60, y: -40, opacity: 0.9 }}
                    animate={{ y: [-45, -35, -45] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute z-10 w-[240px] bg-zinc-900 rounded-3xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-zinc-800"
                >
                    <h4 className="text-white font-bold mb-3 text-center">Match Encontrado</h4>
                    <div className="bg-zinc-800 rounded-xl p-3 flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={20} className="text-emerald-400" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white">Disponibilidad</div>
                            <div className="text-xs text-emerald-400">Inmediata</div>
                        </div>
                    </div>
                    <div className="bg-zinc-800 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                            <Zap size={20} className="text-indigo-400" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white">Distancia</div>
                            <div className="text-xs text-indigo-400">A 2.5 km de ti</div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default PublicWelcomeBonusBanner;
