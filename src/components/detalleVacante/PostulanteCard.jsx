import React from 'react';
import { m as motion } from 'framer-motion';
import { Star, ShieldCheck, MapPin, MessageCircle, ChevronRight } from 'lucide-react';
import Spinner from '../ui/Spinner';

import { typography } from '../../styles/typography';
import { AssetResolver } from '../../utils/assetHelper';

export const PostulanteCard = ({ cand, isSelected, isAnyHired, isProcessing, onContratar, onChatMatch, onViewProfile }) => {

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: isAnyHired && !isSelected ? 0.3 : 1, 
        scale: isSelected ? 1.02 : (isAnyHired && !isSelected ? 0.95 : 1),
        filter: isAnyHired && !isSelected ? 'blur(2px) grayscale(100%)' : 'blur(0px) grayscale(0%)',
        zIndex: isSelected ? 50 : 1
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`relative rounded-xl md:rounded-2xl border ${
        isSelected 
          ? 'bg-emerald-900/10 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]' 
          : 'bg-[#0a0a0a] border-white/5'
      }`}
    >
      <div className="p-4 md:p-5 flex flex-col gap-4">

        {/* IDENTIDAD COMPACTA & CLICKABLE PERFIL NAV */}
        <div className="flex items-center justify-between">
          <div
            onClick={onViewProfile}
            className="flex items-center gap-2 cursor-pointer group flex-1 min-w-0"
          >
            <div className="relative shrink-0">
              <img src={AssetResolver.getAvatar(cand.avatar_url || cand.avatar, cand.name || 'Candidato')} className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-transparent bg-zinc-800 group-hover:border-white/30 transition-colors" alt="" />
              {/* VERIFIED BADGE (Standardized) */}
              {(cand.verified || cand.isVerified) && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 text-white p-0.5 rounded-full ring-2 ring-[#0a0a0a] shadow-md z-10" title="Verificado">
                  <ShieldCheck size={8} strokeWidth={3} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className={`${typography.entityName} text-base md:text-lg group-hover:text-blue-400 transition-colors`}>
                  {cand.name.split(' ')[0]}
                </h2>
                <ChevronRight size={16} className="text-zinc-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all -ml-1 translate-x-1 group-hover:translate-x-0" />
              </div>
              <p className={typography.meta + " text-[9px] md:text-[10px] opacity-60 truncate -mt-0.5"}>{cand.role}</p>
            </div>
          </div>
        </div>

        {/* DATOS TÉCNICOS */}
        <div className="flex items-center justify-between py-2 border-y border-white/5">
          <div className="flex flex-col">
            <p className={typography.sectionTitle + " text-[8px] md:text-[9px] uppercase tracking-wider mb-0.5"}>Cercanía</p>
            <div className="flex items-center gap-1 text-blue-500">
              <MapPin size={10} />
              <span className={typography.data + " text-xs md:text-sm font-bold"}>{cand.distance}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <p className={typography.sectionTitle + " text-[8px] md:text-[9px] uppercase tracking-wider mb-0.5"}>Reputación</p>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star size={10} fill="currentColor" />
              <span className={typography.data + " text-xs md:text-sm font-bold"}>{cand.rating}</span>
            </div>
          </div>
        </div>

        {/* ACCIÓN PRINCIPAL */}
        <div className="flex items-center gap-2">
          {cand.status === 'pendiente' ? (
            <button
              disabled={isAnyHired || isProcessing}
              onClick={() => onContratar(cand)}
              className={`flex-1 py-2.5 md:py-3 rounded-lg border flex items-center justify-center gap-2 active:scale-95 transition-all ${typography.action} text-[10px] md:text-xs tracking-widest disabled:opacity-50 disabled:cursor-not-allowed ${
                isProcessing
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  : 'bg-transparent border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400'
              }`}
              type="button"
              aria-label="Acción">
              {isProcessing ? (
                <>
                  <Spinner size={8} variant="muted" />
                  Procesando
                </>
              ) : (
                'Contratar'
              )}
            </button>
          ) : (cand.status === 'contratado' || cand.status === 'chat_abierto' || isSelected) ? (
            <button
              onClick={() => onChatMatch?.()}
              className={`flex-1 py-2.5 md:py-3 bg-emerald-500 text-black rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-all ${typography.action} text-[10px] md:text-xs font-bold`}
              type="button"
              aria-label="Acción">
              <MessageCircle size={16} strokeWidth={3} /> {isSelected || cand.status === 'contratado' ? 'Chat Match 🎉' : 'Ir al Chat'}
            </button>
          ) : (
            <button
              disabled
              className={`flex-1 py-2.5 md:py-3 bg-zinc-800/50 text-zinc-500 rounded-lg border border-zinc-800 flex items-center justify-center gap-2 ${typography.action} text-[10px] md:text-xs cursor-not-allowed`}
              type="button"
              aria-label="Acción">
              {cand.status === 'rechazado' ? 'Rechazado' : 'Finalizado'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
export default PostulanteCard;
