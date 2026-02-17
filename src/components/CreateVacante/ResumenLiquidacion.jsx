import React from 'react';
import { CheckCircle2, ShieldCheck, Users, ShieldAlert } from 'lucide-react';
import ResumenRow from './ResumenRow';
import WalletStatus from './WalletStatus';

const ResumenLiquidacion = ({ data, ui, walletBalance, onPublish, formatCurrency, isSubmitting, userPlan }) => {
  return (
    <div className="md:bg-zinc-900/40 md:border md:border-white/5 md:rounded-[2.5rem] md:p-6 sticky top-8 md:backdrop-blur-xl md:shadow-2xl font-manrope">

      {/* HEADER: MEMBRESÍA - Ajustado para evitar desborde */}
      <div className="flex justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
          <h2 className="text-[11px] font-black uppercase tracking-widest text-white truncate">
            Liquidación
          </h2>
        </div>
        <div className="px-2 py-1 rounded-md bg-blue-500/5 border border-blue-500/10 flex items-center gap-1.5 shrink-0">
          <ShieldCheck size={10} className="text-blue-500" />
          <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">
            {userPlan || 'Básico'}
          </span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {/* INDICADOR DE VOLUMEN */}
        <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5">
          <span className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2">
            <Users size={14} /> Cupos Solicitados
          </span>
          <span className="text-white font-black text-sm">{ui.quantity}</span>
        </div>

        {/* DESGLOSE DINÁMICO */}
        <ResumenRow
          label={ui.labelContratacion}
          value={data.costoBase === 0 ? "Bonificada" : formatCurrency(data.costoBase)}
          isHighlight={data.costoBase === 0}
        />

        {ui.showCommission && (
          <ResumenRow
            label={`Gestión Turnes (${data.comisionPorcentaje}%)`}
            value={data.totalComisiones === 0 ? "Sin Comisión" : formatCurrency(data.totalComisiones)}
            isHighlight={data.totalComisiones === 0}
            subLabel={`Total por ${ui.quantity} personas`}
          />
        )}

        {ui.showUrgent && (
          <ResumenRow label="Prioridad en Red" value={`+${formatCurrency(data.costoUrgente)}`} />
        )}

        <div className="h-px bg-white/5 my-4" />

        {/* TOTAL PRINCIPAL */}
        <div className="flex justify-between items-end">
          <div className="min-w-0">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Inversión Total</p>
            <p className="text-3xl font-black text-white tracking-tighter truncate">
              {formatCurrency(data.total)}
            </p>
          </div>
          <div className="text-right opacity-40 text-[9px] font-bold uppercase shrink-0">COP</div>
        </div>
      </div>

      {/* ALERTAS DE SEGURIDAD */}
      {ui.showSensitiveAlert && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-[1.5rem] flex gap-3 items-center animate-in zoom-in-95">
          <ShieldAlert size={16} className="text-red-500 shrink-0" />
          <p className="text-[10px] text-red-200/80 font-bold uppercase tracking-tight leading-tight">
            Datos privados detectados. Publicación bloqueada.
          </p>
        </div>
      )}

      {/* STATUS BILLETERA */}
      <WalletStatus
        balance={walletBalance}
        hasFunds={ui.hasFunds}
        formatCurrency={formatCurrency}
      />

      {/* BOTÓN DE ACCIÓN FINAL */}
      <button
        onClick={onPublish}
        disabled={!ui.canPublish || isSubmitting}
        className={`w-full py-4.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3
          ${ui.canPublish && !isSubmitting
            ? 'bg-white text-black hover:bg-blue-500 hover:text-white shadow-xl shadow-blue-500/10 active:scale-95'
            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-40'}
        `}
      >
        {isSubmitting ? <div className="w-4 h-4 border-2 border-t-transparent animate-spin rounded-full" /> : "Publicar Ahora"}
      </button>
    </div>
  );
};

export default ResumenLiquidacion;