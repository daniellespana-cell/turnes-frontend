import React from 'react';
import { Zap, Video, Handshake, CheckCircle2 } from 'lucide-react';
import FinalizeActionBtn from './FinalizeActionBtn';

import { useEffect, useState } from 'react';

const MobileActionDashboard = ({
    finanzas,
    onPay,
    onVideoInvite,
    onExecute,
    onFinalize,
    isPaying,
    isFinalizing,
    activeStep // 🆕 Received from useChatLogic -> useChatProtocol
}) => {
    const [isHidden, setIsHidden] = useState(false);

    const handleAction = async (callback) => {
        if (!callback) {
            setIsHidden(true);
            return;
        }

        try {
            await callback();
        } finally {
            setIsHidden(true);
        }
    };

    // Reset visibility when step changes
    useEffect(() => {
        setIsHidden(false);
    }, [activeStep]);

    if (!activeStep || isHidden) return null;

    return (
        <>
            {/* ESTADO A: FALTA PAGO (Paso 1) */}
            {activeStep === 'PAYMENT' && (
                <div className="mt-2 mb-1 p-3 bg-zinc-950/80 border border-transparent rounded-xl backdrop-blur-xl shadow-lg ring-1 ring-black/5 animate-in slide-in-from-bottom-2 duration-300 block md:hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-emerald-500/10 rounded-md text-emerald-400">
                                <Zap size={12} fill="currentColor" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-100">Pago Pendiente</span>
                        </div>
                        <span className="text-[9px] font-medium text-emerald-400/80 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                            1/3
                        </span>
                    </div>

                    <p className="text-[10px] text-zinc-500 mb-3 leading-tight font-medium">
                        Desbloquea datos de contacto y validación.
                    </p>

                    <button
                        onClick={() => handleAction(onPay)}
                        disabled={isPaying}
                        className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {isPaying ? 'Procesando...' : `Pagar $${finanzas?.cargoServicio?.toLocaleString()}`}
                    </button>
                </div>
            )}

            {/* ESTADO B: VIDEO (Paso 2) */}
            {activeStep === 'VIDEO' && (
                <div className="mt-2 mb-1 p-3 bg-zinc-950/80 border border-transparent rounded-xl backdrop-blur-xl shadow-lg ring-1 ring-black/5 animate-in slide-in-from-bottom-2 duration-300 block md:hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-blue-500/10 rounded-md text-blue-400 relative">
                                <Video size={12} />
                                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-100">Validación</span>
                        </div>
                        <span className="text-[9px] font-medium text-blue-400/80 bg-blue-500/5 px-1.5 py-0.5 rounded border border-blue-500/10">
                            2/3
                        </span>
                    </div>

                    <p className="text-[10px] text-zinc-500 mb-3 leading-tight font-medium">
                        Invita al candidato a una video-validación.
                    </p>

                    <button
                        onClick={() => handleAction(onVideoInvite)}
                        className="w-full py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Video size={12} /> Invitar
                    </button>
                </div>
            )}

            {/* ESTADO C: ACUERDO (Paso 3) */}
            {activeStep === 'AGREEMENT' && (
                <div className="mt-2 mb-1 p-3 bg-zinc-950/80 border border-transparent rounded-xl backdrop-blur-xl shadow-lg ring-1 ring-black/5 animate-in slide-in-from-bottom-2 duration-300 block md:hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-purple-500/10 rounded-md text-purple-400">
                                <Handshake size={12} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-100">Acuerdo</span>
                        </div>
                        <span className="text-[9px] font-medium text-purple-400/80 bg-purple-500/5 px-1.5 py-0.5 rounded border border-purple-500/10">
                            3/3
                        </span>
                    </div>

                    <p className="text-[10px] text-zinc-500 mb-3 leading-tight font-medium">
                        Si todo es correcto, confirma el acuerdo.
                    </p>

                    <button
                        onClick={() => handleAction(onExecute)}
                        className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={12} /> Confirmar
                    </button>
                </div>
            )}

            {/* ESTADO D: FINALIZAR (Paso 4) */}
            {activeStep === 'FINALIZE' && (
                <div className="mt-2 mb-1 p-3 bg-zinc-950/80 border border-transparent rounded-xl backdrop-blur-xl shadow-lg ring-1 ring-black/5 animate-in slide-in-from-bottom-2 duration-300 block md:hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-indigo-500/10 rounded-md text-indigo-400">
                                <CheckCircle2 size={12} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-100">Finalizar</span>
                        </div>
                        <span className="text-[9px] font-medium text-indigo-400/80 bg-indigo-500/5 px-1.5 py-0.5 rounded border border-indigo-500/10">
                            Listo
                        </span>
                    </div>

                    <p className="text-[10px] text-zinc-500 mb-3 leading-tight font-medium">
                        Servicio completado. Cierra el turno.
                    </p>

                    <FinalizeActionBtn
                        onFinalize={() => handleAction(onFinalize)}
                        isFinalizing={isFinalizing}
                        className="w-full py-2 rounded-lg text-[10px]"
                    />
                </div>
            )}
        </>
    );
};

export default MobileActionDashboard;