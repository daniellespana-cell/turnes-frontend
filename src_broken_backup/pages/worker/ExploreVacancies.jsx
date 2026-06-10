import { useState, useMemo, useCallback, useEffect } from 'react';
import { MapPinOff, Info } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useExploreVacancies } from '../../hooks/useExploreVacancies';
import { useVacancyMap } from '../../hooks/useVacancyMap';
import { useToast } from '../../context/ToastContext';
import { VacancyService } from '../../services/vacancyService';

// ─── Info Banner ──────────────────────────────────────────────────────────────
const InfoBanner = ({ show, icon: Icon, color, children }) => (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden px-3 md:px-6 mb-2"
            >
                <div className={`flex items-center gap-3 border rounded-xl px-4 py-2.5 ${color}`}>
                    <Icon size={14} className="shrink-0" />
                    {children}
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const ExploreVacancies = () => {
    const { showToast } = useToast();
    const location = useLocation();
    const [isApplying, setIsApplying] = useState(null);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);

    const openDetail  = useCallback((vacancy) => setSelectedDetail(vacancy), []);
    const closeDetail = useCallback(() => setSelectedDetail(null), []);

    const handleOpenCompanyProfile = useCallback(async (companyIdOrVacancy) => {
        if (!companyIdOrVacancy) return;

        // Caso A: Ya tenemos el ID
        if (typeof companyIdOrVacancy === 'string') {
            setSelectedCompanyId(companyIdOrVacancy);
            return;
        }

        // Caso B: Autocuración vía Service
        try {
            const resolvedId = await VacancyService.getCompanyIdByVacancyId(companyIdOrVacancy.id);
            if (resolvedId) {
                setSelectedCompanyId(resolvedId);
            } else {
                showToast('No pudimos localizar la empresa.', 'error');
            }
        } catch (err) {
            showToast('Error al conectar con la empresa.', 'error');
        }
    }, [showToast]);


    const {
        vacancies, categories, appliedIds, isFallbackMode,
        loading, isRefreshing, error,
        hasMore, loadMore,
        activeCategory, setActiveCategory, searchQuery, setSearchQuery,
        viewMode, setViewMode, radius, setRadius,
        userLocation, explorationCenter, setExplorationCenter,
        filters, toggleFilter, toggleUrgente, clearFilters,
        isFilterOpen, setIsFilterOpen, activeFilterCount,
        applyToVacancy,
    } = useExploreVacancies();

    const navigate = useNavigate();

    // 🚀 Deep Link: Open vacancy from dashboard state or URL query
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const queryId = queryParams.get('vacante');
        const stateId = location.state?.selectedVacancyId;
        const targetId = queryId || stateId;

        if (targetId && vacancies.length > 0) {
            const v = vacancies.find(v => v.id === targetId);
            if (v) {
                openDetail(v);
                // 🛑 Senior Fix: Clear URL and state to prevent ghost re-opening
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [vacancies, location.search, location.state, openDetail, navigate, location.pathname]);

    const { selectedVacancy, handleClearSelection, mapProps } = useVacancyMap(
        vacancies, userLocation, explorationCenter, setExplorationCenter
    );

    const handleApply = async (id) => {
        setIsApplying(id);
        const result = await applyToVacancy(id);
        setIsApplying(null);
        if (result.success) {
            showToast(result.message, 'success');
            handleClearSelection();
            closeDetail();
        } else {
            showToast(result.message || 'Error al postular. Intenta de nuevo.', 'error');
        }
    };

    // Sectioned (Netflix-style) grouping — only in list mode with no active filters
    const sections = useMemo(() => {
        if (activeCategory !== 'TODOS' || searchQuery || viewMode === 'map') return null;
        const groups = {};
        vacancies.forEach(v => {
            // Skip vacancies with no resolved category — they show in 'Todos' only
            if (!v.category) return;
            (groups[v.category] ??= []).push(v);
        });
        return Object.entries(groups)
            .sort(([, a], [, b]) => b.length - a.length)
            .map(([catId, items]) => ({
                id:       catId,
                label:    categories.find(c => c.id === catId)?.label || catId,
                vacancies: items.sort((a, b) => b.matchScore - a.matchScore),
            }));
    }, [vacancies, activeCategory, searchQuery, viewMode, categories]);

    return (
        <div className="font-manrope pb-20 md:pb-24 animate-fade-in min-h-screen w-full overflow-x-hidden flex flex-col bg-[#09090b]">

            <ExploreHeader
                activeCategory={activeCategory} setActiveCategory={setActiveCategory}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                viewMode={viewMode} setViewMode={setViewMode}
                radius={radius} setRadius={setRadius}
                categories={categories}
                filters={filters} toggleFilter={toggleFilter} toggleUrgente={toggleUrgente}
                clearFilters={clearFilters} isFilterOpen={isFilterOpen}
                setIsFilterOpen={setIsFilterOpen} activeFilterCount={activeFilterCount}
            />

            <InfoBanner show={userLocation.isDenied} icon={MapPinOff} color="bg-amber-500/5 border-amber-500/20 text-amber-400">
                <p className="text-[11px] font-medium"><span className="font-bold">GPS desactivado.</span> Activa la ubicación para ver vacantes cerca de ti.</p>
            </InfoBanner>

            <InfoBanner show={isFallbackMode && !loading && vacancies.length > 0} icon={Info} color="bg-blue-500/5 border-blue-500/20 text-blue-400">
                <p className="text-[11px] font-medium">No encontramos vacantes en tu zona. <span className="font-bold">Mostrando recomendaciones generales.</span> Amplía el radio.</p>
            </InfoBanner>

            <ExploreContent
                vacancies={vacancies} sections={sections}
                loading={loading} isRefreshing={isRefreshing} error={error}
                viewMode={viewMode}
                mapProps={mapProps} radius={radius} setRadius={setRadius}
                userLocation={userLocation} setExplorationCenter={setExplorationCenter}
                selectedVacancy={selectedVacancy} onClearSelection={handleClearSelection}
                onApply={handleApply} onOpenDetail={openDetail} onCompanyClick={handleOpenCompanyProfile} isApplying={isApplying} appliedIds={appliedIds}
                setActiveCategory={setActiveCategory} clearFilters={clearFilters} setSearchQuery={setSearchQuery}
                hasMore={hasMore} loadMore={loadMore}
            />

            {/* ─ Vacancy Detail Sheet ─────────────────────────────── */}
            <VacancyDetailSheet
                vacancy={selectedDetail}
                isOpen={!!selectedDetail}
                onClose={closeDetail}
                onApply={handleApply}
                onCompanyClick={handleOpenCompanyProfile}
                isApplying={isApplying === selectedDetail?.id}
                isApplied={appliedIds.has(selectedDetail?.id)}
            />

            <CompanyProfileModal 
                isOpen={!!selectedCompanyId}
                onClose={() => setSelectedCompanyId(null)}
                companyId={selectedCompanyId}
            />
        </div>
    );
};

// ─── Export (wrapped in ErrorBoundary) ───────────────────────────────────────
export default function ExploreVacanciesPage() {
    return (
        <ErrorBoundary context="ExploreVacancies" message="No pudimos cargar las vacantes. Verifica tu conexión e intenta de nuevo.">
            <ExploreVacancies />
        </ErrorBoundary>
    );
}
