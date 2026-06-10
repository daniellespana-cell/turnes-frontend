
const ResumenLiquidacion = ({ data, ui, walletBalance, onPublish, formatCurrency, isSubmitting, userPlan }) => {
  return (
    <div className="md:bg-zinc-900/40 md:rounded-[2.5rem] md:p-6 sticky top-8 font-manrope">

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
        <div className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-transparent">
          <span className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2">
            <Users size={14} /> Cupos Solicitados
          </span>
          <span className="text-white font-black text-sm">{ui.quantity}</span>
        </div>

        {/* CONTADOR DE BENEFICIO (SSOT) */}
        {data.totalLimit > 0 && ui.labelContratacion.includes('Fija') && (
          <div className="flex justify-between items-center p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl mb-2">
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
               Beneficio del Plan
             </span>
             <span className="text-emerald-400 text-xs font-black">
               {data.remainingFree} de {data.totalLimit} libres
             </span>
          </div>
        )}

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
            {ui.isLoadingQuote ? (
              <p className="text-3xl font-black text-zinc-500 tracking-tighter truncate animate-pulse">
                Calculando...
              </p>
            ) : (
              <p className="text-3xl font-black text-white tracking-tighter truncate">
                {formatCurrency(data.total)}
              </p>
            )}
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
      {/* 🚀 SENIOR FIX: Cero 'Fake Disabled States'.
          Si el botón arroja Toasts explicativos de error al ser tocado, 
          debe parecer siempre "vivo" para invitar al tap. */}
      <button
        type="button"
        onClick={onPublish}
        disabled={isSubmitting || ui.isLoadingQuote}
        className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden
          ${(isSubmitting || ui.isLoadingQuote)
            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-60'
            : 'bg-white text-black hover:bg-blue-500 hover:text-white  shadow-blue-500/10 active:scale-95'
          }
        `}
      >
        {isSubmitting && (
          <div className="absolute inset-0 bg-zinc-800/80 backdrop-blur-sm z-10 flex items-center justify-center pointer-events-none">
            <Spinner size="sm" variant="white" />
          </div>
        )}
        <span className={isSubmitting ? 'opacity-20' : 'opacity-100'}>
          {isSubmitting ? "Procesando..." : "Publicar Ahora"}
        </span>
      </button>
    </div>
  );
};

export default ResumenLiquidacion;