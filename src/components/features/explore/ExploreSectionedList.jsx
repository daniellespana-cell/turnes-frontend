import React from 'react';
import { m as motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import VacancyCard from '../VacancyCard';


const ExploreSectionedList = ({ sections, setActiveCategory, onApply, onOpenDetail, onCompanyClick, isApplying, appliedIds }) => (
    <motion.div
        key="sectioned"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="space-y-10 md:space-y-14 pb-12"
    >
        {sections.map(section => (
            <section key={section.id} className="relative" aria-labelledby={`section-${section.id}`}>
                <div className="flex items-end justify-between mb-4 md:mb-6 px-1">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-5 md:h-6 bg-brand-primary rounded-full shadow-[0_0_12px_rgba(20,184,166,0.5)]" aria-hidden="true" />
                        <h2 id={`section-${section.id}`} className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            {section.label}
                            <span className="text-[9px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full font-black" aria-label={`${section.vacancies.length} vacantes`}>
                                {section.vacancies.length}
                            </span>
                        </h2>
                    </div>
                    <button
                        onClick={() => setActiveCategory(section.id)}
                        aria-label={`Ver todas las vacantes de ${section.label}`}
                        className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-brand-primary transition-colors flex items-center gap-1.5 group"
                        type="button">
                        Ver todo <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </button>
                </div>

                <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 pt-6 px-1 no-scrollbar scroll-smooth snap-x" role="list" aria-label={`Vacantes de ${section.label}`}>
                    {section.vacancies.map(vacancy => (
                        <div key={vacancy.id} className="w-[280px] md:w-[320px] shrink-0 snap-start" role="listitem">
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
            </section>
        ))}
    </motion.div>
);

export default ExploreSectionedList;
