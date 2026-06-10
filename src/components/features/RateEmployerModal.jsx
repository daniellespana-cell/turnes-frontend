import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import RatingHeader from './rate-employer/RatingHeader';
import RatingStars from './rate-employer/RatingStars';
import RatingFooter from './rate-employer/RatingFooter';

import { useState } from 'react';
import { CandidateService } from '../../services/candidateService';
import { useToast } from '../../context/ToastContext';

// Sub-components (Composition Pattern)

/**
 * 🌟 RateEmployerModal (Senior Orchestrator)
 * Refactored using Atomic Composition to improve maintainability and readability.
 * Main Responsibilities: State management and Business Logic.
 */
const RateEmployerModal = ({ isOpen, onClose, application, onRatingSuccess }) => {
    const { showToast } = useToast();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!application) return null;

    // Data Normalization (Locality)
    const displayName = application.role || "Turno Completado";
    const companyName = application.company || "Empresa Turnes";
    const companyId   = application.companyId || application.vacante?.empresa_id;

    const handleSubmit = async () => {
        if (rating === 0) return;

        setIsSubmitting(true);
        try {
            const { error } = await CandidateService.rateEmployer(application.id, companyId, rating, comment);
            if (error) throw error;

            showToast("¡Evaluación enviada con éxito!", "success");
            onRatingSuccess?.();
            onClose();
        } catch (error) {
            console.error("[RateEmployerModal] Error:", error);
            showToast("Error al procesar la calificación", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={!isSubmitting ? onClose : undefined}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                    />

                    {/* Modal Panel Orchestrator */}
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="relative w-full max-w-md bg-[#0a0a0c] border-t md:border border-white/10 rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl p-6 md:p-8"
                    >
                        {/* 1. Mobile Drag Indicator */}
                        <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-6 md:hidden" />

                        <div className="space-y-6">
                            {/* 2. Header (Info & Close) */}
                            <RatingHeader 
                                companyName={companyName} 
                                displayName={displayName} 
                                onClose={onClose} 
                                isSubmitting={isSubmitting} 
                            />

                            {/* 3. Interaction Area (Stars) */}
                            <RatingStars rating={rating} onChange={setRating} />

                            {/* 4. Feedback Field */}
                            <div className="relative group">
                                <div className="absolute left-4 top-4 text-zinc-600 group-focus-within:text-amber-500 transition-colors">
                                    <MessageSquare size={14} />
                                </div>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Comentario opcional..."
                                    className="w-full h-24 bg-white/[0.02] border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-[13px] text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/20 transition-all resize-none"
                                />
                            </div>

                            {/* 5. Footer (Safety & Actions) */}
                            <RatingFooter 
                                rating={rating} 
                                isSubmitting={isSubmitting} 
                                onSubmit={handleSubmit} 
                                onOmit={onClose} 
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default RateEmployerModal;
