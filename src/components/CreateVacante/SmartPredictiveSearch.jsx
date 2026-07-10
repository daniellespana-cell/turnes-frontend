import React from 'react';
import { MapPin, Briefcase, Sparkles, X } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';

import { useState, useEffect, useRef, useMemo } from 'react';
import { getAllSearchTags } from '../../domain/vacantes.taxonomy';
import { useCiudades } from '../../hooks/useCiudades';

const SmartPredictiveSearch = ({
    icon: Icon,
    placeholder,
    value,
    onChange,
    name,
    type = 'text',
    mode = 'cargo',
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredSpecs, setFilteredSpecs] = useState([]);
    const wrapperRef = useRef(null);

    // 🌎 Ciudades desde Supabase (fallback instantáneo a geography.config.js)
    const { ciudades } = useCiudades();

    // useMemo: evita recalcular getAllSearchTags() en cada render
    const SUGGESTIONS_DB = useMemo(() => ({
        cargo: getAllSearchTags(),
        location: ciudades
    }), [ciudades]);

    // Cierra si clic afuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Normalización de strings para búsqueda (ignora acentos)
    const normalize = (str) =>
        str?.toLowerCase()
           .normalize("NFD")
           .replace(/[\u0300-\u036f]/g, "") || "";

    // Lógica Predictiva
    const handleInputChange = (e) => {
        const newVal = e.target.value;
        onChange(e); 

        if (type === 'date') return;

        if (newVal.length > 0) {
            const searchVal = normalize(newVal);
            const source = SUGGESTIONS_DB[mode] || [];
            
            // 🧠 Senior Matching Algorithm: Prioritiza si EMPIEZA con la letra, luego si la CONTIENE
            const exactMatches = source.filter(item => normalize(item) === searchVal);
            const startsWithMatches = source.filter(item => normalize(item).startsWith(searchVal) && normalize(item) !== searchVal);
            const includesMatches = source.filter(item => normalize(item).includes(searchVal) && !normalize(item).startsWith(searchVal));

            const combinedMatches = [...exactMatches, ...startsWithMatches, ...includesMatches].slice(0, 8); 

            setFilteredSpecs(combinedMatches);
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    const selectSuggestion = (suggestion) => {
        onChange({ target: { name: name, value: suggestion } });
        setIsOpen(false);
    };

    return (
        <div className="relative w-full group" ref={wrapperRef}>
            {/* Input Container */}
            <div className={`
        flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300
        bg-[#0f0f0f] border border-zinc-800 hover:border-zinc-700 shadow-sm
        group-focus-within:border-emerald-500/50 group-focus-within:bg-[#151515] group-focus-within:shadow-[0_0_15px_rgba(16,185,129,0.15)]
        ${value ? 'border-zinc-700 bg-[#121212]' : ''}
      `}>
                <div className={`p-2 rounded-lg ${value ? 'bg-brand-primary/10 text-brand-primary' : 'bg-zinc-800/50 text-zinc-500'} transition-colors`}>
                    <Icon size={16} strokeWidth={2.5} />
                </div>

                <div className="flex-1 relative">
                    {/* Label Flotante (Micro-interacción Senior) */}
                    {value && (
                        <motion.span
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                            className="absolute -top-6 left-0 text-[10px] font-black uppercase tracking-widest text-brand-primary"
                        >
                            {placeholder}
                        </motion.span>
                    )}

                    <input
                        type={type}
                        name={name}
                        value={value}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        spellCheck={false}
                        autoComplete="off"
                        autoCorrect="off"
                        min={type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
                        onFocus={() => {
                            if (value && filteredSpecs.length > 0) setIsOpen(true);
                        }}
                        className="w-full bg-transparent border-none outline-none text-[13px] text-white placeholder:text-zinc-600 font-bold font-manrope disabled:opacity-50"
                        {...props}
                    />
                </div>

                {value && type !== 'date' ? (
                    <button
                        onClick={() => selectSuggestion('')}
                        className="text-zinc-600 hover:text-white transition-colors p-1"
                        type="button"
                        aria-label="Acción">
                        <X size={14} />
                    </button>
                ) : (
                    type !== 'date' && <Sparkles size={12} className="text-zinc-700 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                )}
            </div>
            {/* Dropdown Predictivo */}
            <AnimatePresence>
                {isOpen && filteredSpecs.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 4, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-50 left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-transparent rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        <div className="px-3 py-2 bg-white/5 flex items-center justify-between">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Sugerencias Inteligentes</span>
                            <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1">
                                <Sparkles size={8} /> AI Powered
                            </span>
                        </div>

                        <ul className="py-1 max-h-48 overflow-y-auto custom-scrollbar">
                            {filteredSpecs.map((item, i) => (
                                <li key={i}>
                                    <button
                                        type="button"
                                        onClick={() => selectSuggestion(item)}
                                        className="w-full text-left px-4 py-3 text-[13px] text-zinc-300 hover:bg-white/5 hover:text-white transition-all flex items-center gap-3 group/item border-l-2 border-transparent hover:border-brand-primary"
                                        aria-label="Acción">
                                        {mode === 'cargo' ? <Briefcase size={14} className="text-zinc-600 group-hover/item:text-brand-primary" /> : <MapPin size={14} className="text-zinc-600 group-hover/item:text-brand-primary" />}

                                        <span>
                                            {(() => {
                                                const searchVal = normalize(value);
                                                if (!searchVal) return item;
                                                
                                                const normalizedItem = normalize(item);
                                                const startIndex = normalizedItem.indexOf(searchVal);
                                                
                                                if (startIndex === -1) return item;
                                                
                                                const endIndex = startIndex + searchVal.length;
                                                
                                                // Mantenemos los caracteres originales del item para el renderizado
                                                const before = item.substring(0, startIndex);
                                                const match = item.substring(startIndex, endIndex);
                                                const after = item.substring(endIndex);
                                                
                                                return (
                                                    <>
                                                        {before}
                                                        <span className="text-brand-primary font-black">{match}</span>
                                                        {after}
                                                    </>
                                                );
                                            })()}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SmartPredictiveSearch;
