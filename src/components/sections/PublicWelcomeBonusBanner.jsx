import React from 'react';
import { useNavigate } from 'react-router-dom';
import { m as motion } from 'framer-motion';
import { Star, CheckCircle2, Zap, ArrowRight, ShieldCheck, Sparkles, Clock, DollarSign } from 'lucide-react';
import { PATHS } from '../../config/routes.paths';

const PILLARS = [
    { icon: CheckCircle2, label: '0% Comisión de Conexión', color: 'text-emerald-400' },
    { icon: Clock, label: 'Personal en < 2 Horas', color: 'text-teal-400' },
    { icon: ShieldCheck, label: 'Identidad y Referencias Validadas', color: 'text-cyan-400' },
    { icon: Zap, label: 'Sin Tarjeta para Comenzar', color: 'text-yellow-400 fill-yellow-400/20' }
];

const PublicWelcomeBonusBanner = () => {
    const navigate = useNavigate();

    return (
        <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10" aria-label="Promoción Primer Turno Gratis">
            <div className="w-full rounded-[2.5rem] bg-gradient-to-br from-zinc-900/90 via-zinc-950/95 to-black border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.08)] overflow-hidden relative flex flex-col lg:flex-row items-center justify-between p-8 sm:p-12 lg:p-16 backdrop-blur-xl gap-10">
                
                {/* 🌟 Ambient Glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/15 blur-[140px] rounded-full pointer-events-none translate-x-1/4 -translate-y-1/4" />
                <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none -translate-x-1/3 translate-y-1/3" />

                {/* 1. Copywriting & CTA */}
                <div className="w-full lg:w-[55%] z-10 space-y-6 text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <Sparkles size={14} className="text-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-300">
                            Oferta de Bienvenida para Negocios
                        </span>
                    </div>
                    
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight">
                        Tu Primer Turno Temporal es{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
                            100% Libre de Comisión
                        </span>
                    </h2>
                    
                    <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                        Prueba la velocidad de Turnes sin riesgo. Publica tu turno hoy y recibe personal verificado en minutos. Paga únicamente el sueldo al trabajador:{' '}
                        <strong className="text-emerald-300 font-semibold">nosotros asumimos el 100% de la comisión de conexión de tu primer turno.</strong>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg">
                        {PILLARS.map(({ icon: Icon, label, color }) => (
                            <div key={label} className="flex items-center gap-2.5 bg-zinc-900/60 border border-white/5 rounded-2xl px-3.5 py-2.5 backdrop-blur-sm">
                                <Icon size={16} className={`shrink-0 ${color}`} />
                                <span className="text-xs font-semibold text-zinc-200">{label}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="pt-2">
                        <button 
                            onClick={() => navigate(PATHS.PUBLIC.REGISTER_COMPANY)}
                            className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_45px_rgba(16,185,129,0.55)] active:scale-95 flex items-center justify-center gap-3 w-full sm:w-auto cursor-pointer uppercase tracking-wider text-xs sm:text-sm"
                            type="button"
                        >
                            <span>Reclamar Mi Primer Turno Gratis</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="text-[11px] text-zinc-500 mt-2 pl-1">
                            * Válido para nuevas empresas registradas en turnos temporales.
                        </p>
                    </div>
                </div>

                {/* 2. Mockup Flotante Interactivo */}
                <div className="w-full lg:w-[40%] h-[320px] relative z-10 flex items-center justify-center pointer-events-none select-none">
                    {/* Tarjeta Fondo (Bono $0) */}
                    <motion.div 
                        animate={{ y: [-25, -15, -25] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute z-10 w-[270px] bg-zinc-900/90 rounded-3xl p-4 shadow-2xl border border-zinc-800 backdrop-blur-md -rotate-6 -translate-x-6 -translate-y-6"
                    >
                        <div className="flex items-center justify-between bg-zinc-950/80 rounded-2xl p-3 border border-white/5">
                            <div className="flex items-center gap-2">
                                <DollarSign size={16} className="text-emerald-400" />
                                <span className="text-[11px] font-bold text-white">Comisión Turnes</span>
                            </div>
                            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">$0 COP</span>
                        </div>
                    </motion.div>

                    {/* Tarjeta Principal (Candidata Verificada) */}
                    <motion.div 
                        animate={{ y: [15, 25, 15] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                        className="absolute z-20 w-[290px] sm:w-[310px] bg-zinc-900/95 rounded-3xl p-5 shadow-2xl border border-emerald-500/30 backdrop-blur-xl rotate-3"
                    >
                        <div className="flex items-center gap-3.5 mb-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-800 overflow-hidden border-2 border-emerald-500/40 relative shadow-md shrink-0">
                                <img 
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                                    alt="Camila Serrano - Talento Verificado" 
                                    className="w-full h-full object-cover" 
                                    crossOrigin="anonymous"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = 'https://ui-avatars.com/api/?name=Camila+Serrano&background=047857&color=fff&bold=true';
                                    }}
                                />
                                <div className="absolute bottom-0 right-0 bg-emerald-500 p-0.5 rounded-tl-md">
                                    <CheckCircle2 size={10} className="text-black" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <h4 className="text-white font-bold text-sm truncate">Camila Serrano</h4>
                                    <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                                </div>
                                <p className="text-[11px] text-zinc-400 font-medium truncate">Mesera / Bartender Pro</p>
                                <div className="flex items-center text-amber-400 text-xs font-bold mt-0.5">
                                    <Star size={12} className="fill-amber-400 mr-1" /> 4.9 <span className="text-zinc-500 font-normal ml-1 text-[10px]">(38 turnos)</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-950/70 rounded-xl p-2.5 border border-white/5 flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                                <Clock size={13} className="text-emerald-400" />
                                <span>Disponible Hoy</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">A 1.8 km</span>
                        </div>

                        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 w-full">
                            <Sparkles size={13} className="text-emerald-400" />
                            <span>Turno Confirmado con Bono</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default PublicWelcomeBonusBanner;
