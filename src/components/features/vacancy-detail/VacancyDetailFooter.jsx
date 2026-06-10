import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import TurnesButton from '../../ui/TurnesButton';
import Spinner from '../../ui/Spinner';


export const VacancyDetailFooter = ({ vacancy, onApply, isApplying, isApplied }) => {
    return (
        <div className="sticky bottom-0 bg-[#0f0f11]/95 backdrop-blur-xl border-t border-white/5 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {isApplied ? (
                <div className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-zinc-800/60 border border-white/8">
                    <Check size={16} className="text-emerald-400" strokeWidth={2.5} />
                    <span className="text-[13px] font-bold text-zinc-300">Ya te postulaste a esta vacante</span>
                </div>
            ) : (
                <TurnesButton
                    onClick={() => onApply(vacancy.id)}
                    disabled={isApplying}
                    className="w-full !rounded-2xl !py-3.5 !text-sm !font-bold shadow-[0_8px_24px_rgba(16,185,129,0.25)]"
                    aria-label={`Postularse a ${vacancy.title} en ${vacancy.business}`}
                >
                    {isApplying ? (
                        <span className="flex items-center gap-2">
                            <Spinner size="sm" variant="white" />
                            Enviando postulación...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            Postularme ahora
                            <ChevronRight size={16} strokeWidth={2.5} />
                        </span>
                    )}
                </TurnesButton>
            )}
        </div>
    );
};

export default VacancyDetailFooter;
