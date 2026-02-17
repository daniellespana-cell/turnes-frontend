import React, { useRef } from 'react';
import {
    Search, List, Map, SlidersHorizontal,
    Utensils, Hammer, Truck, Scissors, Heart, Home, Music, Leaf, Grid
} from 'lucide-react';
import VacancyFilterModal from './VacancyFilterModal';
import TurnesButton from '../ui/TurnesButton';

// UI MAPPING (No es necesario importar la taxonomía completa si solo es para iconos/colores)
const CATEGORY_CONFIG = {
    'TODOS': { icon: Grid, color: 'text-zinc-500', label: 'Todos' },
    'GASTRO': { icon: Utensils, color: 'text-orange-500', label: 'Gastronomía' },
    'CONSTRUCCION': { icon: Hammer, color: 'text-amber-500', label: 'Construcción' },
    'LOGISTICA': { icon: Truck, color: 'text-blue-500', label: 'Logística' },
    'BELLEZA': { icon: Scissors, color: 'text-pink-500', label: 'Belleza' },
    'CUIDADO': { icon: Heart, color: 'text-rose-500', label: 'Cuidado' },
    'HOGAR': { icon: Home, color: 'text-purple-500', label: 'Hogar' },
    'EVENTOS': { icon: Music, color: 'text-indigo-500', label: 'Eventos' },
    'AGRO': { icon: Leaf, color: 'text-emerald-500', label: 'Agro' }
};

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
    clearFilters,
    isFilterOpen,
    setIsFilterOpen,
    activeFilterCount
}) => {
    const scrollContainerRef = useRef(null);

    return (
        <div className="flex flex-col gap-3 pt-5 px-3 mb-6 max-w-7xl mx-auto w-full">

            {/* ROW 1: SEARCH (Minimalist) + FILTERS */}
            <div className="flex items-center gap-3">
                {/* Search Bar - Ultra Minimalist Pill */}
                <div className="relative flex-1 group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                        <Search size={14} strokeWidth={2.5} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar empleo..."
                        className="w-full bg-[#18181b] group-focus-within:bg-zinc-900 border border-zinc-800/50 group-focus-within:border-emerald-500/30 rounded-full py-2.5 pl-9 pr-4 text-[13px] text-white placeholder:text-zinc-600 outline-none transition-all shadow-sm"
                    />
                </div>

                {/* Filter Button (Square-ish but rounded) */}
                {/* Filter Button (Square-ish but rounded) */}
                <TurnesButton
                    onClick={() => setIsFilterOpen(true)}
                    variant={activeFilterCount > 0 ? 'primary' : 'secondary'}
                    size="md"
                    className={`relative p-2.5 !rounded-xl shrink-0 ${activeFilterCount === 0 ? 'bg-[#18181b] border-zinc-800/50' : ''}`}
                >
                    <SlidersHorizontal size={18} strokeWidth={2} />
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white text-black text-[9px] font-bold flex items-center justify-center shadow-sm ring-2 ring-[#09090b]">
                            {activeFilterCount}
                        </span>
                    )}
                </TurnesButton>
            </div>

            {/* ROW 2: CATEGORIES + VIEW TOGGLE (Integrated) */}
            <div className="flex items-center justify-between gap-4">

                {/* Rolling Categories */}
                <div className="relative flex-1 overflow-hidden h-9 flex items-center">
                    <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />

                    <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto gap-2 items-center px-6 scrollbar-hide absolute inset-0"
                    >
                        {categories.map((cat) => {
                            const config = CATEGORY_CONFIG[cat.id] || CATEGORY_CONFIG['TODOS'];
                            const Icon = config.icon;
                            const isActive = activeCategory === cat.id;

                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`
                                        shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border flex items-center gap-1.5 select-none whitespace-nowrap
                                        ${isActive
                                            ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}
                                    `}
                                >
                                    <Icon size={12} className={isActive ? 'text-black' : config.color} />
                                    <span>{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* View Toggle (Text Based - UX Verified) */}
                <div className="bg-[#18181b] p-0.5 rounded-lg border border-zinc-800 flex shrink-0">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <List size={12} />
                        <span className="text-[10px] font-bold">Lista</span>
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all ${viewMode === 'map' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Map size={12} />
                        <span className="text-[10px] font-bold">Mapa</span>
                    </button>
                </div>
            </div>

            {/* CSS UTILS */}
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

            {/* MODAL PORTAL */}
            <VacancyFilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                toggleFilter={toggleFilter}
                clearFilters={clearFilters}
                activeCategory={activeCategory}
            />
        </div>
    );
};

export default ExploreHeader;
