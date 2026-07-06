import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '../common/EmptyState';
import ErrorView from '../common/ErrorView';
import RadarEmptyState from '../worker-dashboard/RadarEmptyState';
import ExploreCarouselSkeleton from './explore/ExploreCarouselSkeleton';
import ExploreSectionedList from './explore/ExploreSectionedList';
import ExploreGridList from './explore/ExploreGridList';
import ExploreMapView from './explore/ExploreMapView';

import { Search } from 'lucide-react';

// ─── Main Export ──────────────────────────────────────────────────────────────
/**
 * ExploreContent
 *
 * Single responsibility: rendering the correct view state based on props.
 * No data fetching. No hooks. No business logic.
 *
 * Views (in priority order):
 *   loading | error | empty | map | sectioned-list | flat-grid
 */
const ExploreContent = ({
    vacancies,
    sections,
    loading,
    isRefreshing,
    error,
    viewMode,
    mapProps,
    radius,
    setRadius,
    userLocation,
    setExplorationCenter,
    selectedVacancy,
    onClearSelection,
    onApply,
    onOpenDetail,
    isApplying,
    appliedIds,
    setActiveCategory,
    clearFilters,
    setSearchQuery,
    onCompanyClick,
    hasMore,
    loadMore
}) => {
    const sharedCardProps = { onApply, onOpenDetail, onCompanyClick, isApplying, appliedIds };

    return (
        <div className="flex-1 max-w-7xl mx-auto w-full px-3 md:px-6 relative">

            {/* Background refresh indicator */}
            <AnimatePresence>
                {isRefreshing && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute top-0 right-6 z-[100] flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-transparent shadow-lg"
                        role="status"
                        aria-live="polite"
                        aria-label="Actualizando vacantes"
                    >
                        <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" aria-hidden="true" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Actualizando...</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {loading && vacancies.length === 0 ? (
                    <ExploreCarouselSkeleton />
                ) : error ? (
                    <ErrorView message={error} />
                ) : vacancies.length === 0 ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full py-12 flex justify-center">
                        <RadarEmptyState />
                    </motion.div>
                ) : viewMode === 'map' ? (
                    <ExploreMapView
                        mapProps={mapProps} radius={radius} setRadius={setRadius}
                        userLocation={userLocation} setExplorationCenter={setExplorationCenter}
                        selectedVacancy={selectedVacancy} onClearSelection={onClearSelection}
                        {...sharedCardProps}
                    />
                ) : sections ? (
                    <ExploreSectionedList sections={sections} setActiveCategory={setActiveCategory} {...sharedCardProps} />
                ) : (
                    <ExploreGridList 
                        vacancies={vacancies} 
                        {...sharedCardProps} 
                        hasMore={hasMore} 
                        loadMore={loadMore}
                        loading={loading}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExploreContent;
