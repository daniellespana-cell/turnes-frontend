import React from 'react';
import { Video, Clock, FileSignature, ShieldCheck, AlertCircle, Banknote, Check, X } from 'lucide-react';

const SystemActionBubble = ({ message, onAccept, onDecline, onInviteAction, onContractAction }) => {
    const { subtype, duration, txId, instruction, timestamp, nextStep } = message.metadata || {};
    const isVideoInvite = message.type === 'video_invitation' || subtype === 'video_invite';
    const isEmployerPrompt = ['prompt_video_invite', 'prompt_contract'].includes(message.type);

    const timeStr = new Date(timestamp || message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Configuración de Estilos
    const getStyleConfig = () => {
        switch (message.type) {
            case 'video_invitation':
                return {
                    icon: <Video size={14} className="text-blue-400" />,
                    borderColor: 'border-blue-500/30',
                    bgGradient: 'from-blue-500/5 to-transparent',
                    title: 'Solicitud de Conexión', // Título más suave
                    textColor: 'text-blue-200'
                };
            case 'contract_signed':
                return {
                    icon: <FileSignature size={14} className="text-purple-400" />,
                    borderColor: 'border-purple-500/30',
                    bgGradient: 'from-purple-500/5 to-transparent',
                    title: 'Contrato Digital',
                    textColor: 'text-purple-200'
                };
            case 'payment_success':
                return {
                    icon: <Banknote size={14} className="text-yellow-400" />,
                    borderColor: 'border-yellow-500/30',
                    bgGradient: 'from-yellow-500/5 to-transparent',
                    title: 'Pago Procesado',
                    textColor: 'text-yellow-200'
                };
            case 'system_info':
                return {
                    icon: <Clock size={14} className="text-emerald-400" />,
                    borderColor: 'border-emerald-500/30',
                    bgGradient: 'from-emerald-500/5 to-transparent',
                    title: 'Resumen',
                    textColor: 'text-emerald-200'
                };

            case 'prompt_video_invite':
                return {
                    icon: <Video size={14} className="text-emerald-400" />,
                    borderColor: 'border-emerald-500/50',
                    bgGradient: 'from-emerald-500/10 to-transparent',
                    title: 'Siguiente Paso',
                    textColor: 'text-emerald-400'
                };
            case 'prompt_contract':
                return {
                    icon: <FileSignature size={14} className="text-indigo-400" />,
                    borderColor: 'border-indigo-500/50',
                    bgGradient: 'from-indigo-500/10 to-transparent',
                    title: 'Acción Requerida',
                    textColor: 'text-indigo-400'
                };
            default:
                return {
                    icon: <AlertCircle size={14} className="text-zinc-400" />,
                    borderColor: 'border-zinc-700',
                    bgGradient: 'from-zinc-800/50 to-transparent',
                    title: 'Sistema',
                    textColor: 'text-zinc-300'
                };
        }
    };

    const config = getStyleConfig();

    return (
        <div className="w-full flex justify-center py-2 animate-in fade-in zoom-in duration-300">
            <div className={`
        relative w-full max-w-[280px] md:max-w-[320px] 
        bg-[#09090b]/90 backdrop-blur-md 
        border ${config.borderColor} rounded-xl 
        p-2.5 overflow-hidden shadow-2xl
      `}>
                <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-40`} />

                <div className="relative z-10 flex flex-col gap-2">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                        <div className="flex items-center gap-1.5">
                            <div className="p-1 bg-white/5 rounded-md">{config.icon}</div>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${config.textColor}`}>
                                {config.title}
                            </span>
                        </div>
                        <span className="text-[8px] font-mono text-zinc-600">{timeStr}</span>
                    </div>

                    {/* Body */}
                    <div className="space-y-2 pl-1 pt-1">
                        <p className={`text-[12px] leading-relaxed font-medium ${message.type === 'contract_signed' ? 'text-white' : 'text-zinc-300'}`}>
                            {message.text}
                        </p>

                        {instruction && (
                            <p className="text-[10px] text-zinc-500 italic border-l-2 border-zinc-800 pl-2">
                                {instruction}
                            </p>
                        )}

                        {/* --- BOTONES MINIMALISTAS (Solo para Video) --- */}
                        {isVideoInvite && (
                            <div className="flex items-center gap-3 pt-3">
                                <button
                                    onClick={onAccept}
                                    className="flex-1 py-2 bg-white text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Check size={12} /> Aceptar
                                </button>
                                <button
                                    onClick={onDecline}
                                    className="flex-1 py-2 bg-zinc-900 border border-white/10 text-zinc-400 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <X size={12} /> Declinar
                                </button>
                            </div>
                        )}

                        {/* --- BOTONES PROACTIVOS (Employer: Ultra UX) --- */}
                        {isEmployerPrompt && (
                            <div className="flex items-center gap-3 pt-3">
                                {message.type === 'prompt_video_invite' && onInviteAction && (
                                    <button
                                        onClick={onInviteAction}
                                        className="w-full py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Video size={12} /> Invitar a Video
                                    </button>
                                )}
                                {message.type === 'prompt_contract' && onContractAction && (
                                    <button
                                        onClick={onContractAction}
                                        className="w-full py-1.5 bg-indigo-600 text-white rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <FileSignature size={11} /> Formalizar Acuerdo
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Metadata (TX ID, Duración) */}
                        <div className="flex flex-wrap gap-2">
                            {txId && <span className="text-[9px] font-mono text-zinc-600 bg-zinc-900/50 px-2 py-1 rounded">TX: {txId}</span>}
                            {duration && <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Tiempo: {duration}</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemActionBubble;