import React from 'react';
import { Video, FileSignature, Check, X } from 'lucide-react';
import FinalizeActionBtn from './FinalizeActionBtn';

import { useChatActionsContext } from '../../context/ChatActionContext';
import { getBubbleStyleConfig, resolveBubbleText } from './bubbleConfig';
// 🆕 Import K.I.S.S Component

const SystemActionBubble = ({ message, userRole, isClosed, hasValidatedVideo }) => {
    // 🧠 CONSUMIENDO ACCIONES DESDE EL CONTEXTO (Anti-Prop Drilling)
    const actions = useChatActionsContext();
    const { 
        onAcceptVideo, 
        aceptarInvitacionVideo, // 🆕 Protocol Action
        onDeclineVideo, 
        onInviteVideo, 
        onExecute, 
        onSealChat, 
        onAcceptRehire, 
        onDeclineRehire, 
        isFinalizing 
    } = actions;
    
    let { subtype, duration, txId, timestamp, roomUrl: msgRoomUrl } = message.metadata || {};

    const onAccept = !isClosed ? () => {
        if (aceptarInvitacionVideo) aceptarInvitacionVideo(msgRoomUrl);
        else if (onAcceptVideo) onAcceptVideo();
    } : undefined;
    const onDecline = !isClosed ? onDeclineVideo : undefined;
    const onInviteAction = !isClosed ? onInviteVideo : undefined;
    const onContractAction = !isClosed ? onExecute : undefined;

    const isVideoInvite = message.type === 'video_invitation' || subtype === 'video_invite';
    const isEmployerPrompt = ['prompt_video_invite', 'prompt_contract'].includes(message.type);
    const isRehireOffer = message.type === 'rehire_offer' || subtype === 'rehire_offer';

    // 🎭 TRADUCCIÓN Y ESTILOS DINÁMICOS DESDE DICCIONARIO
    const { displayTitle, displayInstruction } = resolveBubbleText(message, userRole);
    const config = getBubbleStyleConfig(message.type);

    const timeStr = new Date(timestamp || message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="w-full flex justify-center py-2 animate-in fade-in zoom-in duration-300">
            <div className={`
        relative w-full max-w-[280px] md:max-w-[320px] 
        bg-[#09090b]/90 backdrop-blur-md 
        border ${config.borderColor} rounded-xl 
        p-2.5 overflow-hidden 
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
                            {displayTitle}
                        </p>

                        {displayInstruction && (
                            <p className="text-[10px] text-zinc-500 italic border-l-2 border-zinc-800 pl-2">
                                {displayInstruction}
                            </p>
                        )}

                        {/* --- RESUMEN DE LA OFERTA DE RECONTRATACIÓN --- */}
                        {isRehireOffer && message.metadata?.price && (
                            <div className="bg-white/5 border border-transparent rounded-lg p-2 mt-2 space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-zinc-500 font-bold uppercase">Pago Ofrecido</span>
                                    <span className="text-[11px] text-emerald-400 font-black">${Number(message.metadata.price).toLocaleString('es-CO')}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-zinc-500 font-bold uppercase">Sugerencia de Turno</span>
                                    <span className="text-[11px] text-zinc-300 font-medium">{message.metadata.date}</span>
                                </div>
                            </div>
                        )}

                        {/* --- BOTONES MINIMALISTAS (Solo para Video y Solo para el Trabajador) --- */}
                        {isVideoInvite && userRole === 'trabajador' && !hasValidatedVideo && (
                            <div className="flex items-center gap-3 pt-3">
                                <button
                                    onClick={onAccept}
                                    className="flex-1 py-2 bg-white text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    type="button"
                                    aria-label="Acción">
                                    <Check size={12} /> Aceptar
                                </button>
                                <button
                                    onClick={onDecline}
                                    className="flex-1 py-2 bg-zinc-900 border border-transparent text-zinc-400 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                                    type="button"
                                    aria-label="Acción">
                                    <X size={12} /> Declinar
                                </button>
                            </div>
                        )}
                        {isVideoInvite && userRole === 'trabajador' && hasValidatedVideo && (
                            <div className="text-center pt-2 pb-1 text-[10px] text-emerald-500 font-black uppercase tracking-widest flex justify-center items-center gap-1 bg-emerald-500/10 rounded-lg mt-2">
                                <Check size={12} /> Ya Validado
                            </div>
                        )}

                        {/* --- BOTONES RECONTRATACION DIRECTA (FAST-TRACK) --- */}
                        {isRehireOffer && userRole === 'trabajador' && message.metadata?.status === 'pending' && (
                            <div className="flex items-center gap-3 pt-3">
                                <button
                                    onClick={() => onAcceptRehire && onAcceptRehire(message)}
                                    className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    type="button"
                                    aria-label="Acción">
                                    <Check size={12} /> Aceptar
                                </button>
                                <button
                                    onClick={() => onDeclineRehire && onDeclineRehire(message)}
                                    className="flex-1 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 hover:text-red-300 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    type="button"
                                    aria-label="Acción">
                                    <X size={12} /> Declinar
                                </button>
                            </div>
                        )}
                        {isRehireOffer && message.metadata?.status === 'accepted' && (
                            <div className="text-center pt-2 pb-1 text-[10px] text-emerald-500 font-black uppercase tracking-widest flex justify-center items-center gap-1 bg-emerald-500/10 rounded-lg mt-2">
                                <Check size={12} /> Oferta Aceptada
                            </div>
                        )}
                        {isRehireOffer && message.metadata?.status === 'declined' && (
                            <div className="text-center pt-2 pb-1 text-[10px] text-red-500 font-black uppercase tracking-widest flex justify-center items-center gap-1 bg-red-500/10 rounded-lg mt-2">
                                <X size={12} /> Oferta Declinada
                            </div>
                        )}

                        {/* --- BOTONES PROACTIVOS (Solo Empresa) --- */}
                        {isEmployerPrompt && userRole === 'empresa' && (
                            <div className="flex items-center gap-3 pt-3">
                                {message.type === 'prompt_video_invite' && onInviteAction && (
                                    <button
                                        onClick={onInviteAction}
                                        className="w-full py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
                                        type="button"
                                        aria-label="Acción">
                                        <Video size={12} /> Invitar a Video
                                    </button>
                                )}
                                {message.type === 'prompt_contract' && onContractAction && (
                                    <button
                                        onClick={onContractAction}
                                        className="w-full py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
                                        type="button"
                                        aria-label="Acción">
                                        <FileSignature size={12} /> Emitir Acuerdo
                                    </button>
                                )}
                            </div>
                        )}

                        {/* --- BOTÓN FINALIZAR (Paso 4: Red de Confianza) --- */}
                        {message.type === 'contract_signed' && userRole === 'empresa' && (
                            <div className="flex items-center gap-3 pt-3">
                                <FinalizeActionBtn
                                    onFinalize={onSealChat}
                                    isFinalizing={isFinalizing}
                                    className="w-full py-2 rounded-lg text-[10px]"
                                />
                            </div>
                        )}

                        {/* Metadata (TX ID, Duración) */}
                        <div className="flex flex-wrap gap-2">
                            {txId && <span className="text-[9px] font-mono text-zinc-600 bg-zinc-900/50 px-2 py-1 rounded">TX: {txId}</span>}
                            {duration && <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Tiempo: {duration}</span>}
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default SystemActionBubble;