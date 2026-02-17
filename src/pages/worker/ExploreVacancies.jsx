import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { useExploreVacancies } from '../../hooks/useExploreVacancies';
import { useToast } from '../../context/ToastContext'; // Import Toast
import EmptyState from '../../components/common/EmptyState';
import VacancyMap from '../../components/features/VacancyMap';
import ExploreHeader from '../../components/features/ExploreHeader';
import VacancyCard from '../../components/features/VacancyCard';
import VacancySkeleton from '../../components/features/VacancySkeleton'; // IMPORT SKELETON

const ExploreVacancies = () => {
    const { showToast } = useToast();
    const [selectedMapVacancy, setSelectedMapVacancy] = useState(null);
    const [isApplying, setIsApplying] = useState(null);

    const {
        vacancies,
        categories,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        applyToVacancy,
        loading, // Added loading
        viewMode,
        setViewMode,
        userLocation,
        // Nuevos Props de Filtros
        filters, toggleFilter, clearFilters, isFilterOpen, setIsFilterOpen, activeFilterCount
    } = useExploreVacancies();

    const handleMapSelection = (vacancy) => {
        setSelectedMapVacancy(vacancy);
    };

    const handleApply = async (id) => {
        setIsApplying(id);
        const result = await applyToVacancy(id);
        setIsApplying(null);
        if (result.success) {
            showToast(result.message, "success");
            setSelectedMapVacancy(null); // Close map preview on success
        }
    };

    return (
        <div className="font-manrope pb-24 animate-fade-in min-h-screen w-full overflow-x-hidden">

            {/* HEADER COMPONETIZADO + FILTROS */}
            <ExploreHeader
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                viewMode={viewMode}
                setViewMode={setViewMode}
                categories={categories}
                // Filtros
                filters={filters}
                toggleFilter={toggleFilter}
                clearFilters={clearFilters}
                isFilterOpen={isFilterOpen}
                setIsFilterOpen={setIsFilterOpen}
                activeFilterCount={activeFilterCount}
            />

            {/* CONTENIDO PRINCIPAL */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-2"
                    >
                        {[...Array(8)].map((_, i) => (
                            <VacancySkeleton key={i} />
                        ))}
                    </motion.div>
                ) : vacancies.length === 0 ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full py-12">
                        <EmptyState
                            icon={Search}
                            title="Sin vacantes disponibles"
                            description="Intenta ajustar tus filtros de búsqueda."
                            actionLabel="Limpiar Filtros"
                            onAction={() => { setActiveCategory('TODOS'); setSearchQuery(''); clearFilters(); }}
                        />
                    </motion.div>
                ) : viewMode === 'map' ? (
                    <motion.div
                        key="map"
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="h-[500px] w-full px-1 relative"
                    >
                        <VacancyMap
                            vacancies={vacancies}
                            onSelectVacancy={handleMapSelection} // New Handler
                            userLocation={userLocation}
                        />

                        {/* BOTTOM SHEET PREVIEW */}
                        <AnimatePresence>
                            {selectedMapVacancy && (
                                <motion.div
                                    initial={{ y: "100%", opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: "100%", opacity: 0 }}
                                    className="absolute bottom-4 left-4 right-4 z-[999]"
                                >
                                    <div className="bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl p-4 flex gap-4 items-center">
                                        <div className="w-16 h-16 rounded-xl bg-zinc-800 shrink-0 overflow-hidden">
                                            <img src={selectedMapVacancy.image} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-bold text-sm truncate">{selectedMapVacancy.title}</h4>
                                            <p className="text-zinc-500 text-xs truncate">{selectedMapVacancy.business}</p>
                                            <p className="text-emerald-500 font-bold text-xs mt-1">${(selectedMapVacancy.price / 1000).toFixed(0)}k <span className="text-zinc-600 font-normal">• {selectedMapVacancy.type}</span></p>
                                        </div>
                                        <div className="flex flex-col gap-2 shrink-0">
                                            <button
                                                onClick={() => handleApply(selectedMapVacancy.id)}
                                                disabled={isApplying === selectedMapVacancy.id}
                                                className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition-colors"
                                            >
                                                {isApplying === selectedMapVacancy.id ? '...' : 'Aplicar'}
                                            </button>
                                            <button
                                                onClick={() => setSelectedMapVacancy(null)}
                                                className="px-4 py-1 text-zinc-500 text-[10px] hover:text-white"
                                            >
                                                Cerrar
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-2"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        {vacancies.map((vacancy) => (
                            <VacancyCard
                                key={vacancy.id}
                                vacancy={vacancy}
                                onApply={handleApply} // Changed to local handler
                                isApplying={isApplying === vacancy.id}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExploreVacancies;
