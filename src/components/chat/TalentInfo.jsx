import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const TalentInfo = ({ candidate, config, isPaid, isRehire, isSealed }) => {
    return (
        <div className="flex-1 space-y-4">
            <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-700 px-1">
                Ecosistema de Contratación
            </h4>

            <div className={`bg-zinc-950 border rounded-2xl p-5 space-y-6 relative overflow-hidden transition-all ${isSealed ? 'border-blue-500/10' : 'border-white/5'
                }`}>

                {/* Header: Avatar & Name */}
                <div className="flex items-center gap-3 relative z-10">
                    <div className="relative">
                        <img
                            src={candidate?.avatar || 'https://via.placeholder.com/150'}
                            className="w-10 h-10 rounded-full object-cover border border-white/10"
                            alt="Talento"
                        />
                        {isPaid && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black flex items-center justify-center">
                                <CheckCircle2 size={8} className="text-white" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-[12px] font-bold text-white truncate">
                            {candidate?.name || 'Cargando...'}
                        </h4>
                        <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">
                            {isRehire ? 'Red de Confianza' : 'Talento Verificado'}
                        </p>
                    </div>
                </div>

                {/* Details: Plan & Pricing */}
                <div className="space-y-5 pt-4 border-t border-white/5 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-[7px] font-black text-zinc-700 uppercase tracking-widest">Plan Activo</span>
                            <p className="text-[10px] font-bold uppercase text-emerald-600">
                                {config.plan}
                            </p>
                        </div>
                        <div className="space-y-0.5 text-right">
                            <span className="text-[7px] font-black text-zinc-700 uppercase tracking-widest">Comisión</span>
                            <p className="text-[14px] font-black text-white">
                                ${config.cargo.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="pt-2 text-right">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Sueldo del Turno</span>
                        <p className="text-2xl font-light text-white tracking-tighter">
                            ${config.pago.toLocaleString()}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};
