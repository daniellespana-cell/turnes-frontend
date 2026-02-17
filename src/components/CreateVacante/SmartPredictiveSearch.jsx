import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Briefcase, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllSearchTags, CIUDADES_PRINCIPALES } from '../../domain/vacantes.taxonomy';

// Base de Datos Dinámica
const SUGGESTIONS_DB = {
    cargo: getAllSearchTags(),
    location: CIUDADES_PRINCIPALES
};

const SmartPredictiveSearch = ({
    icon: Icon,
    placeholder,
    value,
    onChange,
    name, // Recibimos el name
    type = 'text',
    mode = 'cargo',
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredSpecs, setFilteredSpecs] = useState([]);
    const wrapperRef = useRef(null);

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

    // Lógica Predictiva
    const handleInputChange = (e) => {
        const newVal = e.target.value;
        onChange(e); // Propagar al padre (ahora e.target.name existe)

        if (type === 'date') return;

        if (newVal.length > 0) {
            const source = SUGGESTIONS_DB[mode] || [];
            const matches = source.filter(item =>
                item.toLowerCase().includes(newVal.toLowerCase())
            ).slice(0, 5); // Top 5 predicciones

            setFilteredSpecs(matches);
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    const selectSuggestion = (suggestion) => {
        // Usamos el 'name' dinámico en lugar de hardcode
        onChange({ target: { name: name, value: suggestion } });
        setIsOpen(false);
    };

    return (
        <div className="relative w-full group" ref={wrapperRef}>
            {/* Input Container */}
            <div className={`
        flex items-center gap-3 p-4 rounded-xl transition-all duration-300
        bg-zinc-900/30 border border-white/5 
        group-focus-within:bg-zinc-900/50 group-focus-within:border-purple-500/20 group-focus-within:shadow-[0_0_15px_-5px_rgba(168,85,247,0.1)]
        ${value ? 'border-purple-500/20 bg-zinc-900/40' : ''}
      `}>
                <div className={`p-2 rounded-lg ${value ? 'bg-brand-primary/10 text-brand-primary' : 'bg-zinc-800/50 text-zinc-500'} transition-colors`}>
                    <Icon size={16} strokeWidth={2.5} />
                </div>

                <div className="flex-1 relative">
                    {/* Label Flotante (Micro-interacción Senior) */}
                    {value && (
                        <motion.span
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                            className="absolute -top-6 left-0 text-[9px] font-black uppercase tracking-widest text-brand-primary"
                        >
                            {placeholder}
                        </motion.span>
                    )}

                    <input
                        type={type}
                        name={name} // Importante: Binding correcto
                        value={value}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        min={type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
                        onFocus={() => {
                            if (value && filteredSpecs.length > 0) setIsOpen(true);
                        }}
                        className="w-full bg-transparent border-none outline-none text-[13px] text-white placeholder:text-zinc-600 font-bold font-manrope disabled:opacity-50"
                        autoComplete="off"
                        {...props}
                    />
                </div>

                {value && type !== 'date' ? (
                    <button onClick={() => selectSuggestion('')} className="text-zinc-600 hover:text-white transition-colors p-1" type="button">
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
                        className="absolute z-50 left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        <div className="px-3 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
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
                                    >
                                        {mode === 'cargo' ? <Briefcase size={14} className="text-zinc-600 group-hover/item:text-brand-primary" /> : <MapPin size={14} className="text-zinc-600 group-hover/item:text-brand-primary" />}

                                        <span>
                                            {item.split(new RegExp(`(${value})`, 'gi')).map((part, index) =>
                                                part.toLowerCase() === value.toLowerCase() ? <span key={index} className="text-brand-primary font-black">{part}</span> : part
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

export default SmartPredictiveSearch;
