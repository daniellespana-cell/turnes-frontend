import React from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import TalentProfileHeader from './talent-profile/TalentProfileHeader';
import TalentProfileContent from './talent-profile/TalentProfileContent';
import TalentProfileFooter from './talent-profile/TalentProfileFooter';

import { useEffect, useState } from 'react';
import { talentService } from '../../services/talentService';
import { ReputationService } from '../../services/reputationService';

// Sub-components (Atomic Composition)

/**
 * 🪟 TalentProfileModal (Senior Orchestrator)
 * Refactored using the Orchestrator Pattern to eliminate spaghetti code and 
 * improve SOC (Separation of Concerns).
 */
const TalentProfileModal = ({
    isOpen,
    onClose,
    candidateId,
    onInviteClick,
    showInviteButton = true
}) => {
    const [profile, setProfile] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // 1. Logic: Data Sync
    useEffect(() => {
        if (!isOpen || !candidateId) return;

        const fetchFullData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // 🛡️ UNIFICACIÓN DE LA VERDAD (Fidelidad Absoluta a la DB)
                const [profileData, revRes] = await Promise.all([
                    talentService.getDetailedProfile(candidateId),
                    ReputationService.getRecentReviews(candidateId, 5)
                ]);
                
                if (!profileData) throw new Error("Perfil no encontrado.");
                
                setProfile(profileData);
                setReviews(revRes.data || []);
            } catch (err) {
                console.error("[TalentProfileModal] Sync Error:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFullData();
    }, [isOpen, candidateId]);

    // 2. Logic: UX Control (Scroll Lock & A11y)
    useEffect(() => {
        if (!isOpen) return;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        role="button"
                        tabIndex={0}
                        onKeyDown={onClose} />

                    {/* Modal Panel Orchestrator */}
                    <motion.div
                        role="dialog" aria-modal="true"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="relative w-full md:w-[500px] h-full bg-[#0a0a0a] border-l border-white/10 flex flex-col shadow-2xl"
                    >
                        {/* 1. Header Section */}
                        <TalentProfileHeader onClose={onClose} />

                        {/* 2. Content Section (Stateful) */}
                        <div className="flex-1 overflow-y-auto pb-10 scrollbar-hide">
                            <TalentProfileContent
                                isLoading={isLoading}
                                error={error}
                                profile={profile}
                                reviews={reviews}
                            />
                        </div>

                        {/* 3. Actions Section (Footer) */}
                        {showInviteButton && (
                            <TalentProfileFooter
                                profile={profile}
                                onInviteClick={onInviteClick}
                                disabled={isLoading || !!error}
                            />
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TalentProfileModal;
