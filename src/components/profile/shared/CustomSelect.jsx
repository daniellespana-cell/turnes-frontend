import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';

import { useState, useRef, useEffect } from 'react';

const CustomSelect = ({ label, value, options, onChange, disabled, placeholder, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
            <label className="text-[10px] md:text-xs font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                {label}
            </label>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full h-12 flex items-center justify-between
                    bg-white/5 border border-white/5 
                    rounded-2xl px-4 text-sm text-zinc-300 
                    outline-none transition-all duration-300
                    ${isOpen ? 'border-emerald-500/30 bg-emerald-500/5' : 'hover:border-white/20 hover:bg-white/10'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                aria-label="Acción">
                <div className="flex items-center gap-3 truncate">
                    {icon && <span className="text-zinc-500">{icon}</span>}
                    <span className={selectedOption ? 'text-white font-bold' : 'text-zinc-600'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown size={16} className={`text-zinc-500 transition-transform duration-500 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 right-0 top-[calc(100%+8px)] z-[110] 
                                   bg-[#0a0b0d] backdrop-blur-3xl border border-white/10 
                                   rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
                    >
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full text-left px-5 py-3 text-sm
                                    transition-all flex items-center justify-between
                                    ${value === opt.value ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}
                                `}
                                aria-label="Acción">
                                <span className="flex-1">{opt.label}</span>
                                {value === opt.value && <Check size={16} className="text-emerald-400" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomSelect;
