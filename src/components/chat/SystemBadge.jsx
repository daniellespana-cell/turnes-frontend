import React from 'react';
import { Clock } from 'lucide-react';

import { ShieldCheck, AlertTriangle, Zap, Heart, Handshake } from 'lucide-react';

export const SystemBadge = ({ msg }) => {
  // 1. Detección de Temas por Contenido o Tipo de Mensaje
  const isWarning = msg.text?.includes('INTERRUMPIDO') || msg.text?.includes('Error') || msg.text?.includes('bloqueado');
  const isMatch = msg.type === 'match' || msg.type === 'details' || msg.text?.includes('Protocolo Match');
  const isRehire = msg.type === 'rehire_alert' || msg.text?.includes('Red de Confianza');
  
  // ✅ NUEVO: Detección de Acuerdo Biométrico (Paso 3)
  const isBiometric = msg.type === 'biometric_closure' || msg.text?.includes('ACUERDO FIRMADO');

  const getTheme = () => {
    if (isWarning) return { glow: 'bg-red-500/10', border: 'border-red-500/20', iconColor: 'text-red-500', label: 'Turnes Alert', Icon: AlertTriangle };
    if (isRehire) return { glow: 'bg-purple-500/10', border: 'border-purple-500/20', iconColor: 'text-purple-400', label: 'Red de Confianza', Icon: Heart };
    if (isMatch) return { glow: 'bg-emerald-500/10', border: 'border-emerald-500/20', iconColor: 'text-emerald-500', label: 'Match Instantáneo', Icon: Zap };
    
    // ✅ Estilo Premium para el Acuerdo Final
    if (isBiometric) return { glow: 'bg-blue-600/20', border: 'border-blue-500/30', iconColor: 'text-blue-400', label: 'Firma Biométrica', Icon: Handshake };
    
    return { glow: 'bg-blue-500/5', border: 'border-white/5', iconColor: 'text-zinc-500', label: 'Protocolo de Bóveda', Icon: ShieldCheck };
  };

  const theme = getTheme();

  // Blindaje de ID: Si es número, lo convertimos a string para el slice
  const safeId = String(msg.id || '00000000').slice(0, 8).toUpperCase();
  // TX ID dinámico si viene en la metadata del mensaje (Paso 3)
  const txId = msg.metadata?.txId || safeId;

  return (
    <div className="flex justify-center my-6 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-700">
      <div className="relative max-w-[280px] w-full px-4">
        
        {/* Glow dinámico de fondo */}
        <div className={`absolute inset-0 ${theme.glow} blur-[25px] rounded-full opacity-40`} />
        
        <div className={`relative bg-[#0A0A0A] border ${theme.border} rounded-2xl p-4  overflow-hidden`}>
          
          {/* Cabecera institucional */}
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className={`p-1.5 rounded-lg bg-white/[0.03] border border-transparent shadow-inner ${theme.iconColor}`}>
              <theme.Icon size={12} />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-[0.15em] text-zinc-600 italic">Bóveda Turnes</span>
              <span className={`text-[7px] ${theme.iconColor} font-black uppercase tracking-widest leading-none`}>
                {theme.label}
              </span>
            </div>
          </div>

          {/* Cuerpo del mensaje: Autoridad Turnes */}
          <p className={`text-[10px] font-bold leading-snug uppercase tracking-tight italic whitespace-pre-line ${isBiometric ? 'text-zinc-200' : 'text-zinc-400'}`}>
            {msg.text}
          </p>

          {/* Footer de autenticación técnica */}
          <div className="mt-3 pt-2.5 border-t border-white/[0.03] flex justify-between items-center text-zinc-800">
             <span className="text-[6px] font-mono uppercase tracking-tighter">
                {isBiometric ? 'Digital Sign:' : 'Auth:'} {txId}
             </span>
             <div className="flex items-center gap-1 text-[7px] font-black uppercase tracking-tighter">
               <Clock size={8} className="opacity-30" /> 
               {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemBadge;