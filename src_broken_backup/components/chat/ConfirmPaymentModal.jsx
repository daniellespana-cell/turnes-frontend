import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const ConfirmPaymentModal = ({ isOpen, onClose, finanzas, onConfirm, candidateName, candidato }) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. CÁLCULO VISUAL (Solo para mostrar al usuario, la lógica real está en el hook)
  const cargoCalculado = useMemo(() => {
    if (finanzas?.cargoServicio > 0) return finanzas.cargoServicio;
    const sueldo = finanzas?.pagoPersonal || 0;
    // Fallback visual para evitar $0
    return sueldo > 0 ? Math.round(sueldo * 0.06) : 3000;
  }, [finanzas]);

  if (!isOpen || !user) return null;

  const saldoUsuario = user?.saldo || 0;
  const esInsuficiente = saldoUsuario < cargoCalculado;

  // 2. HANDLER DELEGADO (El Cerebro se encarga de todo)
  const handlePaymentExecution = async () => {
    if (esInsuficiente) return;

    setIsProcessing(true);
    // Llamamos a la función maestra del useChatLogic
    await onConfirm();
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-md px-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[260px] bg-zinc-950 border border-transparent rounded-[2.2rem] p-6 space-y-6 ">

        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-5 right-6 text-zinc-800 hover:text-white transition-colors disabled:opacity-50"
        >
          <X size={12} strokeWidth={1} />
        </button>

        {/* Cabecera */}
        <div className="space-y-0.5 pt-1 text-center">
          <p className="text-[6px] font-black uppercase tracking-[0.4em] text-zinc-700">Protocolo de Conexión</p>
          <h3 className="text-[12px] font-light text-white tracking-widest uppercase">
            Validar a {candidateName?.split(' ')[0] || 'Candidato'}
          </h3>
        </div>

        {/* Resumen Financiero */}
        <div className="bg-white/[0.02] rounded-2xl p-4 space-y-3 border border-white/[0.02]">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest text-center">
              Fee de Intermediación (6%)
            </span>
            <span className="text-2xl font-light text-emerald-500 tabular-nums">
              ${cargoCalculado.toLocaleString()}
            </span>
          </div>

          <div className="h-px w-full bg-white/5" />

          <div className="flex justify-between text-[7px] font-black uppercase tracking-widest px-1">
            <span className="text-zinc-800">Tu Saldo</span>
            <span className={esInsuficiente ? 'text-red-600' : 'text-zinc-500'}>
              ${saldoUsuario.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="space-y-2">
          {esInsuficiente ? (
            <button disabled className="w-full py-3 bg-zinc-900/50 text-red-500/50 rounded-xl text-[8px] font-black uppercase cursor-not-allowed tracking-widest border border-red-500/10">
              Saldo Insuficiente
            </button>
          ) : (
            <button
              onClick={handlePaymentExecution}
              disabled={isProcessing}
              className="group w-full py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 text-white rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
              {isProcessing ? (
                <>
                  <Spinner size={8} variant="white" />
                  Procesando...
                </>
              ) : (
                <>
                  <Zap size={10} fill="currentColor" />
                  Confirmar y Pagar
                  <ChevronRight size={8} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          )}

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-full text-[7px] font-black text-zinc-800 hover:text-zinc-600 uppercase tracking-[0.4em] disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};