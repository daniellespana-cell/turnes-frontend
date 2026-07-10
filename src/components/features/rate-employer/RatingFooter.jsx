import React from 'react';
import { Send } from 'lucide-react';
import Spinner from '../../ui/Spinner';


export const RatingFooter = ({ rating, isSubmitting, onSubmit, onOmit }) => (
    <div className="space-y-6">
        {/* Anonymous Security Badge */}
        <div className="flex justify-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-emerald-500/80 font-black uppercase tracking-widest">
                    Doble Ciego Activado
                </span>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
            <button
                onClick={onOmit}
                disabled={isSubmitting}
                className="flex-1 h-14 rounded-2xl text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors border border-transparent hover:bg-white/5"
                type="button"
                aria-label="Acción">
                Omitir
            </button>
            <button
                onClick={onSubmit}
                disabled={isSubmitting || rating === 0}
                className={`flex-[2] h-14 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all
                    ${rating > 0 
                        ? 'bg-white text-black hover:bg-zinc-200 active:scale-95 shadow-xl shadow-white/5' 
                        : 'bg-zinc-900 text-zinc-700 cursor-not-allowed'}
                `}
                type="button"
                aria-label="Acción">
                {isSubmitting ? (
                    <Spinner size="sm" variant="emerald" />
                ) : (
                    <>
                        Enviar <Send size={14} />
                    </>
                )}
            </button>
        </div>
    </div>
);

export default RatingFooter;
