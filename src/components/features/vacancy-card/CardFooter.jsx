import React from 'react';
import { User, Check, ArrowRight } from 'lucide-react';
import TurnesButton from '../../ui/TurnesButton';


export const CardFooter = ({ 
    vacancy, 
    variant, 
    hideCompanyAction, 
    isApplied, 
    isApplying, 
    onOpenDetail, 
    onCompanyClick, 
    onApply 
}) => {
    
    if (variant === 'compact') {
        return (
            <div className="pt-4 flex items-center justify-between gap-3 mt-auto">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onOpenDetail?.(vacancy);
                    }}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all active:scale-95"
                    type="button"
                    aria-label="Acción">
                    Explorar vacante
                    <ArrowRight size={14} strokeWidth={3} />
                </button>
            </div>
        );
    }

    return (
        <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3 mt-auto">
            {!hideCompanyAction && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const id = vacancy.empresaId || vacancy.companyId || vacancy.empresa_id;
                        onCompanyClick?.(id || vacancy);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-[10px] md:text-[11px] font-bold text-zinc-400 bg-white/5 border border-white/5 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all active:scale-95"
                    type="button"
                    aria-label="Acción">
                    <User size={12} strokeWidth={2.5} className="text-emerald-500/70" />
                    Ver Perfil
                </button>
            )}
            <TurnesButton
                onClick={(e) => {
                    e.stopPropagation();
                    if (!isApplied) onApply?.(vacancy.id);
                }}
                variant={isApplied ? 'secondary' : 'primary'}
                size="sm"
                disabled={isApplying || isApplied}
                className={`flex-1 h-10 !text-[10px] md:!text-[11px] !font-black !rounded-xl !border-0 transition-all
                    ${isApplied 
                        ? '!bg-zinc-800 !text-zinc-500' 
                        : 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-emerald-500/40 active:scale-95'}
                `}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    e.stopPropagation();
                    if (!isApplied) onApply?.(vacancy.id);
                }}>
                {isApplying ? '...' : isApplied ? (
                    <span className="flex items-center justify-center gap-1">
                        <Check size={12} strokeWidth={3} aria-hidden="true" /> Postulado
                    </span>
                ) : 'Postularme'}
            </TurnesButton>
        </div>
    );
};

export default CardFooter;
