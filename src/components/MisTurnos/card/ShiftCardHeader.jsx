import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, MapPin } from 'lucide-react';
import { CompanyAvatar } from './CompanyAvatar';

export const ShiftCardHeader = ({ shift, isExpanded, onToggle, getStatusColor }) => {

    // Derived state for display
    const isFixed = shift.type === 'fijo';
    const day = shift.fullDate.split(',')[0]; // "Mié"
    const date = shift.fullDate.split(',')[1] || shift.fullDate; // "28 Ene"

    return (
        <div
            className="p-4 flex items-center justify-between gap-3"
            onClick={onToggle}
        >
            {/* 1. DATE BOX */}
            <div className="flex flex-col min-w-[50px] items-center justify-center bg-zinc-950/30 rounded-lg py-1.5 px-2 border border-white/5 shrink-0">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                    {shift.dateDisplay}
                </span>
                <span className="text-sm font-bold text-white leading-none mt-1">
                    {date}
                </span>
            </div>

            {/* 2. MAIN INFO (Company & Role) */}
            <div className="flex-1 flex flex-col pl-1 min-w-0 justify-center">

                {/* Role Label + Badge */}
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 truncate">
                        {shift.role}
                    </span>
                    {isFixed && (
                        <span className="px-1.5 py-[1px] rounded-[3px] bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[8px] font-bold uppercase tracking-wider shrink-0">
                            Fijo
                        </span>
                    )}
                </div>

                {/* Company Name & Avatar */}
                <div className="flex items-center gap-3 mb-1">
                    <CompanyAvatar logo={shift.companyLogo} name={shift.company} size="sm" />
                    <h3 className="text-base font-bold text-white truncate leading-tight">
                        {shift.company}
                    </h3>
                </div>

                {/* Location Meta */}
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 truncate">
                    <MapPin size={10} className="shrink-0" />
                    <span className="truncate">{shift.city || shift.address}</span>
                </div>
            </div>

            {/* 3. PRICE & EXPAND ICON */}
            <div className="flex items-center gap-3 text-right pl-2 border-l border-white/5 shrink-0">
                <div className="flex flex-col items-end">
                    <span className={`text-sm font-bold font-mono tracking-tight ${getStatusColor(shift.status)}`}>
                        ${shift.price.toLocaleString()}
                    </span>
                    <span className="text-[8px] text-zinc-600 font-medium uppercase">
                        {isFixed ? '/día' : 'total'}
                    </span>
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronRight size={16} className="text-zinc-600" />
                </motion.div>
            </div>
        </div>
    );
};
