import React from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import TalentCard from '../../components/business/TalentCard';
import TalentProfileModal from '../../components/business/TalentProfileModal';
import InviteToVacancyModal from '../../components/business/InviteToVacancyModal';
import EmptyState from '../../components/common/EmptyState';

import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

import { useTalentSearch } from '../../hooks/useTalentSearch';
import { typography } from '../../styles/typography';

const TalentSearchPage = () => {
    const navigate = useNavigate();
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    
    // New state for Invite Flow (Step 3)
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [selectedProfileForInvite, setSelectedProfileForInvite] = useState(null);

    const handleOpenProfile = (id) => {
        setSelectedCandidateId(id);
        setIsProfileModalOpen(true);
    };

    // UI logic delegated to Custom Hook (Clean Architecture)
    const {
        query,
        setQuery,
        activeSector,
        setActiveSector,
        loading,
        loadingMore,
        hasMore,
        filteredResults,
        handleSearchClick,
        handleClearSearch,
        loadMore,
        taxonomyOptions
    } = useTalentSearch();

    // Lógica nativa de Intersection Observer (Scroll Infinito sin librerías de terceros)
    const observer = useRef();
    const lastTalentElementRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        }, { rootMargin: '100px' }); // Gatilla 100px antes de llegar al final
        
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore, loadMore]);

    return (
        <div className="max-w-7xl mx-auto pb-20 pt-4 md:pt-8 px-4 md:px-6 min-h-screen text-zinc-300 antialiased font-manrope w-full min-w-0">

            {/* HEADER */}
            <header className="flex flex-col gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-10 h-10 flex items-center justify-center bg-zinc-900 rounded-full border border-transparent hover:bg-white/5 transition-all"
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
                <div className="flex bg-zinc-900/60 backdrop-blur-xl border border-transparent rounded-full p-0.5 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.05)] sticky top-4 z-20 group focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all duration-500 max-w-2xl mx-auto">
                    <div className="relative flex-1 flex items-center">
                        <div className="pl-4 pr-2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                            placeholder="Ej: Mesero, Barista..."
                            className="w-full bg-transparent border-none py-2 pr-4 text-[13px] font-medium text-white placeholder:text-zinc-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={handleSearchClick}
                        style={{ borderRadius: '9999px' }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 px-5 py-1.5 m-0.5 rounded-full font-bold text-[12px] tracking-wide transition-all shadow-[0_4px_10px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_15px_rgba(16,185,129,0.5)] active:scale-95 flex items-center justify-center"
                    >
                        Buscar
                    </button>
                </div>

                {/* FILTROS RÁPIDOS (TAXONOMY) */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mt-4">
                    <button
                        onClick={() => setActiveSector('TODOS')}
                        style={{ borderRadius: '9999px' }}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap
                        ${activeSector === 'TODOS' ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-zinc-400  hover:text-white'}`}
                    >
                        Todos
                    </button>
                    {taxonomyOptions.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveSector(cat.id)}
                            style={{ borderRadius: '9999px' }}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap
                            ${activeSector === cat.id ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-zinc-400  hover:text-white'}`}
                        >
                            {cat.label.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </header>

            {/* RESULTADOS GRID */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-48 bg-zinc-900/50 rounded-2xl border border-transparent" />
                    ))}
                </div>
            ) : filteredResults.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                        {filteredResults.map((candidate, index) => {
                            const isLast = index === filteredResults.length - 1;
                            return (
                                <div key={candidate.id} ref={isLast ? lastTalentElementRef : null}>
                                    <TalentCard
                                        candidate={candidate}
                                        onNavigate={navigate}
                                        onOpenProfile={() => handleOpenProfile(candidate.id)}
                                        onDirectInvite={() => {
                                            setSelectedProfileForInvite(candidate);
                                            setIsInviteModalOpen(true);
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    {loadingMore && (
                        <div className="w-full flex justify-center py-8">
                            <Loader2 size={32} className="text-emerald-500 animate-spin" />
                        </div>
                    )}
                </>
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
                    // Cierra el perfil y abre el selector de vacantes
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
