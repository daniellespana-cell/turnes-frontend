import HeaderDetalle from '../../components/detalleVacante/HeaderDetalle';
import VacancyGroupSection from '../../components/detalleVacante/VacancyGroupSection';
import PostulanteSkeleton from '../../components/detalleVacante/PostulanteSkeleton';
import TalentProfileModal from '../../components/business/TalentProfileModal';

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDetalleVacante } from '../../hooks/useDetalleVacante';
import { useCompanyPipeline } from '../../hooks/useCompanyPipeline';

/**
 * 🚀 DETALLE VACANTE PAGE (SENIOR REFACTOR)
 * Centro de mando de contratación.
 * Arquitectura: Orchestrator Pattern.
 */
const DetalleVacantePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Hooks de Lógica
  const { hiredAppId, ejecutarAccion, processingIds } = useDetalleVacante();
  const { isLoading, vacantesAgrupadas, sortByRating, setSortByRating, closeVacancy } = useCompanyPipeline(user?.id, id);

  // 2. Estado del Modal de Perfil
  const [selectedCandidateId, setSelectedCandidateId] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // 3. Handlers
  const handleChatMatch = (appId) => navigate(`/dashboard/chat/${appId}`);
  const handleViewProfile = (candId) => {
    setSelectedCandidateId(candId);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full min-w-0 max-w-6xl mx-auto pb-12 pt-6 px-4 font-manrope min-h-screen text-zinc-300 antialiased">
      <HeaderDetalle />

      <div className="w-full space-y-12">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <PostulanteSkeleton key={i} />)}
          </div>
        ) : vacantesAgrupadas.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-20 border border-dashed border-white/10 rounded-[2rem]">
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Sin Vacantes Activas</p>
            <p className="text-zinc-600 text-[10px] mt-2">Crea una vacante para empezar a recibir talento.</p>
          </div>
        ) : (
          /* RENDERIZADO ATÓMICO POR GRUPOS */
          vacantesAgrupadas.map(grupo => (
            <VacancyGroupSection 
              key={grupo.vacante.id}
              grupo={grupo}
              hiredAppId={hiredAppId}
              processingIds={processingIds}
              onChatMatch={handleChatMatch}
              onViewProfile={handleViewProfile}
              onCloseVacancy={closeVacancy}
              sortByRating={sortByRating}
              onToggleSort={() => setSortByRating(!sortByRating)}
              onContratar={(cand, V, racha, contratados) => 
                ejecutarAccion('MATCH', cand, V.id, V, racha, contratados)
              }
            />
          ))
        )}
      </div>

      {/* 🚀 MODAL DE PERFIL (Quick View) */}
      <TalentProfileModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        candidateId={selectedCandidateId}
        showInviteButton={false} // Ya están en proceso, no hace falta invitar
      />
    </div>
  );
};

export default DetalleVacantePage;