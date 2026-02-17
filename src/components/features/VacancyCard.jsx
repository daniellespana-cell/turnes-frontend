import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Star, Briefcase, Zap } from 'lucide-react';
import TurnesButton from '../ui/TurnesButton';

const VacancyCard = ({ vacancy, onApply, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-zinc-900/30 backdrop-blur-sm border border-white/5 rounded-xl p-4 h-full min-w-[280px] flex flex-col gap-3 animate-pulse">
                <div className="flex justify-between">
                    <div className="flex gap-2">
                        <div className="w-9 h-9 bg-zinc-800 rounded-lg"></div>
                        <div className="space-y-1">
                            <div className="h-2 w-20 bg-zinc-800 rounded"></div>
                            <div className="h-2 w-12 bg-zinc-800 rounded"></div>
                        </div>
                    </div>
                </div>
                <div className="space-y-2 my-2">
                    <div className="h-4 w-3/4 bg-zinc-800 rounded"></div>
                    <div className="h-3 w-1/2 bg-zinc-800 rounded"></div>
                </div>
                <div className="h-10 w-full bg-zinc-800 rounded mt-auto"></div>
            </div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, borderColor: 'rgba(52, 211, 153, 0.2)' }}
            className="group relative bg-zinc-900/30 backdrop-blur-sm border border-white/5 rounded-xl p-4 hover:bg-zinc-900/60 transition-all duration-300 flex flex-col justify-between h-full min-w-[280px] md:min-w-0 snap-center"
        >
            <div>
                {/* HEADER COMPACTO */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-zinc-800 p-0.5 border border-white/5 overflow-hidden shrink-0">
                            <img src={vacancy.image} alt="logo" className="w-full h-full object-cover rounded shadow-inner opacity-90" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-zinc-200 font-bold text-[11px] tracking-wide truncate max-w-[120px]">{vacancy.business}</h4>
                                <span className="flex items-center gap-0.5 text-[8px] font-bold text-orange-400 bg-orange-400/5 px-1 rounded border border-orange-400/10">
                                    <Star size={7} className="fill-orange-400" /> {vacancy.rating}
                                </span>
                            </div>
                            <span className="text-[9px] text-zinc-500 flex items-center gap-1 leading-none mt-1">
                                <MapPin size={9} /> {vacancy.distance}
                            </span>
                        </div>
                    </div>

                    {/* BADGE TIPO */}
                    <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border flex items-center gap-1 shrink-0
                    ${vacancy.type === 'Fijo'
                            ? 'bg-purple-500/5 text-purple-400 border-purple-500/10'
                            : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'}
                `}>
                        {vacancy.type === 'Fijo' ? <Briefcase size={8} /> : <Zap size={8} />}
                        {vacancy.type || 'Turno'}
                    </div>
                </div>

                {/* INFO CENTRAL */}
                <div className="mb-3">
                    <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors leading-snug mb-1 line-clamp-1">
                        {vacancy.title}
                    </h3>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-white tracking-tight">
                            ${(vacancy.price / 1000).toFixed(0)}k
                        </span>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wide">
                            / {vacancy.time}
                        </span>
                    </div>
                </div>

                {/* DESCRIPCIÓN */}
                <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2 mb-3 font-medium border-l border-white/5 pl-2">
                    {vacancy.description || "Ver detalles para más información."}
                </p>
            </div>

            {/* FOOTER */}
            <div className="pt-2.5 border-t border-white/5 flex items-center justify-between mt-auto">
                <div className="flex gap-1">
                    {vacancy.tags?.slice(0, 1).map(tag => (
                        <span key={tag} className="text-[8px] text-zinc-500 bg-zinc-800/50 px-1.5 py-0.5 rounded border border-white/5">
                            {tag}
                        </span>
                    ))}
                    <span className="text-[8px] text-zinc-600 flex items-center gap-1 py-0.5 pl-1">
                        <Clock size={8} /> {vacancy.date ? vacancy.date.split(',')[0] : 'Hoy'}
                    </span>
                </div>

                {/* BOTÓN POSTULAR */}
                <TurnesButton
                    onClick={() => onApply && onApply(vacancy.id)}
                    variant="primary"
                    size="sm"
                >
                    Postular
                </TurnesButton>
            </div>
        </motion.div>
    );
};

export default VacancyCard;
