import React from 'react';
import { ShieldCheck, Archive } from 'lucide-react';

export const ChatSafetyFooter = ({ isPaid, isClosed }) => {
    if (!isPaid && !isClosed) {
        return (
            <div className="pt-4 pb-8 flex justify-center">
                <div className="max-w-xs w-full bg-[#0a0a0a] border border-emerald-500/20 rounded-[2rem] p-8 text-center space-y-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <ShieldCheck className="text-emerald-500" size={32} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-white text-[12px] font-black uppercase tracking-[0.2em]">Blindaje de Seguridad</h3>
                        <p className="text-zinc-600 text-[9px] font-bold uppercase leading-relaxed px-4">
                            Conexión establecida. Realiza el pago para habilitar video y contratos.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (isClosed) {
        return (
            <div className="pt-4 pb-8 flex justify-center">
                <div className="max-w-xs w-full bg-blue-500/5 border border-blue-500/10 rounded-[2rem] p-8 text-center space-y-4 animate-in zoom-in-95 duration-700">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Archive className="text-blue-400" size={32} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-blue-400 text-[12px] font-black uppercase tracking-[0.2em]">Ciclo de Servicio Cerrado</h3>
                        <p className="text-zinc-600 text-[9px] font-bold uppercase leading-relaxed px-4">
                            Este registro ha sido archivado exitosamente.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
