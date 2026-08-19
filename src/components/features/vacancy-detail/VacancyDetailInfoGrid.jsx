import React from 'react';

import { DollarSign, MapPin, Clock } from 'lucide-react';

export const VacancyDetailInfoGrid = ({ vacancy }) => {
    return (
        <div className="grid grid-cols-3 gap-3">
            {[
                {
                    icon: DollarSign,
                    label: 'Pago',
                    value: vacancy.priceLabel,
                    sub: vacancy.price > 0 ? '/ turno' : null,
                },
                {
                    icon: MapPin,
                    label: 'Distancia',
                    value: vacancy.distance ?? 'N/A',
                    sub: null,
                },
                {
                    icon: Clock,
                    label: 'Fecha Turno',
                    value: vacancy.date || 'A convenir',
                    sub: vacancy.scheduleLabel || null,
                },
            ].map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="bg-zinc-900/40 rounded-[14px] p-2.5 border border-white/5 text-center shadow-inner shadow-black/20">
                    <Icon size={12} className="text-zinc-500 mx-auto mb-1" strokeWidth={2} />
                    <p className="text-[7px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">{label}</p>
                    <p className="text-[11px] font-bold text-white leading-tight">{value}</p>
                    {sub && <p className="text-[8px] text-zinc-500">{sub}</p>}
                </div>
            ))}
        </div>
    );
};

export default VacancyDetailInfoGrid;
