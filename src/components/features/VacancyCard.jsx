import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import CardHeader from './vacancy-card/CardHeader';
import CardFooter from './vacancy-card/CardFooter';


// Sub-components (Atomic Architecture)

/**
 * VacancyCard
 * Responsabilidad: Orquestar el layout de la tarjeta y manejar estados visuales.
 */
const VacancyCard = ({ 
    vacancy, 
    onApply, 
    onOpenDetail, 
    onCompanyClick, 
    isApplying, 
    isApplied, 
    hideCompanyAction = false,
    variant = 'default' 
}) => {
    const score       = vacancy.matchScore ?? 0;
    const isHighMatch = vacancy.isHighMatch ?? false;
    const isFallback  = vacancy.isFallback  ?? false;

    const handleCardActivate = () => onOpenDetail?.(vacancy);
    const handleCardKey = (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardActivate(); }
    };

    return (
        <motion.article
            layout
            role="article"
            tabIndex={0}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            onClick={handleCardActivate}
            onKeyDown={handleCardKey}
            className={`group relative bg-zinc-900/30 backdrop-blur-xl rounded-3xl p-5 md:p-6 pb-5 md:pb-6 hover:bg-zinc-900/60 transition-all duration-500 flex flex-col justify-between h-full min-w-[340px] md:min-w-0 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 border
                ${vacancy.esUrgente && (!vacancy.urgenteExpiracion || new Date(vacancy.urgenteExpiracion) > new Date())
                    ? 'border-orange-500/30 shadow-[0_0_20px_rgba(234,88,12,0.1)]'
                    : 'border-zinc-800/60'
                }`}
        >
            {/* 1. STATUS BADGES */}
            <div className="absolute -top-2.5 right-4 flex gap-2 z-10">
                {/* 🔥 URGENT BADGE — Intelligent & Time-Aware */}
                {vacancy.esUrgente && (!vacancy.urgenteExpiracion || new Date(vacancy.urgenteExpiracion) > new Date()) && (
                    <div className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-gradient-to-r from-orange-600 to-red-600 text-white border border-orange-400/30 shadow-[0_0_15px_rgba(234,88,12,0.4)] animate-pulse">
                        <div className="flex items-center gap-1">
                            <span>Urgente</span>
                            <span className="text-[10px]">🔥</span>
                        </div>
                    </div>
                )}

                {score > 0 && (
                    <div className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border shadow-lg transition-transform group-hover:scale-110 ${isHighMatch ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-zinc-800 text-zinc-300 border-white/10'}`}>
                        <div className="flex items-center gap-1">
                            <Star size={8} className={isHighMatch ? 'fill-white' : 'fill-zinc-500'} />
                            {score}% Match
                        </div>
                    </div>
                )}
                
                {isFallback && score === 0 && (
                    <div className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border bg-zinc-800/80 text-zinc-500 border-white/5">
                        Recomendada
                    </div>
                )}
            </div>

            {/* 2. BODY CONTENT */}
            <div>
                <CardHeader vacancy={vacancy} />

                <div className="mb-4">
                    {/* Título */}
                    <h4 className="text-sm md:text-[15px] font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors leading-snug mb-3 line-clamp-1">
                        {vacancy.title}
                    </h4>

                    {/* Precio + descripción en fila */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-baseline gap-1 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 shrink-0">
                            <span className="text-base md:text-xl font-black text-white tracking-tighter tabular-nums">
                                {vacancy.priceLabel}
                            </span>
                            {vacancy.price > 0 && (
                                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">/ turno</span>
                            )}
                        </div>
                    </div>

                    {/* Descripción */}
                    <p className="text-[11px] md:text-xs text-zinc-400 leading-relaxed line-clamp-2 border-l-2 border-emerald-500/20 pl-3">
                        {vacancy.description || 'Toca para ver más información.'}
                    </p>
                </div>
            </div>

            {/* 3. ACTIONS FOOTER */}
            <CardFooter 
                vacancy={vacancy}
                variant={variant}
                hideCompanyAction={hideCompanyAction}
                isApplied={isApplied}
                isApplying={isApplying}
                onOpenDetail={onOpenDetail}
                onCompanyClick={onCompanyClick}
                onApply={onApply}
            />
        </motion.article>
    );
};

export default VacancyCard;
