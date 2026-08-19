import { AlertCircle } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import EmptyState from '../../components/common/EmptyState';
import RateEmployerModal from '../../components/features/RateEmployerModal';
import PageHeader from '../../components/common/PageHeader';
import WorkerApplicationCard from '../../components/applications/WorkerApplicationCard';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { useWorkerApplications } from '../../hooks/useWorkerApplications';

const WorkerApplications = () => {
    const navigate = useNavigate();
    const { 
        applications, loading, isRefreshing, error, refetch, 
        hasMore, loadMore, activeTab, setActiveTab, cancelApplication 
    } = useWorkerApplications();
    const [ratingApp, setRatingApp] = React.useState(null);
    const { showToast } = useToast();
    const [cancelModal, setCancelModal] = React.useState({ isOpen: false, appId: null });
    const [isCancelling, setIsCancelling] = React.useState(false);

    const handleConfirmCancel = async () => {
        if (!cancelModal.appId) return;
        setIsCancelling(true);
        const { success } = await cancelApplication(cancelModal.appId);
        setIsCancelling(false);
        setCancelModal({ isOpen: false, appId: null });

        if (success) {
            showToast("Postulación retirada con éxito", "success");
        } else {
            showToast("Hubo un error al retirar la postulación", "error");
        }
    };

    return (
        <div className="min-h-screen pb-20 text-zinc-100 flex flex-col font-manrope selection:bg-brand-primary/30">
            {/* ─── Universal Page Header ─────────────────────────────────────────────────── */}
            <PageHeader
                icon={Briefcase}
                title="Mis"
                highlight="Procesos"
                subtitle="Centro de Oportunidades"
                extraContent={
                    <div className="hidden md:flex bg-zinc-900/50 border border-transparent p-1 rounded-2xl">
                        <button
                            onClick={() => setActiveTab('activas')}
                            className={`px-5 py-2 min-w-[100px] text-center text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                                activeTab === 'activas'
                                    ? 'bg-zinc-800 text-white shadow-sm'
                                    : 'text-zinc-500 hover:text-white'
                            }`}
                            type="button"
                            aria-label="Acción">
                            Activas
                        </button>
                        <button
                            onClick={() => setActiveTab('pasadas')}
                            className={`px-5 py-2 min-w-[100px] text-center text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                                activeTab === 'pasadas'
                                    ? 'bg-zinc-800 text-white shadow-sm'
                                    : 'text-zinc-500 hover:text-white'
                            }`}
                            type="button"
                            aria-label="Acción">
                            Histórico
                        </button>
                    </div>
                }
            />
            {/* ─── Main Content ───────────────────────────────────────────── */}
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-8 py-10">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-zinc-900/40 rounded-[2rem] border border-transparent animate-pulse" />
                            ))}
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20 text-center px-6"
                        >
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                                <AlertCircle size={32} className="text-red-500/50" />
                            </div>
                            <h3 className="text-white font-black mb-2 uppercase tracking-tighter text-xl">Error de Sincronización</h3>
                            <p className="text-zinc-500 text-sm mb-8 max-w-[280px]">No pudimos recuperar tus postulaciones. Verifica tu conexión a internet.</p>
                            <button
                                onClick={refetch}
                                className="px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95  shadow-white/5"
                                type="button"
                                aria-label="Acción">
                                Reintentar Conexión
                            </button>
                        </motion.div>
                    ) : applications.length > 0 ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            {applications.map((app) => (
                                <WorkerApplicationCard
                                    key={app.id}
                                    app={app}
                                    onChat={() => navigate(`/dashboard/chats`)}
                                    onRate={(appData) => setRatingApp(appData)}
                                    onCancel={(appId) => setCancelModal({ isOpen: true, appId })}
                                    isRefreshing={isRefreshing}
                                />
                            ))}

                            {hasMore && (
                                <div className="flex justify-center pt-10">
                                    <button
                                        onClick={loadMore}
                                        disabled={isRefreshing}
                                        className="px-12 py-5 bg-zinc-900 border border-transparent rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-50"
                                        type="button"
                                        aria-label="Acción">
                                        {isRefreshing ? "Cargando..." : "Cargar más postulaciones"}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="py-20"
                        >
                            <EmptyState
                                icon={Briefcase}
                                title="Sin procesos activos"
                                description="Aún no tienes postulaciones registradas en la plataforma."
                                actionLabel="Explorar Vacantes"
                                onAction={() => navigate('/dashboard/explorar')}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
            {/* Modal de Calificación */}
            <RateEmployerModal
                isOpen={!!ratingApp}
                onClose={() => setRatingApp(null)}
                application={ratingApp}
                onRatingSuccess={() => {
                    refetch();
                }}
            />
            {/* Modal de Confirmación para Cancelar */}
            <ConfirmationModal
                isOpen={cancelModal.isOpen}
                onClose={() => !isCancelling && setCancelModal({ isOpen: false, appId: null })}
                onConfirm={handleConfirmCancel}
                title="¿Retirar postulación?"
                message="Si te retiras de este proceso, la empresa ya no podrá contactarte y perderás tu lugar. Esta acción no se puede deshacer."
                confirmText={isCancelling ? "Retirando..." : "Sí, retirar"}
                type="delete"
                isLoading={isCancelling}
            />
        </div>
    );
};

export default WorkerApplications;

