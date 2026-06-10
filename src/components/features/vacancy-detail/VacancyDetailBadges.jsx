import React from 'react';
import { Star, Briefcase, Zap, AlertCircle } from 'lucide-react';

import { getCategoryUIConfig } from '../../../domain/vacantes.taxonomy';

export const VacancyDetailBadges = ({ vacancy }) => {
    const score = vacancy.matchScore ?? 0;
    const ui = vacancy.category ? getCategoryUIConfig(vacancy.category) : null;
    const catHex = ui?.hex ?? '#71717a';
    const catLabel = ui?.label ?? 'Sin categoría';

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {score > 0 && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border
                    ${vacancy.isHighMatch
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-zinc-800/60 text-zinc-400 border-white/8'}`}>
                    <Star size={9} className={vacancy.isHighMatch ? 'fill-emerald-400' : 'fill-zinc-500'} />
                    {score}% Match
                </div>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border"
                style={{ background: `${catHex}12`, color: catHex, borderColor: `${catHex}30` }}>
                {catLabel.split(' ')[0]}
            </div>
            {vacancy.type && (
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border
                    ${vacancy.type === 'Fijo'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                    {vacancy.type === 'Fijo' ? <Briefcase size={9} /> : <Zap size={9} />}
                    {vacancy.type}
                </div>
            )}
            {vacancy.esUrgente && (!vacancy.urgenteExpiracion || new Date(vacancy.urgenteExpiracion) > new Date()) && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-orange-600 to-red-600 text-white border border-orange-400/30 shadow-[0_0_15px_rgba(234,88,12,0.3)] animate-pulse">
                    <span>Urgente 🔥</span>
                </div>
            )}
        </div>
    );
};

export default VacancyDetailBadges;
