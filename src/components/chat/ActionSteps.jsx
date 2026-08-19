import React from 'react';
import { Zap, Handshake, Video } from 'lucide-react';
import FinalizeActionBtn from './FinalizeActionBtn';


export const ActionSteps = ({
    activeStep,
    _isPaid,
    status, // { confirmingPay, isPaying, isSealed, isFinalizing }
    _permisos,
    _config,
    actions, // { handlePay, setConfirmingPay, handleMobileAction }
    onExecute,
    onFinalize,
    onVideoInvite
}) => {

    const { isPaying, isFinalizing } = status;
    const { handlePay, handleMobileAction } = actions;

    // 1. STATE: SEALED (Archived)
    if (status.isSealed) return null;

    // 2. SSOT MAPPING (Switch on activeStep)
    switch (activeStep) {
        case 'PAYMENT':
            return (
                <div className="space-y-2">
                    <button
                        onClick={handlePay}
                        disabled={isPaying}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.25em] shadow-lg active:scale-95 transition-all hover:brightness-110 disabled:opacity-50"
                        type="button"
                        aria-label="Acción">
                        {isPaying ? "Procesando..." : <><Zap size={12} className="inline mr-2" fill="currentColor" /> Paso 1: Pagar y Conectar</>}
                    </button>
                </div>
            );

        case 'VIDEO':
            return (
                <button
                    onClick={() => handleMobileAction(onVideoInvite)}
                    className="w-full py-3 px-4 rounded-xl border flex items-center justify-center gap-3 transition-all bg-zinc-900 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800"
                    type="button"
                    aria-label="Acción">
                    <Video size={14} className="text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Paso 2: Validación Visual</span>
                </button>
            );

        case 'AGREEMENT':
            return (
                <button
                    onClick={() => handleMobileAction(onExecute)}
                    className="w-full py-3.5 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.25em] transition-all  active:scale-95 bg-gradient-to-r from-blue-600 to-emerald-500 hover:brightness-110"
                    type="button"
                    aria-label="Acción">
                    <span className="flex items-center justify-center gap-2"><Handshake size={12} /> Paso 3: Confirmar Acuerdo</span>
                </button>
            );

        case 'FINALIZE':
            return (
                <FinalizeActionBtn
                    onFinalize={() => handleMobileAction(onFinalize)}
                    isFinalizing={isFinalizing}
                    className="w-full py-3.5 rounded-xl text-[9px] "
                />
            );

        default:
            return null;
    }
};

export default ActionSteps;
