import React from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';

import { useState, useRef, useEffect } from 'react';
import { useCiudades } from '../../../hooks/useCiudades';
import { filterCities } from '../../../utils/geoUtils';

/**
 * 🌍 LOCATION SELECTOR (Atomic Edition)
 * Buscador inteligente desacoplado de la base de datos.
 */
const LocationSelector = ({ label, value, onChange, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredSpecs, setFilteredSpecs] = useState([]);
    const [inputValue, setInputValue] = useState(value || '');
    const wrapperRef = useRef(null);
    const { ciudades, ciudadesFull } = useCiudades();

    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

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
            const matches = filterCities(ciudades, newVal);
            setFilteredSpecs(matches);
            setIsOpen(true);
        } else {
            setIsOpen(false);
            if (onChange) onChange('', null);
        }
    };

    const selectSuggestion = (suggestion) => {
        setInputValue(suggestion);
        setIsOpen(false);
        
        // Blindaje Null-Safety v2.0
        const cityObj = (ciudadesFull || []).find(c => 
            c.nombre_lower === suggestion.toLowerCase()
        );
        
        if (onChange) {
            onChange(suggestion, cityObj ? { lat: cityObj.lat, lng: cityObj.lng } : null);
        }
    };

    return (
        <div className="flex flex-col gap-2 md:col-span-2 relative" ref={wrapperRef}>
            <label className="text-[10px] md:text-xs font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                {label} <MapPin size={10} className="text-emerald-500" />
            </label>
            <div className={`relative group transition-all duration-500 ${disabled ? 'opacity-60' : 'opacity-100'}`}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => { if (inputValue && filteredSpecs.length > 0) setIsOpen(true); }}
                    disabled={disabled}
                    placeholder="Escriba su ciudad..."
                    className={`
                        w-full h-12 bg-white/5 border border-white/5 
                        rounded-2xl px-4 pl-12 text-sm text-white 
                        outline-none transition-all duration-300
                        placeholder:text-zinc-700 font-bold
                        ${disabled ? 'cursor-not-allowed' : 'focus:border-emerald-500/30 focus:bg-white/10 hover:border-white/20'}
                    `}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-400 transition-all duration-500">
                    <MapPin size={18} />
                </div>

                <AnimatePresence>
                    {isOpen && filteredSpecs.length > 0 && (
                        <motion.div
                            key="location-suggestions-dropdown"
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 8, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            className="absolute z-[120] left-0 right-0 bg-[#0a0b0d] backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2"
                        >
                            <div className="px-3 py-1.5 mb-1 flex items-center justify-between border-b border-white/5">
                                <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-black">Sugerencias</span>
                                <Sparkles size={10} className="text-emerald-500/50" />
                            </div>
                            {filteredSpecs.map((item, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => selectSuggestion(item)}
                                    className="w-full text-left px-4 py-3 rounded-xl text-sm text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all flex items-center justify-between group"
                                    aria-label="Acción">
                                    <span className="capitalize font-bold">{item}</span>
                                    <span className="text-[9px] uppercase font-black text-zinc-600 group-hover:text-emerald-500/50 italic">Seleccionar</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LocationSelector;
