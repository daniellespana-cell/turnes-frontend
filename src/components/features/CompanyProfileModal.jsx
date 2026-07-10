import React from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { X, Building2, ShieldCheck } from 'lucide-react';
import Spinner from '../ui/Spinner';
import ProfileView from '../profile/ProfileView';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { authService } from '../../services/authService';
import { ReputationService } from '../../services/reputationService';

/**
 * CompanyProfileModal - Versión 2.0 (Reconstrucción Total)
 * 
 * Un modal de alta gama diseñado para auditoría de empresas.
 * Utiliza React Portals para garantizar que siempre esté por encima de cualquier UI.
 */
const CompanyProfileModal = ({ isOpen, onClose, companyId }) => {
    const [profile, setProfile] = useState(null);
    const [companyData, setCompanyData] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Bloqueo de scroll en el body
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // Carga de datos con resolución de ID polimórfica
    useEffect(() => {
        if (!isOpen || !companyId) return;
        if (companyId === 'undefined' || companyId === 'null') {
            setError("Identidad de empresa no localizada (ID corrupto).");
            return;
        }

        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                let profileObj = null;
                let companyObj = null;
                let targetProfileId = companyId;

                // 1. Intento inicial de resolución (ID directo de perfil o empresa vinculada)
                const res = await authService.getProfile(companyId);
                
                if (res) {
                    profileObj = res.profile || res;
                    companyObj = res.empresa || profileObj?.empresas?.[0];
                    targetProfileId = profileObj?.id || companyId;
                }

                // 2. Fallback si no hay objeto de empresa (resolución vía tabla empresas)
                if (!companyObj) {
                    const { data: empData } = await authService.getCompanyById(companyId);
                    if (empData) {
                        companyObj = empData;
                        targetProfileId = empData.perfil_id || empData.user_id;
                        const profileRes = await authService.getProfile(targetProfileId);
                        profileObj = profileRes?.profile || profileRes;
                    }
                }

                if (!profileObj) throw new Error("Identidad de empresa no localizada.");

                // 3. Carga de reputación ( reseñas de los últimos 10 turnos)
                const revRes = await ReputationService.getRecentReviews(targetProfileId, 10);
                
                setProfile(profileObj);
                setCompanyData(companyObj);
                setReviews(revRes.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [isOpen, companyId]);

    // Si no hay body o no está abierto, no renderizamos nada fuera del portal
    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0" style={{ zIndex: 1000000 }}>
                    {/* Fondo oscuro con desenfoque */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
                        style={{ zIndex: 1000000 }}
                    />

                    {/* Panel del Perfil (Slide desde la derecha) */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-[#09090b] border-l border-white/10 shadow-[-20px_0_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
                        style={{ zIndex: 1000001 }}
                    >
                        {/* Cabecera de Auditoría */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h2 className="text-white font-black uppercase tracking-tighter text-sm">Auditoría Corporativa</h2>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Perfil Verificado por Turnes</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all"
                                type="button"
                                aria-label="Acción">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Contenido Scrolleable */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4">
                                    <Spinner size="lg" variant="emerald" />
                                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Sincronizando KPIs...</p>
                                </div>
                            ) : error ? (
                                <div className="p-12 text-center">
                                    <div className="inline-flex p-4 bg-red-500/10 text-red-500 rounded-full mb-4">
                                        <Building2 size={32} />
                                    </div>
                                    <p className="text-white font-bold">{error}</p>
                                    <button
                                        onClick={onClose}
                                        className="mt-4 text-emerald-500 text-xs font-bold uppercase"
                                        type="button"
                                        aria-label="Acción">Cerrar</button>
                                </div>
                            ) : profile && (
                                <div className="animate-in fade-in duration-500">
                                    {/* ProfileView Polimórfico - El corazón del perfil */}
                                    <ProfileView 
                                        profile={profile}
                                        companyData={companyData}
                                        reviews={reviews}
                                        isPublicView={true}
                                    />
                                </div>
                            )}
                        </div>


                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default CompanyProfileModal;
