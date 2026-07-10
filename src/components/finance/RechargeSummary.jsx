import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Spinner from '../ui/Spinner';

import { useState } from 'react';

const RechargeSummary = ({ amount, isProcessing, onPay }) => {
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Calculamos si el botón debe estar deshabilitado
  const isDisabled = amount <= 0 || isProcessing || !termsAccepted;

  return (
    <div className="bg-[#0f0f10] border border-transparent rounded-2xl p-5 space-y-6 lg:sticky lg:top-24 h-fit">
      <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Resumen</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-zinc-500 font-medium">Recarga</span>
          <span className="text-white font-mono">${amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-zinc-500 font-medium">Comisión</span>
          <span className="text-emerald-500 text-[10px] font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md">
            Gratis
          </span>
        </div>
      </div>
      <div className="pt-4 border-t border-white/5 flex justify-between items-end">
        <span className="text-zinc-400 text-sm font-medium">Total</span>
        <span className="text-white text-2xl font-bold font-manrope tracking-tight">
          ${amount.toLocaleString()}
        </span>
      </div>
      {/* TÉRMINOS Y CONDICIONES (Check Obligatorio) */}
      <div className="flex items-start gap-3 p-3 bg-zinc-900/50 rounded-lg border border-transparent">
        <input
          type="checkbox"
          id="terms"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-zinc-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900 bg-zinc-800 cursor-pointer"
        />
        <label htmlFor="terms" className="text-[10px] text-zinc-400 leading-tight cursor-pointer select-none">
          Acepto que esta recarga es para <span className="text-white font-bold">consumo digital</span> y <span className="text-red-400 font-bold">no tiene reembolso</span>.
        </label>
      </div>
      {/* BOTÓN CON ESTADO DE CARGA */}
      <button
        onClick={onPay}
        disabled={isDisabled}
        className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border flex items-center justify-center gap-2
          ${isDisabled
            ? 'bg-zinc-900 border-white/5 text-zinc-600 cursor-not-allowed opacity-50'
            : 'bg-white text-black border-white hover:bg-zinc-200 active:scale-[0.98]'
          }`}
        type="button"
        aria-label="Acción">
        {isProcessing ? (
          <>
            <Spinner size="sm" variant="white" />
            <span>Procesando...</span>
          </>
        ) : (
          `Pagar $${amount.toLocaleString()}`
        )}
      </button>
      <div className="flex gap-2 items-center justify-center text-zinc-600 opacity-60">
        <ShieldCheck size={12} />
        <span className="text-[9px] font-medium tracking-wide">
          Pagos encriptados & seguros
        </span>
      </div>
    </div>
  );
};

export default RechargeSummary;