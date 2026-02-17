import React from 'react';
import { Zap, Send, Handshake, Video } from 'lucide-react';

export const ActionSteps = ({
    isPaid,
    status, // { confirmingPay, isPaying, isSealed }
    permisos,
    config,
    actions, // { handlePay, setConfirmingPay, handleMobileAction }
    onExecute,
    onFinalize,
    onVideoInvite
}) => {

    const { confirmingPay, isPaying } = status;
    const { handlePay, setConfirmingPay, handleMobileAction } = actions;

    // 1. STATE: SEALED (Archived)
    if (status.isSealed) return null; // Handled by parent or SealedWatermark component often enough, but let's keep specific UI here if needed. 
    // Actually, standard UI shows a "Ciclo Sellado" box in parent. We'll skip rendering buttons.

    // 2. STATE: UNPAID (Step 1)
    if (!isPaid) {
        return (
            <div className="space-y-2">
                {!confirmingPay ? (
                    <button
                        onClick={() => setConfirmingPay(true)}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.25em] shadow-lg active:scale-95 transition-all hover:brightness-110"
                    >
                        <Zap size={12} className="inline mr-2" fill="currentColor" /> Paso 1: Pagar y Conectar
                    </button>
                ) : (
                    <div className="animate-in fade-in zoom-in duration-200 space-y-2">
                        <button
                            onClick={handlePay}
                            disabled={isPaying}
                            className="w-full py-3.5 bg-zinc-900 border border-emerald-500 text-emerald-500 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-500 hover:text-white transition-all"
                        >
                            {isPaying ? "Procesando..." : `Confirmar Precio: $${config.cargo.toLocaleString()}`}
                        </button>
                        <button
                            onClick={() => setConfirmingPay(false)}
                            disabled={isPaying}
                            className="w-full py-2 text-zinc-500 text-[8px] font-bold uppercase tracking-widest hover:text-white"
                        >
                            Cancelar
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // 3. STATE: PAID (Steps 2, 3, 4)
    return (
        <>
            <button
                onClick={() => handleMobileAction(permisos?.confirmado ? onFinalize : onExecute)}
                className={`w-full py-3.5 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.25em] transition-all shadow-xl active:scale-95 ${permisos?.confirmado
                        ? 'bg-gradient-to-r from-emerald-600 to-blue-600' // Step 4
                        : 'bg-gradient-to-r from-blue-600 to-emerald-500 shadow-lg hover:brightness-110' // Step 3
                    }`}
            >
                {permisos?.confirmado ? (
                    <span className="flex items-center justify-center gap-2"><Send size={12} /> Paso 4: Finalizar y Calificar</span>
                ) : (
                    <span className="flex items-center justify-center gap-2"><Handshake size={12} /> Paso 3: Confirmar Acuerdo</span>
                )}
            </button>

            <button
                onClick={() => handleMobileAction(onVideoInvite)}
                className="w-full py-3 px-4 rounded-xl border flex items-center justify-center gap-3 transition-all bg-zinc-900 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800"
            >
                <Video size={14} className="text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Paso 2: Validación Visual</span>
            </button>
        </>
    );
};
