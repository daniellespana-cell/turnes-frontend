import React from 'react';
import { Sparkles, Lock, Heart } from 'lucide-react';

import SystemActionBubble from './SystemActionBubble';
import RehireOfferBubble from './RehireOfferBubble';
import { StandardMessageBubble } from './StandardMessageBubble';

export const MessageRenderer = ({
    msg,
    index,
    allMessages,
    handlers, // { onRehire, onAcceptVideo, onDeclineVideo, onInviteVideo, onExecute, onFinalize }
    state     // { isClosed }
}) => {
    const isMe = msg.sender === 'me';
    const { isClosed } = state;

    // --- 1. INFO BUBBLES (Match / Details) ---
    const isFirstMatch = msg.type === 'match' && allMessages.findIndex(m => m.type === 'match') === index;
    const isFirstDetails = msg.type === 'details' && allMessages.findIndex(m => m.type === 'details') === index;

    if ((msg.type === 'match' && isFirstMatch) || (msg.type === 'details' && isFirstDetails)) {
        return (
            <div className="flex flex-col items-center my-6 space-y-2 animate-in fade-in zoom-in-95 duration-700">
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-2 rounded-full flex items-center gap-2">
                    <Sparkles size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                        {msg.type === 'match' ? 'Protocolo Match Activo' : 'Detalles de Conexión'}
                    </span>
                </div>
                <p className="max-w-md text-center text-[11px] font-bold text-zinc-500 leading-relaxed uppercase px-10">
                    {msg.text}
                </p>
            </div>
        );
    }

    // --- 2. REHIRE OFFER ---
    if (msg.type === 'rehire_offer') {
        return (
            <RehireOfferBubble
                message={msg}
                onUpdateMessage={(id, val) => { /* Managed by hook */ }}
                onAction={(actionType) => handlers.onRehire(actionType, msg)}
            />
        );
    }

    // --- 3. SYSTEM ACTION BUBBLES ---
    const isSystemAction = [
        'action_request', 'system_info', 'contract_signed',
        'biometric_closure', 'video_invitation', 'payment_success',
        'prompt_video_invite', 'prompt_contract'
    ].includes(msg.type);

    if (isSystemAction) {
        return (
            <div className="my-4">
                <SystemActionBubble
                    message={msg}
                    onAccept={!isClosed ? handlers.onAcceptVideo : undefined}
                    onDecline={!isClosed ? handlers.onDeclineVideo : undefined}
                    onInviteAction={!isClosed ? handlers.onInviteVideo : undefined}
                    onContractAction={!isClosed ? (handlers.onFinalize || handlers.onExecute) : undefined}
                />
                {isClosed && msg.type === 'video_invitation' && (
                    <div className="text-center pt-1 text-[9px] text-zinc-700 font-mono flex items-center justify-center gap-1">
                        <Lock size={8} /> La invitación ha expirado
                    </div>
                )}
            </div>
        );
    }

    // --- 4. LEGACY BUBBLES (Backward Compat) ---
    if (msg.type === 'RECONTRATACION_OFFER' || msg.type === 'rehire_alert') {
        return (
            <div className="flex justify-center my-8 animate-in zoom-in-95 duration-700">
                <div className="relative w-full max-w-[300px]">
                    <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-[3rem] animate-pulse" />
                    <div className="relative bg-[#0a0a0a] border border-purple-500/30 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden text-center">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                                <Heart size={28} fill="currentColor" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-white">Propuesta Directa</h4>
                                <p className="text-[9px] text-zinc-500 font-bold leading-relaxed uppercase px-2">
                                    {msg.text || "El jefe desea recontratarte."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- 5. STANDARD MESSAGE ---
    return <StandardMessageBubble message={msg} isMe={isMe} isClosed={isClosed} />;
};
