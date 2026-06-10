import { motion, AnimatePresence } from 'framer-motion';
import PostulanteCard from './PostulanteCard';
import { Archive, ArrowUpAz } from 'lucide-react';
import Spinner from '../ui/Spinner';

import React from 'react';

/**
 * 🏢 VACANCY GROUP SECTION (SENIOR - PRESENTATIONAL)
 * Componente 100% presentacional. Cero lógica de negocio.
 * Todas las acciones (cerrar, contratar, ver perfil) se delegan al padre via props.
 */
export const VacancyGroupSection = ({ 
  grupo, 
  hiredAppId, 
  processingIds, 
  onContratar, 
  onChatMatch,
  onViewProfile,
  onCloseVacancy,
  sortByRating,
  onToggleSort
}) => {
  const { vacante: V, postulantes } = grupo;
  const [isClosing, setIsClosing] = React.useState(false);
  
  const contratadosCount = postulantes.filter(p => p.status === 'contratado').length;
  const rachaActiva = postulantes.filter(p => p.status === 'chat_abierto').length;
  const MAX_CUPOS = V.cupos_disponibles || 1;
  const isFull = contratadosCount >= MAX_CUPOS;

  const handleClose = async () => {
    if (!window.confirm('¿Estás seguro de cerrar esta vacante? Se notificará a todos los candidatos pendientes.')) return;
    setIsClosing(true);
    await onCloseVacancy(V.id);
    setIsClosing(false);
  };

  return (
    <section className="pt-2 border-t border-white/10 first:border-t-0 first:pt-0">
      {/* 📌 Vacancy Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
          <div className="flex flex-col">
            <h2 className="font-bold text-white text-lg tracking-tight">
              {V.titulo || 'Vacante'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                V.tipo_turno === 'fijo' 
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}>
                {V.tipo_turno === 'fijo' ? 'Fija' : 'Temporal'}
              </span>

              {/* Cerrar Vacante */}
              <button 
                onClick={handleClose}
                disabled={isClosing}
                className="flex items-center gap-1 text-[9px] uppercase font-black text-zinc-500 hover:text-red-400 transition-colors ml-2 group"
              >
                {isClosing 
                  ? <Spinner size={8} variant="muted" /> 
                  : <Archive size={10} className="group-hover:scale-110 transition-transform" />
                }
                Cerrar Vacante
              </button>
            </div>
          </div>
        </div>
        
        {/* Metadata Badges & Sorting */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          
          {/* Toggle Ordenar */}
          <button 
            onClick={onToggleSort}
            className={`flex items-center gap-2 text-[10px] uppercase font-bold py-1.5 px-3 rounded-lg border transition-all ${
              sortByRating 
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/20'
            }`}
          >
            <ArrowUpAz size={12} />
            Rating
          </button>

          <div className="flex items-center gap-2 text-[10px] text-zinc-400 uppercase font-bold bg-white/5 py-1.5 px-3 rounded-lg border border-transparent shadow-sm">
            <span>Postulantes</span>
            <span className="text-white bg-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono leading-none">
              {postulantes.length}
            </span>
          </div>

          <div className={`flex items-center gap-2 text-[10px] uppercase font-bold py-1.5 px-3 rounded-lg border shadow-sm transition-colors ${
            isFull ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/5 text-zinc-400'
          }`}>
            <span>Cupos</span>
            <div className="flex items-center gap-0.5 font-mono text-[11px] leading-none">
              <span className={isFull ? 'text-red-400 font-black' : 'text-white'}>{contratadosCount}</span>
              <span className="opacity-40 px-0.5">/</span>
              <span className="opacity-70">{MAX_CUPOS}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] text-zinc-300 uppercase font-black bg-white/5 py-1.5 px-3 rounded-lg border border-transparent shadow-sm">
            <span className="text-zinc-500">Oferta</span>
            <span className="text-emerald-400 text-[11px] leading-none">${V.pago_monto}</span>
          </div>
        </div>
      </div>

      {/* 📌 Candidate Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
        <AnimatePresence>
          {postulantes.map(cand => (
            <PostulanteCard
              key={cand.applicationId}
              cand={cand}
              isSelected={hiredAppId === cand.applicationId}
              isProcessing={processingIds.includes(cand.applicationId)}
              isAnyHired={hiredAppId !== null || processingIds.length > 0}
              onContratar={() => onContratar(cand, V, rachaActiva, contratadosCount)}
              onChatMatch={() => onChatMatch(cand.applicationId)}
              onViewProfile={() => onViewProfile(cand.id)}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

export default VacancyGroupSection;
