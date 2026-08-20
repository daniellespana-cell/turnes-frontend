import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Loader2, Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TalentCard from '../../components/business/TalentCard';
import TalentProfileModal from '../../components/business/TalentProfileModal';
import InviteToVacancyModal from '../../components/business/InviteToVacancyModal';
import EmptyState from '../../components/common/EmptyState';
import { useTalentSearch } from '../../hooks/useTalentSearch';
import { typography } from '../../styles/typography';

/**
 * TalentSearchPage (Explorar Talento para Empresas)
 * Arquitectura: CSS Grid Nativo + Infinite Scroll Sentinel & Paginación Robusta.
 * 100% libre de superposición/amontonamiento y totalmente adaptado a móviles.
 */
const TalentSearchPage = () => {
    const navigate = useNavigate();
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    
    // Estado para flujo de invitación a vacante
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [selectedProfileForInvite, setSelectedProfileForInvite] = useState(null);

    const handleOpenProfile = (id) => {
        setSelectedCandidateId(id);
        setIsProfileModalOpen(true);
    };

    // Lógica del Hook (SSOT de Búsqueda y Paginación)
    const {
        query,
        setQuery,
        activeSector,
        setActiveSector,
        loading,
        isFetching,
        loadingMore,
        hasMore,
        error,
        filteredResults,
        handleSearchClick,
        handleClearSearch,
        loadMore,
        taxonomyOptions
    } = useTalentSearch();

    // 🎯 Sentinel de Scroll Infinito Robusto (IntersectionObserver)
    const observerRef = useRef(null);
    const sentinelRef = useCallback((node) => {
        if (loading || loadingMore || isFetching) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        }, { rootMargin: '300px' });

        if (node) observerRef.current.observe(node);
    }, [hasMore, loading, loadingMore, isFetching, loadMore]);

    useEffect(() => {
        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, []);

    return (
        <div className="max-w-7xl mx-auto pb-24 pt-4 md:pt-8 px-4 md:px-6 min-h-screen text-zinc-300 antialiased font-manrope w-full min-w-0">
            {/* HEADER */}
            <header className="flex flex-col gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-10 h-10 flex items-center justify-center bg-zinc-900 rounded-full border border-white/5 hover:bg-white/5 transition-all text-zinc-400 hover:text-white"
                        type="button"
                        aria-label="Volver al dashboard"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className={typography.pageTitle}>
                            Explorar <span className={typography.gradient}>Talento</span>
                        </h1>
                        <p className="text-xs text-zinc-500 mt-1">
                            Encuentra profesionales verificados en tu zona.
                        </p>
                    </div>
                </div>

                {/* SEARCH BAR (iOS Pill 4K) */}
                <div className="flex bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-full p-0.5 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.05)] sticky top-4 z-20 group focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all duration-500 max-w-2xl mx-auto w-full">
                    <div className="relative flex-1 flex items-center min-w-0">
                        <div className="pl-4 pr-2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors shrink-0">
                            <Search size={16} />
                        </div>
                        <input
                            id="talent-search-input"
                            name="talentSearchQuery"
                            type="text"
                            aria-label="Buscar talento por especialidad o rol"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                            placeholder="Ej: Mesero, Barista, Cocinero..."
                            className="w-full bg-transparent border-none py-2 pr-4 text-[13px] font-medium text-white placeholder:text-zinc-500 outline-none min-w-0"
                        />
                    </div>
                    <button
                        onClick={handleSearchClick}
                        style={{ borderRadius: '9999px' }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 px-5 py-1.5 m-0.5 rounded-full font-bold text-[12px] tracking-wide transition-all shadow-[0_4px_10px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_15px_rgba(16,185,129,0.5)] active:scale-95 flex items-center justify-center cursor-pointer"
                        type="button"
                        aria-label="Buscar"
                    >
                        Buscar
                    </button>
                </div>

                {/* FILTROS RÁPIDOS (TAXONOMY) */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <button
                        onClick={() => setActiveSector('TODOS')}
                        style={{ borderRadius: '9999px' }}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap cursor-pointer ${
                            activeSector === 'TODOS' ? 'bg-white text-black border-white shadow-sm' : 'bg-transparent border-white/10 text-zinc-400 hover:text-white'
                        }`}
                        type="button"
                        aria-label="Ver todos los sectores"
                    >
                        Todos
                    </button>
                    {taxonomyOptions.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveSector(cat.id)}
                            style={{ borderRadius: '9999px' }}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap cursor-pointer ${
                                activeSector === cat.id ? 'bg-white text-black border-white shadow-sm' : 'bg-transparent border-white/10 text-zinc-400 hover:text-white'
                            }`}
                            type="button"
                            aria-label={`Filtrar por sector ${cat.label}`}
                        >
                            {cat.label.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </header>

            {/* RESULTADOS GRID NATIVO (100% RESPONSIVE, CERO AMONTONAMIENTO) */}
            {loading && filteredResults.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 animate-pulse w-full">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-zinc-900/40 rounded-3xl border border-white/5" />
                    ))}
                </div>
            ) : error ? (
                <EmptyState
                    icon={Search}
                    title="Error de conexión"
                    description={error}
                    actionLabel="Reintentar"
                    onAction={handleSearchClick}
                />
            ) : filteredResults.length > 0 ? (
                <div className="space-y-8 w-full">
                    {/* Grilla Nativa Flexible */}
                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 w-full transition-opacity duration-300 ${
                        isFetching && !loadingMore ? 'opacity-60' : 'opacity-100'
                    }`}>
                        {filteredResults.map(candidate => (
                            <TalentCard
                                key={candidate.id}
                                candidate={candidate}
                                onNavigate={navigate}
                                onOpenProfile={() => handleOpenProfile(candidate.id)}
                                onDirectInvite={() => {
                                    setSelectedProfileForInvite(candidate);
                                    setIsInviteModalOpen(true);
                                }}
                            />
                        ))}
                    </div>

                    {/* Sentinel para detección de scroll infinito */}
                    <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />

                    {/* Loader de Paginación */}
                    {loadingMore && (
                        <div className="w-full flex justify-center py-6">
                            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-900/80 border border-white/5 shadow-md">
                                <Loader2 size={16} className="text-emerald-400 animate-spin" />
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    Cargando más talentos...
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Botón de Cargar Más (Paginación accesible / fallback) */}
                    {hasMore && !loadingMore && (
                        <div className="flex justify-center pt-2 pb-6">
                            <button
                                onClick={loadMore}
                                className="group relative px-6 py-2.5 bg-zinc-900 border border-white/10 rounded-full hover:border-emerald-500/40 transition-all duration-300 cursor-pointer shadow-md"
                                type="button"
                                aria-label="Cargar más talentos"
                            >
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                                    Cargar más talentos
                                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <EmptyState
                    icon={Search}
                    title="No encontramos talentos"
                    description="Intenta con otros términos o amplía tu búsqueda."
                    actionLabel="Ver todos"
                    onAction={handleClearSearch}
                />
            )}

            {/* MODAL 360° DEL PERFIL */}
            <TalentProfileModal 
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                candidateId={selectedCandidateId}
                onInviteClick={(profile) => {
                    setIsProfileModalOpen(false);
                    setSelectedProfileForInvite(profile);
                    setIsInviteModalOpen(true);
                }}
            />

            {/* MODAL PARA INVITAR A VACANTES ACTIVAS Y CREAR TICKET EN EL CHAT */}
            <InviteToVacancyModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                candidate={selectedProfileForInvite}
            />
        </div>
    );
};

export default TalentSearchPage;
