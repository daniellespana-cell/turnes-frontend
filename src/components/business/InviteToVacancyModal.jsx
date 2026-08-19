import React from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import Spinner from '../ui/Spinner';
import InviteToVacancyHeader from './invite-to-vacancy/InviteToVacancyHeader';
import VacancySelector from './invite-to-vacancy/VacancySelector';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VacancyService } from '../../services/vacancyService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Sub-components (Atomic Composition)

/**
 * 📨 InviteToVacancyModal (Senior Orchestrator)
 * Refactored using Atomic Composition.
 * Handles: Vacancy fetching, Invitation logic, and selection state.
 */
const InviteToVacancyModal = ({ isOpen, onClose, candidate }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [vacancies, setVacancies] = useState([]);
    const [selectedVacancyId, setSelectedVacancyId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);

    // 1. Logic: Sync Active Vacancies
    useEffect(() => {
        if (!isOpen || !user?.id) return;
        
        const fetchVacancies = async () => {
            setLoading(true);
            try {
                // 🛠️ FIX: El método correcto es getMyVacancies
                const { data, error } = await VacancyService.getMyVacancies(user.id);
                if (error) throw error;
                
                // Filtramos solo las vacantes activas para invitar
                const activeVacancies = (data || []).filter(v => v.status === 'activa');
                setVacancies(activeVacancies);
            } catch (err) {
                console.error("[InviteToVacancyModal] Error:", err);
                showToast("Error al cargar vacantes", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchVacancies();
    }, [isOpen, user?.id, showToast]);

    const handleInvite = async () => {
        if (!selectedVacancyId) return;
        
        setIsInviting(true);
        try {
            const { error } = await VacancyService.inviteCandidate(
                selectedVacancyId, 
                candidate.id
            );
            if (error) throw error;

            showToast(`¡Invitación enviada a ${candidate.nombre_display}!`, "success");
            onClose();
        } catch (err) {
            console.error("[InviteToVacancyModal] Invite Error:", err);
            showToast("No pudimos enviar la invitación", "error");
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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

                    {/* Modal Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                    >
                        <InviteToVacancyHeader 
                            candidateName={candidate?.nombre_display} 
                            onClose={onClose} 
                        />

                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <Spinner size="md" variant="emerald" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Buscando tus vacantes...</span>
                            </div>
                        ) : vacancies.length === 0 ? (
                            <div className="py-10 text-center space-y-4">
                                <p className="text-zinc-500 text-xs font-medium">No tienes vacantes activas para invitar.</p>
                                <button
                                    onClick={() => navigate('/dashboard/vacantes/nueva')}
                                    className="px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest"
                                    type="button"
                                    aria-label="Acción">
                                    Crear Primera Vacante
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <VacancySelector 
                                    vacancies={vacancies} 
                                    selectedId={selectedVacancyId} 
                                    onSelect={setSelectedVacancyId}
                                    onCreateNew={() => navigate('/dashboard/vacantes/nueva')}
                                />

                                <button
                                    onClick={handleInvite}
                                    disabled={isInviting || !selectedVacancyId}
                                    className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[11px] tracking-[0.2em] transition-all
                                        ${selectedVacancyId 
                                            ? 'bg-emerald-500 text-white hover:bg-emerald-400 active:scale-95 shadow-xl shadow-emerald-500/10' 
                                            : 'bg-zinc-900 text-zinc-700 cursor-not-allowed'}
                                    `}
                                    type="button"
                                    aria-label="Acción">
                                    {isInviting ? (
                                        <Spinner size="sm" variant="white" />
                                    ) : (
                                        <>
                                            Enviar Invitación <Send size={14} />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default InviteToVacancyModal;
