import React from 'react';
import { Briefcase, Calendar, MapPin, DollarSign, PlusCircle, CheckCircle2 } from 'lucide-react';

import { formatCurrency } from '../../../services/financeService';

export const VacancySelector = ({ vacancies, selectedId, onSelect, onCreateNew }) => (
    <div className="space-y-3">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">
            Selecciona una Vacante Activa
        </h3>
        
        <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1 scrollbar-hide">
            {vacancies.map((v) => (
                <button
                    key={v.id}
                    onClick={() => onSelect(v.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group
                        ${selectedId === v.id 
                            ? 'bg-emerald-500/5 border-emerald-500/30' 
                            : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'}
                    `}
                >
                    <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                            ${selectedId === v.id ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-900 text-zinc-500 group-hover:text-zinc-400'}
                        `}>
                            <Briefcase size={18} />
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                                {v.titulo}
                            </h4>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500 font-medium">
                                <span className="flex items-center gap-1">
                                    <Calendar size={10} /> {v.fecha_turno?.split('T')[0] || 'Flexible'}
                                </span>
                                <span className="flex items-center gap-1 text-emerald-500/80">
                                    <DollarSign size={10} /> {formatCurrency(v.pago_monto)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {selectedId === v.id && (
                        <div className="shrink-0 text-emerald-500 animate-in zoom-in">
                            <CheckCircle2 size={20} />
                        </div>
                    )}
                </button>
            ))}

            <button
                onClick={onCreateNew}
                className="w-full py-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-zinc-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest"
            >
                <PlusCircle size={14} /> Crear Nueva Vacante
            </button>
        </div>
    </div>
);

export default VacancySelector;
