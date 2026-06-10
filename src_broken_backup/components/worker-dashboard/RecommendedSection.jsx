import { useNavigate } from 'react-router-dom';
import { typography } from '../../styles/typography';

/**
 * RecommendedSection — Atomic Component
 * Responsabilidad: Renderizar el feed de recomendaciones con scroll horizontal y navegación profunda.
 */
const RecommendedSection = ({ priorityAction, appliedIds }) => {
    const navigate = useNavigate();

    const handleExplore = (vacancy) => {
        if (!vacancy?.id) return;
        navigate('/dashboard/explorar', { 
            state: { selectedVacancyId: vacancy.id } 
        });
    };

    if (priorityAction?.type === 'SHIFT_TODAY') return null; // Handled by separate Mission widget

    const hasData = priorityAction?.data?.length > 0;

    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className={typography.sectionTitle}>
                    Recomendado para ti
                </h2>
                {hasData && (
                    <button
                        onClick={() => navigate('/dashboard/explorar')}
                        className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest hover:text-emerald-300 flex items-center gap-1"
                    >
                        Ver Todo <ChevronRight size={12} />
                    </button>
                )}
            </div>

            {hasData ? (
                <div className="flex overflow-x-auto pb-4 gap-4 md:grid md:grid-cols-3 md:overflow-visible custom-scrollbar snap-x px-1">
                    {priorityAction.data.map((vacancy) => (
                        <div key={vacancy.id} className="snap-center shrink-0 w-[85%] md:w-auto">
                            <VacancyCard 
                                vacancy={vacancy} 
                                variant="compact"
                                onOpenDetail={() => handleExplore(vacancy)}
                                isApplied={appliedIds?.has(vacancy.id)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-zinc-900/20 rounded-3xl ring-1 ring-white/5">
                    <MapPinOff size={28} className="text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 text-sm font-medium">No hay vacantes cerca de ti ahora</p>
                    <button
                        onClick={() => navigate('/dashboard/explorar')}
                        className="mt-4 text-emerald-400 text-[11px] font-bold uppercase tracking-widest hover:text-emerald-300"
                    >
                        Explorar todas las vacantes →
                    </button>
                </div>
            )}
        </section>
    );
};

export default RecommendedSection;
