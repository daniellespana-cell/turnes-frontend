import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import VacancyFilterModal from './VacancyFilterModal';
import CategoryChip from './explore/CategoryChip';
import PredictiveSearchBar from './explore/PredictiveSearchBar';

import { useRef } from 'react';
import { List, Map } from 'lucide-react';
import { typography } from '../../styles/typography';

// ─── ExploreHeader ────────────────────────────────────────────────────────────
const ExploreHeader = ({
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    categories,
    filters,
    toggleFilter,
    toggleUrgente,
    clearFilters,
    isFilterOpen,
    setIsFilterOpen,
    activeFilterCount,
}) => {
    const chipsRef = useRef(null);

    return (
        <div className="flex flex-col pt-4 md:pt-8 pb-2 shrink-0 max-w-7xl mx-auto w-full px-4 md:px-6">
            {/* ── ROW 1 MOBILE: Título + Vista toggle ── */}
            <div className="flex items-center justify-between mb-3 md:mb-5">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight text-white leading-tight">
                        Explorar <span className={typography.gradient}>Vacantes</span>
                    </h1>
                    <p className="text-[10px] text-zinc-500 mt-0.5 hidden md:block">
                        Oportunidades cerca de ti basadas en tu perfil.
                    </p>
                </div>

                {/* View toggle — compact for mobile */}
                <div className="flex items-center gap-1 bg-zinc-900/60 p-0.5 rounded-xl border border-transparent">
                    {[
                        { mode: 'list', icon: List,  label: 'Lista' },
                        { mode: 'map',  icon: Map,   label: 'Mapa'  },
                    ].map(({ mode, icon: Icon, label }) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`
                                flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all
                                ${viewMode === mode
                                    ? 'bg-zinc-700 text-white'
                                    : 'text-zinc-500 hover:text-zinc-300'}
                            `}
                            type="button"
                            aria-label="Acción">
                            <Icon size={12} strokeWidth={2.5} />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>
            </div>
            {/* ── ROW 2: Search + Filter button (always full width) ── */}
            <div className="flex items-center gap-2.5 mb-3">
                <PredictiveSearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSelectSuggestion={setSearchQuery}
                    onClear={() => setSearchQuery('')}
                />

                {/* Filter button */}
                <button
                    onClick={() => setIsFilterOpen(true)}
                    className={`
                        relative flex items-center justify-center w-10 h-10 shrink-0 rounded-2xl border transition-all duration-200
                        ${activeFilterCount > 0
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-zinc-900/60 border-white/8 text-zinc-500 hover:text-zinc-300 hover:border-white/15'}
                    `}
                    type="button"
                    aria-label="Acción">
                    <SlidersHorizontal size={16} strokeWidth={2.5} />
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] font-black flex items-center justify-center ring-2 ring-[#09090b]">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>
            {/* ── ROW 3: Category chips — horizontal scroll, edge-to-edge ── */}
            <div className="relative -mx-4 md:-mx-6">
                {/* Left/right fade hints */}
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#09090b] to-transparent z-10" />
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#09090b] to-transparent z-10" />

                <div
                    ref={chipsRef}
                    className="flex overflow-x-auto gap-1.5 pb-2 px-4 md:px-6 no-scrollbar"
                >
                    {categories.map(cat => (
                        <CategoryChip
                            key={cat.id}
                            cat={cat}
                            isActive={activeCategory === cat.id}
                            onClick={() => setActiveCategory(activeCategory === cat.id && cat.id !== 'TODOS' ? 'TODOS' : cat.id)}
                        />
                    ))}
                </div>
            </div>
            <VacancyFilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                toggleFilter={toggleFilter}
                toggleUrgente={toggleUrgente}
                clearFilters={clearFilters}
                activeCategory={activeCategory}
            />
        </div>
    );
};

export default ExploreHeader;
