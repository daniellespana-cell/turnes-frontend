import React from 'react';
import { useNavigate } from 'react-router-dom';
import { m as motion } from 'framer-motion';
import { Star, CheckCircle2, Zap, ArrowRight, ShieldCheck, Sparkles, Clock, DollarSign } from 'lucide-react';
import { PATHS } from '../../config/routes.paths';

const PublicWelcomeBonusBanner = () => {
    const navigate = useNavigate();

    return (
        <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10" aria-label="Promoción Primer Turno Gratis">
            <div className="w-full rounded-[2.5rem] bg-gradient-to-br from-zinc-900/90 via-zinc-950/95 to-black border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.08)] overflow-hidden relative flex flex-col lg:flex-row items-center justify-between p-8 sm:p-12 lg:p-16 min-h-[460px] backdrop-blur-xl">
                
                {/* 🌟 Background Ambient Glows */}
                <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-emerald-500/15 blur-[140px] rounded-full pointer-events-none translate-x-1/4 -translate-y-1/4"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

                {/* 1. Left Content (Copywriting de Alta Conversión) */}
                <div className="w-full lg:w-[55%] z-10 flex flex-col items-start text-left mb-12 lg:mb-0">
                    
                    {/* Badge de Oferta Exclusiva */}
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    >
                        <Sparkles size={14} className="text-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-300">
                            Oferta de Bienvenida para Negocios
                        </span>
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] mb-5 tracking-tight"
                    >
                        Tu Primer Turno Temporal es{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 drop-shadow-sm">
                            100% Libre de Comisión
                        </span>
                    </motion.h2>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-300 text-sm sm:text-base lg:text-lg mb-8 leading-relaxed max-w-xl font-normal"
                    >
                        Prueba la velocidad de Turnes sin ningún riesgo. Publica tu turno hoy y recibe personal verificado en minutos. Paga únicamente el sueldo al trabajador:{' '}
                        <strong className="text-emerald-300 font-semibold">nosotros asumimos el 100% de la comisión de conexión de tu primer turno.</strong>
                    </motion.p>

                    {/* Value Pillars Badges */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 w-full max-w-lg"
                    >
                        <div className="flex items-center gap-2.5 bg-zinc-900/60 border border-white/5 rounded-2xl px-3.5 py-2.5 backdrop-blur-sm">
                            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                            <span className="text-xs font-semibold text-zinc-200">0% Comisión de Conexión</span>
                        </div>
                        <div className="flex items-center gap-2.5 bg-zinc-900/60 border border-white/5 rounded-2xl px-3.5 py-2.5 backdrop-blur-sm">
                            <Clock size={16} className="text-teal-400 shrink-0" />
                            <span className="text-xs font-semibold text-zinc-200">Personal en &lt; 2 Horas</span>
                        </div>
                        <div className="flex items-center gap-2.5 bg-zinc-900/60 border border-white/5 rounded-2xl px-3.5 py-2.5 backdrop-blur-sm">
                            <ShieldCheck size={16} className="text-cyan-400 shrink-0" />
                            <span className="text-xs font-semibold text-zinc-200">Identidad y Referencias Validadas</span>
                        </div>
                        <div className="flex items-center gap-2.5 bg-zinc-900/60 border border-white/5 rounded-2xl px-3.5 py-2.5 backdrop-blur-sm">
                            <Zap size={16} className="text-yellow-400 shrink-0 fill-yellow-400/20" />
                            <span className="text-xs font-semibold text-zinc-200">Sin Tarjeta para Comenzar</span>
                        </div>
                    </motion.div>
                    
                    {/* CTA Button Magnético */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="w-full sm:w-auto"
                    >
                        <button 
                            onClick={() => navigate(PATHS.PUBLIC.REGISTER_COMPANY)}
                            className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-black rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_45px_rgba(16,185,129,0.55)] active:scale-95 flex items-center justify-center gap-3 w-full sm:w-auto cursor-pointer uppercase tracking-wider text-xs sm:text-sm"
                            type="button"
                            aria-label="Publicar Turno Gratis"
                        >
                            <span>Reclamar Mi Primer Turno Gratis</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="text-[11px] text-zinc-500 mt-2.5 text-center sm:text-left pl-1">
                            * Válido para nuevas empresas registradas en turnos temporales.
                        </p>
                    </motion.div>
                </div>

                {/* 2. Right Visual Mockup (Dark Glassmorphism Interactive Talent Card) */}
                <div className="w-full lg:w-[42%] h-[340px] sm:h-[380px] relative z-10 flex items-center justify-center pointer-events-none select-none">
                    
                    {/* Background Decorative Element */}
                    <div className="absolute inset-0 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 rotate-3 scale-95"></div>

                    {/* Secondary Card (Match Encontrado - Back) */}
                    <motion.div 
                        initial={{ rotate: -6, x: -30, y: -25, opacity: 0.8 }}
                        animate={{ y: [-30, -20, -30] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute z-10 w-[270px] sm:w-[300px] bg-zinc-900/90 rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-zinc-800/80 backdrop-blur-md"
                    >
                        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                Match Confirmado
                            </span>
                            <span className="text-[10px] font-bold text-zinc-400">Hace 4 min</span>
                        </div>
                        <div className="flex items-center justify-between bg-zinc-950/80 rounded-2xl p-3 border border-white/5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                    <DollarSign size={16} />
                                </div>
                                <div>
                                    <div className="text-[11px] font-bold text-white">Comisión Turnes</div>
                                    <div className="text-[10px] text-zinc-400">Bono de Bienvenida</div>
                                </div>
                            </div>
                            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                                $0 COP
                            </span>
                        </div>
                    </motion.div>

                    {/* Main Front Card (Candidato Operativo Verificado) */}
                    <motion.div 
                        initial={{ rotate: 3, y: 20 }}
                        animate={{ y: [15, 25, 15] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                        className="absolute z-20 w-[290px] sm:w-[320px] bg-zinc-900/95 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-emerald-500/30 backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-3.5 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-800 overflow-hidden border-2 border-emerald-500/40 relative shadow-md">
                                <img 
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                                    alt="Talento Verificado" 
                                    className="w-full h-full object-cover" 
                                    loading="lazy"
                                />
                                <div className="absolute bottom-0 right-0 bg-emerald-500 p-0.5 rounded-tl-md">
                                    <CheckCircle2 size={10} className="text-black" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <h4 className="text-white font-bold text-sm sm:text-base truncate">Camila Serrano</h4>
                                    <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                                </div>
                                <p className="text-[11px] text-zinc-400 font-medium truncate">Mesera / Bartender Pro</p>
                                <div className="flex items-center text-amber-400 text-xs font-bold mt-0.5">
                                    <Star size={12} className="fill-amber-400 mr-1" /> 4.9
                                    <span className="text-zinc-500 font-normal ml-1 text-[10px]">(38 turnos)</span>
                                </div>
                            </div>
                        </div>

                        {/* Availability Tag */}
                        <div className="bg-zinc-950/70 rounded-xl p-3 border border-white/5 flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Clock size={13} className="text-emerald-400" />
                                <span className="text-[11px] font-medium text-zinc-300">Disponible Hoy</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                A 1.8 km
                            </span>
                        </div>

                        {/* Visual Contract Button */}
                        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 w-full shadow-inner">
                            <Sparkles size={14} className="text-emerald-400" />
                            <span>Turno Confirmado con Bono</span>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default PublicWelcomeBonusBanner;
