import React from 'react';
import { m as motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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

const ExploreGridList = ({ vacancies, onApply, onOpenDetail, onCompanyClick, isApplying, appliedIds, hasMore, loadMore, loading }) => (
    <motion.div
        key="list"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
        <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-8 pt-6"
            role="list"
            aria-label="Lista de vacantes"
        >
            {vacancies.map(vacancy => (
                <div key={vacancy.id} role="listitem">
                    <VacancyCard
                        vacancy={vacancy}
                        onApply={onApply}
                        onOpenDetail={onOpenDetail}
                        onCompanyClick={onCompanyClick}
                        isApplying={isApplying === vacancy.id}
                        isApplied={appliedIds.has(vacancy.id)}
                    />
                </div>
            ))}
        </div>
        
        <LoadMoreButton 
            onClick={loadMore} 
            loading={loading} 
            hasMore={hasMore} 
        />
    </motion.div>
);

export default ExploreGridList;
