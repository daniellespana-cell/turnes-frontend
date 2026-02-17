import React from 'react';
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';

const TransactionError = ({ onRetry, onCancel, errorMessage = "Hubo un problema procesando tu solicitud." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 space-y-8 animate-in fade-in zoom-in duration-500 font-manrope">

      {/* ICONO MINIMALISTA */}
      <div className="relative">
        <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
        <div className="relative bg-[#0f0f10] border border-white/5 p-4 rounded-2xl shadow-xl">
          <XCircle size={40} className="text-red-500" />
        </div>
      </div>

      {/* TEXTOS */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          ¡Pago Fallido!
        </h2>
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-medium max-w-[280px] mx-auto leading-relaxed">
          {errorMessage}
        </p>
      </div>

      {/* ACCIONES */}
      <div className="flex flex-col gap-3 w-full max-w-[280px]">
        <button
          onClick={onRetry}
          className="group w-full bg-white text-black py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all hover:bg-zinc-200 active:scale-95 flex items-center justify-center gap-2"
        >
          <RefreshCw size={14} className="opacity-60" />
          Intentar Nuevamente
        </button>

        <button
          onClick={onCancel}
          className="w-full bg-transparent text-zinc-500 hover:text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border border-transparent hover:border-white/10 flex items-center justify-center gap-2"
        >
          <ArrowLeft size={14} />
          Cancelar y Volver
        </button>
      </div>
    </div>
  );
};

export default TransactionError;