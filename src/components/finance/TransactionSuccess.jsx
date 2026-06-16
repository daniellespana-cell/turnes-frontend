import React from 'react';
import { CheckCircle2, Download, Wallet } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../services/financeService';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';

const TransactionSuccess = ({ amount, transactionId, onDownloadPDF }) => {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();

  // 🚀 OJO DE ÁGUILA: Sincronizar saldo global inmediatamente al éxito
  useEffect(() => {
    if (refreshSession) refreshSession();
  }, [refreshSession]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 space-y-8 animate-in fade-in zoom-in duration-500 font-manrope">

      {/* ICONO MINIMALISTA */}
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
        <div className="relative bg-[#0f0f10] border border-transparent p-4 rounded-2xl ">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
      </div>

      {/* TEXTOS */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          ¡Carga Exitosa!
        </h2>
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-medium">
          Transacción #{transactionId?.slice(0, 10).toUpperCase()}
        </p>
      </div>

      {/* TARJETA DE RESUMEN */}
      <div className="bg-zinc-900/30 border border-transparent p-6 rounded-2xl w-full max-w-[280px] text-center space-y-1">
        <span className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">Saldo Acreditado</span>
        <h3 className="text-3xl font-bold text-white tracking-tight">
          {formatCurrency(amount)}
        </h3>
      </div>

      {/* ACCIONES */}
      <div className="flex flex-col gap-3 w-full max-w-[280px]">
        <button
          onClick={() => navigate('/dashboard/finanzas')}
          className="group w-full bg-white text-black py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all hover:bg-zinc-200 active:scale-95 flex items-center justify-center gap-2"
        >
          <Wallet size={14} className="opacity-60" />
          Ir a Billetera
        </button>

        <button
          onClick={onDownloadPDF}
          className="w-full bg-transparent text-zinc-500 hover:text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border border-transparent  flex items-center justify-center gap-2"
        >
          <Download size={14} />
          Descargar Recibo
        </button>
      </div>
    </div>
  );
};

export default TransactionSuccess;