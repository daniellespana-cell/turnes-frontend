import React from 'react';
import { Lock, Zap, ShieldCheck } from 'lucide-react';
import { typography } from '../../styles/typography';

export const SidebarDetalle = ({ hiredFirstName }) => (
  <div className="space-y-6">
    
    {/* CARD: PREVISUALIZACIÓN DEL ACUERDO */}
    <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] relative shadow-2xl overflow-hidden group">
      {/* Aura de acción institucional */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/5 blur-[50px] rounded-full group-hover:bg-purple-600/10 transition-colors duration-500" />
      
      <h3 className={typography.sectionTitle + " mb-5 flex items-center gap-3 text-zinc-100"}>
        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.4)]" /> 
        <span>Mensaje de Apertura</span>
      </h3>
      
      <div className="p-5 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-2xl relative">
        {/* Indicador de mensaje saliente */}
        <div className="absolute -left-1 top-6 w-1 h-8 bg-purple-600 rounded-full shadow-[0_0_10px_rgba(147,51,234,0.5)]" />
        
        <p className={`${typography.body} text-zinc-400 break-words text-[13px] leading-relaxed italic`}>
          "{hiredFirstName 
            ? `Hola ${hiredFirstName}, soy el jefe en Turnes. He seleccionado tu perfil por tu reputación. ¿Hablamos?` 
            : 'Hola [Nombre], soy el jefe en Turnes. He seleccionado tu perfil por tu reputación. ¿Hablamos?'
          }"
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Zap size={10} className="text-purple-500 animate-pulse" />
        <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.15em]">
          Envío automático tras validación
        </span>
      </div>
    </div>

    {/* CARD: PROTOCOLOS DE SEGURIDAD (NARRATIVA INSTITUCIONAL) */}
    <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] shadow-2xl overflow-hidden relative">
       <h3 className={typography.sectionTitle + " mb-8 flex items-center gap-3 text-zinc-400"}>
         <ShieldCheck size={14} className="shrink-0 opacity-50" /> 
         <span>Blindaje Operativo</span>
       </h3>
       
       <div className="space-y-7 relative z-10">
         {[
           { n: "01", t: "Custodia de Fondos", d: "Liquidación protegida mediante Bóveda Turnes." },
           { n: "02", t: "Cifrado de Acuerdo", d: "Interacción privada protegida hasta ejecución." },
           { n: "03", t: "Auditoría de Perfil", d: "Identidad validada mediante registro biométrico." }
         ].map((r, i) => (
           <div key={i} className="flex gap-4 items-start">
             {/* ID de protocolo con estilo de terminal */}
             <span className="text-[9px] font-mono text-blue-500/40 pt-1 shrink-0">
               {r.n}
             </span>
             
             <div className="flex flex-col min-w-0">
               <h4 className={`${typography.modalEntityName} !text-zinc-200 !font-black !tracking-tighter uppercase text-[10px]`}>
                 {r.t}
               </h4>
               <p className={`${typography.body} text-zinc-500 text-[11px] leading-snug !italic-none mt-0.5`}>
                 {r.d}
               </p>
             </div>
           </div>
         ))}
       </div>

       {/* Marca de agua institucional sutil */}
       <div className="absolute -bottom-4 -right-4 opacity-[0.02] pointer-events-none">
         <Lock size={120} />
       </div>
    </div>
  </div>
);