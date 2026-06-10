import React from 'react';
import { X, MapPin, Check } from 'lucide-react';


/**
 * 🎨 PickerHeader (Atómico)
 */
export const PickerHeader = ({ onClose }) => (
    <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
        <div>
            <h3 className="text-[12px] md:text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <MapPin size={16} className="text-emerald-500" />
                Precisión Química
            </h3>
            <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase mt-0.5 md:mt-1 tracking-wider">
                Arrastra el pin al punto exacto
            </p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
        </button>
    </div>
);

/**
 * 🎨 PickerFooter (Atómico)
 */
export const PickerFooter = ({ onConfirm, isConfirmed }) => (
    <div className="p-4 md:p-6 bg-zinc-900/80 backdrop-blur-2xl border-t border-white/5 flex flex-col items-center">
        <button
            onClick={onConfirm}
            disabled={isConfirmed}
            style={{ borderRadius: '9999px' }}
            className={`
                min-w-[200px] md:min-w-[240px] px-8 py-2 md:py-2.5 rounded-full font-bold tracking-wide text-[11px] md:text-[12px]
                transition-all duration-300 flex items-center justify-center gap-2
                ${isConfirmed 
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 shadow-none pointer-events-none' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] active:scale-95'
                }
            `}
        >
            {isConfirmed ? (
                <>
                    <Check size={16} strokeWidth={3} className="animate-in zoom-in duration-300" />
                    Posición Guardada
                </>
            ) : (
                <>Confirmar Punto exacto</>
            )}
        </button>
    </div>
);
