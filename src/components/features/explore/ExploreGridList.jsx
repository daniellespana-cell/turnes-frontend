import React, { useState, useEffect, useRef } from 'react';
import { m as motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import VacancyCard from '../VacancyCard';
import Spinner from '../../ui/Spinner';


const LoadMoreButton = ({ onClick, loading, hasMore }) => {
    if (!hasMore) return null;
    return (
        <div className="flex justify-center pt-4 pb-12">
            <button
                onClick={onClick}
                disabled={loading}
                className="group relative px-8 py-3 bg-zinc-900 border border-transparent rounded-2xl overflow-hidden hover:border-brand-primary/30 transition-all duration-300 disabled:opacity-50"
                type="button"
                aria-label="Acción">
                <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-brand-primary transition-colors flex items-center gap-2">
                    {loading ? (
                        <>
                            <Spinner size="sm" variant="emerald" />
                            Cargando...
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

const getColumnCount = () => {
    if (typeof window === 'undefined') return 1;
    if (window.innerWidth >= 1280) return 4;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
};

const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
};

const ExploreGridList = ({ vacancies, onApply, onOpenDetail, onCompanyClick, isApplying, appliedIds, hasMore, loadMore, loading }) => {
    const [columns, setColumns] = useState(getColumnCount());

    useEffect(() => {
        const handleResize = () => setColumns(getColumnCount());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const rows = chunkArray(vacancies, columns);
    const listRef = useRef(null);

    const rowVirtualizer = useWindowVirtualizer({
        count: rows.length,
        estimateSize: () => 320, // Estimated height of a vacancy card row
        overscan: 3,
        scrollMargin: listRef.current?.offsetTop ?? 0,
    });

    return (
        <motion.div
            key="list"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            ref={listRef}
        >
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
                className="pb-8 pt-6"
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const rowVacancies = rows[virtualRow.index];
                    return (
                        <ul
                            key={virtualRow.index}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                        >
                            {rowVacancies.map(vacancy => (
                                <li key={vacancy.id}>
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
                    );
                })}
            </div>
            
            <LoadMoreButton
                onClick={loadMore}
                loading={loading}
                hasMore={hasMore}
            />
        </motion.div>
    );
};

export default ExploreGridList;
