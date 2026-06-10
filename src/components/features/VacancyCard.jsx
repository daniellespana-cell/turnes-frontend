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
            className={`group relative bg-zinc-900/30 backdrop-blur-xl rounded-3xl p-4 md:p-5 pb-5 md:pb-6 hover:bg-zinc-900/60 transition-all duration-500 flex flex-col justify-between h-full min-w-[280px] md:min-w-0 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 border
                ${vacancy.esUrgente && (!vacancy.urgenteExpiracion || new Date(vacancy.urgenteExpiracion) > new Date())
                    ? 'border-orange-500/30 shadow-[0_0_20px_rgba(234,88,12,0.1)]'
                    : 'border-transparent'
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

                <div className="mb-3 md:mb-4">
                    <h4 className="text-[13px] md:text-sm font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors leading-tight mb-2 line-clamp-1">
                        {vacancy.title}
                    </h4>
                    <div className="flex items-baseline gap-1 bg-white/5 w-fit px-2.5 py-1 rounded-xl border border-transparent">
                        <span className="text-sm md:text-lg font-black text-white tracking-tighter tabular-nums">
                            {vacancy.priceLabel}
                        </span>
                        {vacancy.price > 0 && <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">/ turno</span>}
                    </div>
                </div>

                <p className="text-[10px] md:text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-3 md:mb-4 border-l-2 border-white/5 pl-2.5">
                    {vacancy.description || 'Toca para ver más información.'}
                </p>
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
