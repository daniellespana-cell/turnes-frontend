import React from 'react';
import { Building2, Clock, MapPin } from 'lucide-react';

const DetailRow = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-start gap-3">
        <div className="p-1.5 bg-zinc-800 rounded-md shrink-0">
            <Icon size={14} className="text-zinc-400" />
        </div>
        <div>
            <p className="text-xs font-medium text-zinc-200">{title}</p>
            <p className="text-[10px] text-zinc-500">{subtitle}</p>
        </div>
    </div>
);

export const ShiftCardBody = ({ shift }) => {
    return (
        <div className="grid grid-cols-1 gap-3">
            <DetailRow
                icon={Building2}
                title={shift.company}
                subtitle="Empresa Contratante"
            />
            <DetailRow
                icon={Clock}
                title={shift.time}
                subtitle="Horario del Turno"
            />
            <DetailRow
                icon={MapPin}
                title={shift.address}
                subtitle={`${shift.city} • ${shift.neighborhood || 'Barrio por confirmar'}`}
            />
        </div>
    );
};
