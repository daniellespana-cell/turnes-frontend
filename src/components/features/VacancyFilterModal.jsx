import React from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { TURNOS_PREDEFINIDOS, getSkillsBySector } from '../../domain/vacantes.taxonomy';

// Checkbox Component (Smaller & Tighter)
const CheckboxItem = ({ label, isChecked, onClick, disabled }) => (
    <div
        onClick={!disabled ? onClick : undefined}
        className={`flex items-center gap-2 py-2 group transition-opacity ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:opacity-70'}`}
    >
        <div className={`
            w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0
            ${isChecked
                ? 'bg-indigo-500 border-indigo-500'
                : 'border-zinc-700 bg-transparent group-hover:border-zinc-500'}
        `}>
            {isChecked && <Check size={12} className="text-white stroke-[3]" />}
        </div>
        <span className={`text-[12px] md:text-[13px] leading-tight ${isChecked ? 'text-white font-medium' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
            {label}
        </span>
    </div>
);

const FilterSectionTitle = ({ children }) => (
    <h3 className="text-[13px] font-bold text-zinc-300 mb-2 mt-4 uppercase tracking-wider">
        {children}
    </h3>
);

const VacancyFilterModal = ({
    isOpen,
    onClose,
    filters,
    toggleFilter,
    toggleUrgente,  // A6: new handler for urgente quick tag
    clearFilters,
    activeCategory
}) => {
    // Portal Logic
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

    // Esc Key
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Scroll Lock
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!mounted) return null;

    const isFullTime = filters.types.includes('Fijo');
    const mainSchedules = ['mañana_8_2', 'tarde_2_8', 'noche_8_2'];
    const displayedSchedules = TURNOS_PREDEFINIDOS.filter(t => mainSchedules.includes(t.id));
    const availableSkills = activeCategory !== 'TODOS' ? getSkillsBySector(activeCategory) : [];

    // CONTENT RENDER
    const content = (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* BACKDROP */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 z-[99998] backdrop-blur-[2px]"
                    />

                    {/* CONTAINER */}
                    <div className="fixed inset-0 z-[99999] flex flex-col justify-end md:justify-center items-center pointer-events-none p-0 md:p-4">

                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 1 }}
                            className="w-full md:w-[420px] bg-[#121214] rounded-t-2xl md:rounded-2xl  flex flex-col max-h-[80vh] overflow-hidden pointer-events-auto border-t md:border border-transparent"
                        >
                            {/* HEADER COMPACT */}
                            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#121214] shrink-0">
                                <h2 className="text-base font-bold text-white">Filtros</h2>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 -mr-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                                    type="button"
                                    aria-label="Acción">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* CONTENT SCROLL */}
                            <div className="flex-1 overflow-y-auto px-5 py-2 pb-8 scrollbar-hide bg-[#121214]">

                                {/* A6: QUICK TAGS — now connected to real urgente filter */}
                                <div className="flex flex-wrap gap-2 mt-3 mb-1">
                                    {[{ label: 'Urgente 🔥', key: 'urgente' }, { label: 'Inmediato ⚡', key: 'urgente' }].map((tag) => (
                                        <button
                                            key={tag.label}
                                            onClick={toggleUrgente}
                                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wide transition-all
                                                ${filters.urgente
                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                                    : 'bg-zinc-800/40 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'}`}
                                            type="button"
                                            aria-label="Acción">
                                            {tag.label}
                                        </button>
                                    ))}
                                </div>

                                <FilterSectionTitle>Modalidad</FilterSectionTitle>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                    <CheckboxItem
                                        label="Jornada Completa"
                                        isChecked={filters.types.includes('Fijo')}
                                        onClick={() => toggleFilter('types', 'Fijo')}
                                    />
                                    <CheckboxItem
                                        label="Medio Tiempo"
                                        isChecked={filters.types.includes('Temporal')}
                                        onClick={() => toggleFilter('types', 'Temporal')}
                                    />
                                </div>

                                <div className={`transition-all duration-300 ${isFullTime ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}>
                                    <FilterSectionTitle>Turnos {isFullTime && <span className="text-[10px] lowercase font-normal text-zinc-500 ml-1">(No aplica)</span>}</FilterSectionTitle>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                        {displayedSchedules.map(turno => (
                                            <CheckboxItem
                                                key={turno.id}
                                                label={turno.label.split('(')[0].trim()}
                                                isChecked={filters.schedules.includes(turno.id)}
                                                onClick={() => toggleFilter('schedules', turno.id)}
                                                disabled={isFullTime}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {availableSkills.length > 0 && (
                                    <>
                                        <FilterSectionTitle>Requisitos</FilterSectionTitle>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 pb-2">
                                            {availableSkills.map(skill => (
                                                <CheckboxItem
                                                    key={skill.id}
                                                    label={skill.label}
                                                    isChecked={filters.skills.includes(skill.id)}
                                                    onClick={() => toggleFilter('skills', skill.id)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* FOOTER COMPACT */}
                            <div className="p-4 border-t border-white/5 bg-[#121214] shrink-0 flex items-center justify-between">
                                <button
                                    onClick={clearFilters}
                                    className="text-xs font-bold text-rose-500 hover:text-rose-400 px-2 transition-colors uppercase tracking-wider"
                                    type="button"
                                    aria-label="Acción">
                                    Borrar
                                </button>

                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 bg-[#6366f1] hover:bg-[#5558e6] text-white font-bold rounded-lg shadow-lg active:scale-95 text-xs uppercase tracking-widest transition-all"
                                    type="button"
                                    aria-label="Acción">
                                    Ver Resultados
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );

    return createPortal(content, document.body);
};

export default VacancyFilterModal;
