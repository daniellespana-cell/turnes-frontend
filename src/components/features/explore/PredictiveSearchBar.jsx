import React from 'react';
import { Search, X } from 'lucide-react';

import { useRef, useState, useCallback } from 'react';
import { usePredictiveSearch } from '../../../hooks/usePredictiveSearch';

const PredictiveSearchBar = ({ value, onChange, onSelectSuggestion, onClear }) => {
    const [isFocused, setIsFocused] = useState(false);
    const suggestions = usePredictiveSearch(value);
    const show = isFocused && suggestions.length > 0 && value.length >= 2;
    const inputRef = useRef(null);

    const handleSelect = useCallback((suggestion) => {
        onSelectSuggestion(suggestion);
        inputRef.current?.blur();
    }, [onSelectSuggestion]);

    return (
        <div className="relative flex-1">
            {/* Input pill */}
            <div className={`
                flex items-center bg-zinc-900/70 backdrop-blur-xl border rounded-2xl px-3 py-2.5 gap-2.5
                transition-all duration-300
                ${isFocused
                    ? 'border-white/20 shadow-[0_0_0_3px_rgba(255,255,255,0.04)]'
                    : 'border-white/8'}
            `}>
                <button
                    onClick={() => { inputRef.current?.blur(); }}
                    className={`shrink-0 p-1.5 rounded-lg transition-all ${
                        value.trim().length > 0
                        ? 'bg-brand-success text-[#09090b] shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:scale-105 active:scale-95 cursor-pointer'
                        : 'text-zinc-500 bg-white/5 cursor-default'
                    }`}
                    disabled={!value.trim()}
                    title="Buscar"
                >
                    <Search size={14} strokeWidth={3} />
                </button>
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onKeyDown={e => { if(e.key === 'Enter') inputRef.current?.blur(); }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                    placeholder="Buscar cargo, habilidad o sector..."
                    className="flex-1 bg-transparent border-none text-[13px] font-medium text-white placeholder:text-zinc-600 outline-none min-w-0"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                />
                {value && (
                    <button
                        onClick={onClear}
                        className="shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors mr-1"
                    >
                        <X size={14} strokeWidth={2.5} />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {show && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-zinc-900/95 backdrop-blur-xl border border-transparent rounded-2xl overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)]">
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            onMouseDown={() => handleSelect(s)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
                        >
                            <Search size={12} className="text-zinc-600 shrink-0" strokeWidth={2.5} />
                            <span className="text-[12px] text-zinc-300 font-medium truncate">
                                {s}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PredictiveSearchBar;
