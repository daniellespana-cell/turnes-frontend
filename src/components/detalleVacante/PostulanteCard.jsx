import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, ShieldCheck, MapPin, MessageCircle } from 'lucide-react';
import { typography } from '../../styles/typography';
import { useDetalleVacante } from '../../hooks/useDetalleVacante';

export const PostulanteCard = ({ cand, isSelected, isAnyHired }) => {
  const { id: vacanteId } = useParams(); 
  const navigate = useNavigate();
  
  const { ejecutarAccion } = useDetalleVacante();

  const handleAction = (tipo) => {
    // --- 1. RECUPERAR CEREBRO FINANCIERO DE LA VACANTE ---
    const vacantesGuardadas = JSON.parse(localStorage.getItem("turnes_vacantes") || "[]");
    const infoVacante = vacantesGuardadas.find(v => String(v.id) === String(vacanteId));

    // --- 2. INYECTAR DATOS AL CANDIDATO PARA EL CHAT ---
    // Esto asegura que el pago NO sea $0
    const candidatoConFinanzas = {
      ...cand,
      payment: infoVacante?.payment || 50000, // Sueldo base
      billingConfig: infoVacante?.billingConfig || {
        cargoServicio: (infoVacante?.payment || 50000) * 0.06,
        plan: 'Básico'
      }
    };

    // Sincronizado: pasa el tipo de acción, el objeto enriquecido y el ID
    ejecutarAccion(tipo, candidatoConFinanzas, vacanteId);
  };

  return (
    <div className={`relative rounded-[1.5rem] md:rounded-[2rem] border transition-all duration-300 ${isSelected ? 'bg-blue-600/5 border-blue-500/30 shadow-2xl scale-[0.99]' : 'bg-[#0a0a0a] border-white/5'} ${isAnyHired && !isSelected ? 'opacity-20 grayscale blur-[1px]' : 'opacity-100'}`}>
      
      <div className="p-4 md:p-5 flex flex-col gap-4">
        
        {/* IDENTIDAD COMPACTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img src={cand.avatar} className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 bg-zinc-800" alt="" />
              {cand.isVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-black text-emerald-500 p-0.5 rounded-full ring-1 ring-emerald-500/50">
                  <ShieldCheck size={10} strokeWidth={3} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className={typography.entityName + " text-lg md:text-xl"}>{cand.name.split(' ')[0]}</h2>
              </div>
              <p className={typography.meta + " text-[9px] opacity-50 truncate -mt-0.5"}>{cand.role}</p>
            </div>
          </div>
        </div>

        {/* DATOS TÉCNICOS */}
        <div className="flex items-center justify-between py-2 border-y border-white/5">
          <div className="flex flex-col">
            <p className={typography.sectionTitle + " text-[8px]"}>Cercanía</p>
            <div className="flex items-center gap-1 text-blue-500">
              <MapPin size={10} />
              <span className={typography.data + " text-xs md:text-sm"}>{cand.distance}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <p className={typography.sectionTitle + " text-[8px]"}>Reputación</p>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star size={10} fill="currentColor" />
              <span className={typography.data + " text-xs md:text-sm"}>{cand.rating}</span>
            </div>
          </div>
        </div>

        {/* ACCIÓN PRINCIPAL */}
        <div className="flex items-center gap-2">
          {!isSelected ? (
            <button 
              disabled={isAnyHired} 
              onClick={() => handleAction('MATCH')}
              className={`flex-1 py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg active:scale-95 transition-all ${typography.action} text-[9px] tracking-widest disabled:opacity-0`}
            >
              Contratar
            </button>
          ) : (
            <button 
              onClick={() => navigate(`/dashboard/chat/${cand.id}`)}
              className={`flex-1 py-2 md:py-2.5 bg-emerald-500 text-black rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-all ${typography.action} text-[9px]`}
            >
              <MessageCircle size={14} strokeWidth={3} /> Chat Match
            </button>
          )}
        </div>
      </div>
    </div>
  );
};