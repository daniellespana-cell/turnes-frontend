import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShiftCardHeader } from './card/ShiftCardHeader';
import { ShiftCardBody } from './card/ShiftCardBody';
import { ShiftCardActions } from './card/ShiftCardActions';

/**
 * 🧠 ShiftCard Orchestrator
 * Composes the atomic parts of the card.
 * Handles:
 * - Expansion State
 * - Status Color Logic
 * - Animation Coordination
 */
const ShiftCard = ({ shift, onDelete, onChat }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // TODO: Extract this to a centralized status utility if reused elsewhere
    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'text-emerald-400';
            case 'pending': return 'text-amber-400';
            case 'completed': return 'text-zinc-500 line-through decoration-zinc-700';
            case 'cancelled': return 'text-red-400';
            default: return 'text-white';
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                mb-3 rounded-xl overflow-hidden border transition-all duration-300 relative select-none
                ${isExpanded
                    ? 'bg-zinc-800/90 border-zinc-600 shadow-xl shadow-black/50 z-10'
                    : 'bg-zinc-900/40 border-white/5 hover:bg-zinc-900/60 hover:border-white/10'
                }
            `}
        >
            {/* COMPONENT 1: HEADER (Always Visible) */}
            <ShiftCardHeader
                shift={shift}
                isExpanded={isExpanded}
                onToggle={() => setIsExpanded(!isExpanded)}
                getStatusColor={getStatusColor}
            />

            {/* COMPONENT 2: EXPANDABLE CONTENT (Body + Actions) */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-black/20"
                    >
                        <div className="px-4 pb-4 pt-1 space-y-4">

                            {/* Divider */}
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-3" />

                            {/* Details Body */}
                            <ShiftCardBody shift={shift} />

                            {/* Action Buttons */}
                            <ShiftCardActions shift={shift} onDelete={onDelete} />

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ShiftCard;