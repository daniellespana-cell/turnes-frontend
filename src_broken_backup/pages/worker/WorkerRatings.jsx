import { Star } from 'lucide-react';
import { useWorkerRatings } from '../../hooks/useWorkerRatings';
import { typography } from '../../styles/typography';

// Sub-components

const WorkerRatings = () => {
    const {
        user,
        receivedRatings,
        pendingRatings,
        ratingApp,
        setRatingApp,
        loading,
        handleRatingSuccess,
        handleDismissRating,
        hasMore,
        loadMoreRatings,
    } = useWorkerRatings();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Spinner size="lg" variant="emerald" text="Cargando reputación..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100 font-manrope selection:bg-brand-primary/30">
            <PageHeader
                icon={Star}
                title="Mis"
                highlight="Calificaciones"
                subtitle="Gestiona tu reputación y califica tus experiencias en Turnes."
            />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

                {/* 🌟 Reputación Global (Single Source of Truth) */}
                <ReputationHero
                    rating={user?.calificacion || 5.0}
                    reviewsCount={receivedRatings.length}
                    pendingCount={pendingRatings.length}
                    user={user}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* 💬 Historial de reseñas recibidas */}
                    <section className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageSquare size={16} className="text-zinc-500" />
                            <h2 className={typography.sectionTitle}>Lo que dicen las empresas</h2>
                        </div>
                        <ReceivedReviewsList reviews={receivedRatings} loading={false} />
                        
                        {hasMore && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="flex justify-center pt-8"
                            >
                                <button
                                    onClick={loadMoreRatings}
                                    className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 px-6 py-3 rounded-2xl transition-all active:scale-95"
                                >
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Cargar más reseñas</span>
                                </button>
                            </motion.div>
                        )}
                    </section>

                    {/* ✍️ Pendientes por calificar */}
                    <aside className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock size={16} className="text-zinc-500" />
                            <h2 className={typography.sectionTitle}>Por Calificar</h2>
                        </div>
                        <PendingRatingsList 
                            pendingRatings={pendingRatings} 
                            onRate={setRatingApp} 
                            onDismiss={handleDismissRating}
                        />
                    </aside>
                </div>
            </main>

            <RateEmployerModal
                isOpen={!!ratingApp}
                onClose={() => setRatingApp(null)}
                application={ratingApp}
                onRatingSuccess={handleRatingSuccess}
            />
        </div>
    );
};

export default WorkerRatings;
