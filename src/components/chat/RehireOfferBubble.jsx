import React from 'react';
import { Calendar, CheckCircle2, XCircle, DollarSign, Clock } from 'lucide-react';


const RehireOfferBubble = ({ message, onUpdateMessage, onAction }) => {
    const { price, date, status } = message.metadata || {};
    const isPending = status === 'pending';
    const isAccepted = status === 'accepted';
    const isDeclined = status === 'declined';

    const handleAccept = () => {
        // 1. Actualizar estado visual del mensaje
        onUpdateMessage(message.id, {
            ...message.metadata,
            status: 'accepted'
        });

        // 2. Ejecutar lógica de negocio (Skip Video, Enable Contract)
        onAction('ACCEPT_REHIRE');
    };

    const handleDecline = () => {
        if (!window.confirm("¿Estás seguro de declinar esta oferta? El chat se cerrará.")) return;

        // 1. Actualizar estado visual
        onUpdateMessage(message.id, {
            ...message.metadata,
            status: 'declined'
        });

        // 2. Ejecutar lógica de cierre
        onAction('DECLINE_REHIRE');
    };

    return (
        <div className="w-full flex justify-center py-2 animate-in fade-in zoom-in duration-300">
            <div className={`
                relative w-full max-w-[280px] md:max-w-[320px] 
                bg-[#09090b]/90 backdrop-blur-md 
                border rounded-xl 
                p-3 overflow-hidden 
                ${isPending ? 'border-indigo-500/30' : ''}
                ${isAccepted ? 'border-emerald-500/30' : ''}
                ${isDeclined ? 'border-purple-500/30' : ''}
            `}>
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br opacity-20 ${isPending ? 'from-indigo-500/10 to-transparent' :
                    isAccepted ? 'from-emerald-500/10 to-transparent' :
                        'from-purple-900/20 to-transparent'
                    }`} />

                <div className="relative z-10 flex flex-col gap-3">
                    {/* Header Minimalista */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                            <div className={`p-1 rounded-md ${isPending ? 'bg-indigo-500/10 text-indigo-400' :
                                isAccepted ? 'bg-emerald-500/10 text-emerald-400' :
                                    'bg-purple-500/10 text-purple-400'
                                }`}>
                                {isAccepted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isPending ? 'text-indigo-200' :
                                isAccepted ? 'text-emerald-200' :
                                    'text-purple-200'
                                }`}>
                                {isPending ? 'Propuesta VIP' : isAccepted ? 'Oferta Aceptada' : 'Oferta Declinada'}
                            </span>
                        </div>
                        <span className="text-[8px] font-mono text-zinc-600">ID: {message.id.slice(-4)}</span>
                    </div>

                    {/* Data Row Compacto */}
                    <div className="flex items-center justify-between px-2">
                        <div className="flex flex-col">
                            <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">Fecha</span>
                            <div className="flex items-center gap-1 text-zinc-300">
                                <Calendar size={10} className="text-zinc-500" />
                                <span className="text-[10px] font-bold">{new Date(date).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="h-6 w-px bg-white/5" />
                        <div className="flex flex-col text-right">
                            <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">Monto</span>
                            <div className="flex items-center justify-end gap-1 text-zinc-300">
                                <span className="text-[10px] font-bold text-white">${Number(price).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {isPending ? (
                        <div className="flex items-center gap-2 pt-1">
                            <button
                                onClick={handleDecline}
                                className="flex-1 py-2 bg-[#0F0F11] border border-purple-500/20 text-purple-400 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-purple-900/20 hover:text-purple-300 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <XCircle size={10} /> Rechazar
                            </button>
                            <button
                                onClick={handleAccept}
                                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={10} /> Aceptar
                            </button>
                        </div>
                    ) : (
                        <div className={`mt-1 text-center py-1.5 rounded border border-dashed ${isAccepted ? 'border-emerald-500/20 text-emerald-500/50' : 'border-purple-500/20 text-purple-500/50'
                            }`}>
                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                                {isAccepted ? 'Contrato Aceptado, procede al pago' : 'Gestión Cerrada'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RehireOfferBubble;
