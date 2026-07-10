import React from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import VacancyDetailHeader from './vacancy-detail/VacancyDetailHeader';
import VacancyDetailBadges from './vacancy-detail/VacancyDetailBadges';
import VacancyDetailInfoGrid from './vacancy-detail/VacancyDetailInfoGrid';
import VacancyDetailFooter from './vacancy-detail/VacancyDetailFooter';

import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../hooks/ui/useFocusTrap';

// Sub-componentes

const SectionLabel = ({ children }) => (
    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">{children}</p>
);

/**
 * VacancyDetailSheet (Coordinator Component)
 *
 * Responsibilities:
 *  - Handle Portal injection
 *  - Orchestrate Framer Motion animations
 *  - Compose specialized sub-components
 */
const VacancyDetailSheet = ({ vacancy, isOpen, onClose, onApply, onCompanyClick, isApplying, isApplied }) => {
    const sheetRef    = useRef(null);
    const closeBtnRef = useRef(null);

    // Lógica A11y (Focus Trap)
    useFocusTrap(isOpen, sheetRef, closeBtnRef, onClose);

    if (!vacancy) return null;

    const content = (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="sheet-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                        aria-hidden="true"
                        role="button"
                        tabIndex={0}
                        onKeyDown={onClose} />

                    {/* Wrapper Flex para centrado perfecto */}
                    <div className="fixed inset-0 z-[9999] flex justify-center items-end md:items-center pointer-events-none sm:p-4">
                        {/* Sheet / Modal */}
                        <motion.div
                            key="sheet-panel"
                            ref={sheetRef}
                            role="dialog"
                            aria-modal="true"
                            aria-label={`Detalle: ${vacancy.title}`}
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="pointer-events-auto relative w-full max-h-[85dvh] overflow-y-auto
                                bg-[#0f0f11] border-t md:border border-white/8 rounded-t-[1.5rem] shadow-[0_-20px_40px_rgba(0,0,0,0.6)]
                                md:max-h-[80dvh] md:max-w-[420px] md:rounded-[1.5rem]"
                        >
                            {/* Drag handle (mobile only) */}
                            <div className="flex justify-center pt-3 pb-1 md:hidden">
                                <div className="w-10 h-1 bg-zinc-700 rounded-full" />
                            </div>

                            {/* Header */}
                            <VacancyDetailHeader 
                                vacancy={vacancy} 
                                closeBtnRef={closeBtnRef} 
                                onClose={onClose} 
                                onCompanyClick={onCompanyClick}
                            />

                            {/* Body */}
                            <div className="px-4 py-4 space-y-4">
                                <VacancyDetailBadges vacancy={vacancy} />
                                <VacancyDetailInfoGrid vacancy={vacancy} />

                                {/* Description */}
                                {vacancy.description && (
                                    <div>
                                        <SectionLabel>Descripción del Puesto</SectionLabel>
                                        <p className="text-[13px] text-zinc-400 leading-relaxed">
                                            {vacancy.description}
                                        </p>
                                    </div>
                                )}

                                {/* Tags */}
                                {vacancy.tags?.length > 0 && (
                                    <div>
                                        <SectionLabel>Etiquetas</SectionLabel>
                                        <div className="flex flex-wrap gap-2">
                                            {vacancy.tags.map(tag => (
                                                <span key={tag}
                                                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-zinc-800/60 text-zinc-400 border border-white/6">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Fallback notice */}
                                {vacancy.isFallback && (
                                    <div className="flex items-start gap-2.5 bg-blue-500/5 border border-blue-500/15 rounded-2xl p-3.5">
                                        <AlertCircle size={14} className="text-blue-400 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-blue-300 leading-relaxed">
                                            Esta vacante es una recomendación general. Puede estar fuera de tu radio de búsqueda.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer CTA */}
                            <VacancyDetailFooter 
                                vacancy={vacancy} 
                                onApply={onApply} 
                                isApplying={isApplying} 
                                isApplied={isApplied} 
                            />
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );

    if (typeof document !== 'undefined') {
        return createPortal(content, document.body);
    }
    return content;
};

export default VacancyDetailSheet;
