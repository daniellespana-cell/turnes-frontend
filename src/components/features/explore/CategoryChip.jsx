import React from 'react';
import { X } from 'lucide-react';

import { getCategoryUIConfig } from '../../../domain/vacantes.taxonomy';

const CategoryChip = ({ cat, isActive, onClick }) => {
    const isTodos = cat.id === 'TODOS';
    // For taxonomy categories, get the hex color accent
    const ui = isTodos ? null : getCategoryUIConfig(cat.id);

    // Extract just the emoji + short name (trim the emoji from tail, put at front)
    const label = cat.label;

    return (
        <button
            onClick={onClick}
            className={`
                relative shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold
                transition-all duration-200 whitespace-nowrap select-none
                ${isActive
                    ? 'text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }
            `}
            style={isActive && ui ? {
                background: `${ui.hex}18`,
                border: `1px solid ${ui.hex}40`,
                color: ui.hex,
            } : isActive ? {
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
            } : {
                background: 'transparent',
                border: '1px solid transparent',
            }}
            type="button"
            aria-label="Acción">
            {label}
            {isActive && (
                <span
                    className="ml-0.5 w-3.5 h-3.5 flex items-center justify-center rounded-full"
                    style={{ background: ui ? `${ui.hex}30` : 'rgba(255,255,255,0.15)' }}
                >
                    <X size={8} strokeWidth={3} />
                </span>
            )}
        </button>
    );
};

export default CategoryChip;
