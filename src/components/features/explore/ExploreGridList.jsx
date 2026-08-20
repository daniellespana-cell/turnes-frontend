import React, { useRef, useCallback, useEffect } from 'react';
import { m as motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import VacancyCard from '../VacancyCard';

const LoadMoreButton = ({ onClick, loading, hasMore }) => {
    if (!hasMore) return null;
    return (
        <div className="flex justify-center pt-6 pb-12">
            <button
                onClick={onClick}
                disabled={loading}
                className="group relative px-8 py-3 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:border-brand-primary/30 transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-lg"
                type="button"
                aria-label="Cargar más vacantes"
            >
                <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-brand-primary transition-colors flex items-center gap-2">
                    {loading ? (
                        <>
                            <Loader2 size={15} className="animate-spin text-emerald-400" />
                            Cargando vacantes...
                        </>
                    ) : (
                        <>
                            Cargar más vacantes
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </span>
            </button>
        </div>
    );
};

/**
 * ExploreGridList (CSS Grid Nativo + Infinite Scroll Sentinel)
 * Elimina completamente los solapamientos y problemas de altura en móviles y escritorio.
 */
const ExploreGridList = ({ vacancies, onApply, onOpenDetail, onCompanyClick, isApplying, appliedIds, hasMore, loadMore, loading }) => {
    const observerRef = useRef(null);

    // Sentinel para infinite scrolling suave sin desincronización
    const sentinelRef = useCallback((node) => {
        if (loading) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore?.();
            }
        }, { rootMargin: '300px' });

        if (node) observerRef.current.observe(node);
    }, [hasMore, loading, loadMore]);

    useEffect(() => {
        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, []);

    return (
        <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-w-0"
        >
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 pb-8 pt-4 w-full">
                {vacancies.map(vacancy => (
                    <li key={vacancy.id} className="w-full min-w-0 flex">
                        <VacancyCard
                            vacancy={vacancy}
                            onApply={onApply}
                            onOpenDetail={onOpenDetail}
                            onCompanyClick={onCompanyClick}
                            isApplying={isApplying === vacancy.id}
                            isApplied={appliedIds.has(vacancy.id)}
                        />
                    </li>
                ))}
            </ul>

            {/* Sentinel de scroll */}
            <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />
            
            {/* Botón de Paginación */}
            <LoadMoreButton
                onClick={loadMore}
                loading={loading}
                hasMore={hasMore}
            />
        </motion.div>
    );
};

export default ExploreGridList;
