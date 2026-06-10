import React from 'react';
import { Search, Briefcase, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useState, useEffect, useRef, useMemo } from 'react';
import { getAllSearchTags } from '../../domain/vacantes.taxonomy';

const CargoTagSelector = ({
    selectedTags,
    onChange,
    maxTags = 2
}) => {
    // 🧠 Sugerencias dinámicas (Reacciona al sync de la DB)
    const SUGGESTIONS_DB = useMemo(() => getAllSearchTags(), []);
    
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredSpecs, setFilteredSpecs] = useState([]);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const newVal = e.target.value;
        setInputValue(newVal);

        if (newVal.length > 0) {
            const matches = SUGGESTIONS_DB.filter(item =>
                item.toLowerCase().includes(newVal.toLowerCase()) &&
                !selectedTags.includes(item) // Evitar duplicados
            ).slice(0, 5);

            setFilteredSpecs(matches);
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.length > 0) {
            e.preventDefault();
            // Auto select la primera sugerencia si hay, sino crear tag custom
            if (filteredSpecs.length > 0) {
                addTag(filteredSpecs[0]);
            } else {
                addTag(inputValue.trim());
            }
        }
    };

    const addTag = (tag) => {
        if (!tag) return;
        if (selectedTags.length >= maxTags) return; // Limite
        if (selectedTags.includes(tag)) return; // No duplicados

        onChange([...selectedTags, tag]);
        setInputValue('');
        setIsOpen(false);
        setFilteredSpecs([]);
    };

    const removeTag = (tagToRemove) => {
        onChange(selectedTags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className="relative w-full space-y-3" ref={wrapperRef}>
            {/* Input de Busqueda */}
            <div className={`
                flex items-center gap-3 p-4 rounded-xl transition-all duration-300
                bg-zinc-900/30 
                focus-within:bg-zinc-900/50 focus-within:shadow-[0_0_20px_-5px_rgba(20,184,166,0.15)]
                ${selectedTags.length >= maxTags ? 'opacity-50 pointer-events-none grayscale' : ''}
            `}>
                <div className="p-2 rounded-lg bg-zinc-800/50 text-zinc-500 transition-colors">
                    <Search size={16} strokeWidth={2.5} />
                </div>

                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={selectedTags.length >= maxTags ? `Máximo ${maxTags} etiquetas alcanzado` : "Buscar puesto (Ej: Mesero, Bartender)"}
                        disabled={selectedTags.length >= maxTags}
                        className="w-full bg-transparent border-none outline-none text-[13px] text-white placeholder:text-zinc-600 font-bold font-manrope disabled:cursor-not-allowed"
                        autoComplete="off"
                        onFocus={() => {
                            if (inputValue && filteredSpecs.length > 0) setIsOpen(true);
                        }}
                    />
                </div>
            </div>

            {/* Renderización de Tags Seleccionados (Hashtags) */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 px-1">
                    <AnimatePresence>
                        {selectedTags.map(tag => (
                            <motion.span
                                key={tag}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg text-xs font-bold tracking-wide"
                            >
                                #{tag}
                                <button
                                    onClick={() => removeTag(tag)}
                                    className="p-0.5 hover:bg-brand-primary/20 rounded-md transition-colors text-brand-primary/70 hover:text-brand-primary"
                                >
                                    <X size={12} strokeWidth={3} />
                                </button>
                            </motion.span>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <p className="px-2 text-[10px] text-emerald-500/50 font-medium">Ayuda al algoritmo de Match. {selectedTags.length}/{maxTags} hashtags seleccionados.</p>

            {/* Dropdown Predictivo */}
            <AnimatePresence>
                {isOpen && filteredSpecs.length > 0 && selectedTags.length < maxTags && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 4, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-50 left-0 right-0 top-16 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-transparent rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        <div className="px-3 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Taxonomía Turnes</span>
                            <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1">
                                <Sparkles size={8} /> Match IA
                            </span>
                        </div>

                        <ul className="py-1 max-h-48 overflow-y-auto custom-scrollbar">
                            {filteredSpecs.map((item, i) => (
                                <li key={i}>
                                    <button
                                        type="button"
                                        onClick={() => addTag(item)}
                                        className="w-full text-left px-4 py-3 text-[13px] text-zinc-300 hover:bg-white/5 hover:text-brand-primary transition-all flex items-center gap-3 group/item border-l-2 border-transparent hover:border-brand-primary"
                                    >
                                        <Briefcase size={14} className="text-zinc-600 group-hover/item:text-brand-primary" />
                                        <span>
                                            {item.split(new RegExp(`(${inputValue})`, 'gi')).map((part, index) =>
                                                part.toLowerCase() === inputValue.toLowerCase() ? <span key={index} className="text-brand-primary font-black">{part}</span> : part
                                            )}
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

export default CargoTagSelector;
