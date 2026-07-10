import { m as motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/ui/Spinner';
import ReputationHero from '../../components/features/reputation/ReputationHero';
import ReceivedReviewsList from '../../components/features/reputation/ReceivedReviewsList';

import { Star } from 'lucide-react';
import { useBusinessRatings } from '../../hooks/useBusinessRatings';
import { typography } from '../../styles/typography';

// Shared Sub-components

const BusinessRatings = () => {
    const {
        user,
        receivedRatings,
        loading,
        hasMore,
        loadMoreRatings
    } = useBusinessRatings();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Spinner size="lg" variant="emerald" text="Cargando reputación..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen text-zinc-100 font-manrope selection:bg-brand-primary/30">
            <PageHeader
                icon={Star}
                title="Mis"
                highlight="Calificaciones"
                subtitle="Gestiona tu reputación empresarial en Turnes."
            />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
                {/* 🌟 Reputación Global */}
                <ReputationHero
                    rating={user?.calificacion || user?.rating || 5.0}
                    reviewsCount={receivedRatings.length}
                    pendingCount={0} 
                    user={user}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* 💬 Historial de reseñas recibidas */}
                    <section className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquare size={16} className="text-zinc-500" />
                                <h2 className={typography.sectionTitle}>Lo que dicen los candidatos</h2>
                            </div>
                            <span className="bg-brand-primary/10 text-brand-primary text-[10px] px-2 py-0.5 rounded-full border border-brand-primary/20">
                                Top 10
                            </span>
                        </div>
                        
                        <div className="space-y-6">
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
                                        type="button"
                                        aria-label="Acción">
                                        <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-white text-center">Ver más reseñas de candidatos</span>
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </section>

                    {/* ✍️ Nota Informativa */}
                    <aside className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center space-y-4">
                            <Star size={24} className="mx-auto text-amber-500" />
                            <div>
                                <h3 className="text-white font-bold text-sm mb-1">Red de Confianza</h3>
                                <p className="text-xs text-zinc-400">
                                    Califica y sella tus turnos con los candidatos directamente desde la sección de Candidatos.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default BusinessRatings;
