import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { MapPin, Check } from 'lucide-react';
import { AnimatePresence, m as motion } from 'framer-motion';
import { useCiudades } from '../../../hooks/useCiudades';
import { CIUDADES_COORDS } from '../../../domain/geography.config';

/**
 * 🏗️ CityAutocomplete — Componente Compartido (Worker + Business)
 *
 * Single Source of Truth para selección de ciudad con resolución de coordenadas.
 * Consume `useCiudades` (taxonomy local-first) para el autocompletado
 * y resuelve lat/lng desde `CIUDADES_COORDS` automáticamente.
 *
 * Props:
 *   value       — string: nombre de la ciudad actual
 *   onChange     — (cityName: string, coords: { lat, lng } | null | undefined) => void
 *                  coords = { lat, lng } si la ciudad fue resuelta
 *                  coords = null si se borró el campo
 *                  coords = undefined si está tipeando (no tocar lat/lng existentes)
 *   disabled    — boolean
 *   label       — string: etiqueta del campo
 *   id          — string: id HTML del input
 *   placeholder — string
 */
const CityAutocomplete = ({
    value = '',
    onChange,
    disabled = false,
    label = 'Ubicación Base',
    id = 'city-autocomplete',
    placeholder = 'Ej: Bucaramanga',
}) => {
    const [inputValue, setInputValue] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const { ciudadesFull } = useCiudades();

    // Sincronizar valor externo SOLO cuando el input no tiene foco
    // (evita pisar lo que el usuario está tipeando durante re-renders del padre)
    useEffect(() => {
        if (document.activeElement?.id !== id) {
            setInputValue(value || '');
        }
    }, [value, id]);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
                setActiveIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filtrado reactivo por substring (case-insensitive)
    const filtered = useMemo(() => {
        if (!inputValue || inputValue.length < 1) return [];
        const search = inputValue.toLowerCase().trim();
        return ciudadesFull
            .filter(c => c.nombre_lower.includes(search))
            .slice(0, 8);
    }, [inputValue, ciudadesFull]);

    // Resolución de coordenadas (case-insensitive, memoizable)
    const resolveCoords = useCallback((cityName) => {
        if (!cityName) return null;
        // Match exacto primero (O(1))
        const exact = CIUDADES_COORDS[cityName];
        if (exact) return { lat: exact.lat, lng: exact.lng };
        // Fallback case-insensitive
        const search = cityName.trim().toLowerCase();
        const key = Object.keys(CIUDADES_COORDS).find(k => k.toLowerCase() === search);
        if (key) return { lat: CIUDADES_COORDS[key].lat, lng: CIUDADES_COORDS[key].lng };
        return null;
    }, []);

    // Memoizar isResolved para evitar recalcular en cada render
    const isResolved = useMemo(
        () => Boolean(resolveCoords(inputValue)),
        [inputValue, resolveCoords]
    );

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleInput = (e) => {
        const val = e.target.value;
        setInputValue(val);
        setIsOpen(val.length > 0);
        setActiveIndex(-1);

        // Solo propagar coords cuando hay match exacto o se borró el campo.
        // Mientras el usuario tipea ("Buca..."), enviamos undefined
        // para que el padre NO borre las coords existentes.
        const coords = resolveCoords(val);
        if (coords) {
            onChange(val, coords);
        } else if (val === '') {
            onChange('', null);
        } else {
            onChange(val, undefined);
        }
    };

    const handleSelect = (ciudad) => {
        setInputValue(ciudad.nombre);
        setIsOpen(false);
        setActiveIndex(-1);
        onChange(ciudad.nombre, { lat: ciudad.lat, lng: ciudad.lng });
    };

    // ── Keyboard Navigation (WCAG 2.1 Combobox Pattern) ─────────────────────

    const handleKeyDown = (e) => {
        if (!isOpen || filtered.length === 0) {
            if (e.key === 'ArrowDown' && inputValue && filtered.length > 0) {
                setIsOpen(true);
                setActiveIndex(0);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % filtered.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + filtered.length) % filtered.length);
                break;
            case 'Enter':
                e.preventDefault();
                if (activeIndex >= 0 && activeIndex < filtered.length) {
                    handleSelect(filtered[activeIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setActiveIndex(-1);
                break;
            default:
                break;
        }
    };

    // Scroll del item activo a la vista dentro del listbox
    useEffect(() => {
        if (activeIndex >= 0 && listRef.current) {
            const items = listRef.current.querySelectorAll('[role="option"]');
            const target = items[activeIndex];
            if (target) target.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex]);

    // ── Focus: scroll input a la vista en móviles (sobre el teclado virtual) ─
    const handleFocus = () => {
        if (inputValue && filtered.length > 0) setIsOpen(true);
        // Delay para esperar que el teclado virtual se abra
        setTimeout(() => {
            inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-1" ref={wrapperRef}>
            <label
                htmlFor={id}
                className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 flex items-center gap-1.5"
            >
                <MapPin size={10} className="opacity-70" />
                {label}
            </label>

            <div className="relative">
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-controls={`${id}-listbox`}
                    aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
                    aria-autocomplete="list"
                    value={inputValue}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    disabled={disabled}
                    placeholder={placeholder}
                    autoComplete="off"
                    className={`
                        w-full bg-zinc-950 border rounded-xl px-4 py-3 text-sm text-white
                        placeholder:text-zinc-700 outline-none transition-all duration-200
                        ${disabled
                            ? 'border-zinc-800/50 opacity-60 cursor-default'
                            : 'border-zinc-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 cursor-text'}
                    `}
                />

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 4 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-50 left-0 right-0 mt-1 bg-[#0a0b0d] backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                        >
                            {filtered.length > 0 ? (
                                <>
                                    <div className="px-3 py-1.5 border-b border-white/5">
                                        <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-black">
                                            {filtered.length} ciudades encontradas
                                        </span>
                                    </div>
                                    <div
                                        ref={listRef}
                                        role="listbox"
                                        id={`${id}-listbox`}
                                        className="max-h-48 overflow-y-auto custom-scrollbar"
                                    >
                                        {filtered.map((ciudad, i) => (
                                            <button
                                                key={ciudad.nombre}
                                                id={`${id}-option-${i}`}
                                                role="option"
                                                aria-selected={i === activeIndex}
                                                type="button"
                                                onClick={() => handleSelect(ciudad)}
                                                className={`
                                                    w-full text-left px-4 py-3.5 text-sm
                                                    transition-all flex items-center justify-between
                                                    ${i === activeIndex
                                                        ? 'bg-purple-500/15 text-purple-300'
                                                        : 'text-zinc-400 hover:bg-purple-500/10 hover:text-purple-300'}
                                                `}
                                                aria-label={`Seleccionar ${ciudad.nombre}`}
                                            >
                                                <span className="font-medium">{ciudad.nombre}</span>
                                                <span className="text-[9px] text-zinc-600 italic">
                                                    {ciudad.departamento}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="px-4 py-4 text-center">
                                    <p className="text-[11px] text-zinc-500">
                                        No se encontraron ciudades para &ldquo;{inputValue}&rdquo;
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Feedback contextual */}
            {!disabled && isResolved && (
                <p className="text-[10px] text-emerald-500/80 mt-0.5 px-1 flex items-center gap-1">
                    <Check size={10} />
                    Ciudad verificada — match geográfico activo.
                </p>
            )}
            {!disabled && inputValue && !isResolved && (
                <p className="text-[10px] text-amber-500/80 mt-0.5 px-1">
                    Ciudad no reconocida — selecciona del listado para activar el match.
                </p>
            )}
            {!disabled && !inputValue && (
                <p className="text-[10px] text-zinc-600 mt-0.5 px-1">
                    Selecciona tu ciudad para mejorar el match de vacantes.
                </p>
            )}
        </div>
    );
};

export default CityAutocomplete;
