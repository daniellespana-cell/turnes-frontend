import React from 'react';
import { Sparkles, Lock, Heart } from 'lucide-react';
import SystemActionBubble from './SystemActionBubble';
import RehireOfferBubble from './RehireOfferBubble';
import StandardMessageBubble from './StandardMessageBubble';



export const MessageRenderer = ({
    msg,
    index,
    allMessages,
    handlers, // { onRehire, onAcceptVideo, onDeclineVideo, onInviteVideo, onExecute, onFinalize }
    state,    // { isClosed }
    currentUser, // 🆕 Required to match UUID identities
    userRole    // 🆕 Required for dual-sided system message translation
}) => {
    // 🧠 Lógica Segura UUID: 'me' era legacy pre-Phase 49.
    const isMe = msg.sender === currentUser?.id || msg.sender === 'me';
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

    // El tipo 'rehire_offer' ahora es manejado nativamente por SystemActionBubble

    // --- 3. SYSTEM ACTION BUBBLES ---
    const isSystemAction = [
        'action_request', 'system_info', 'contract_signed',
        'biometric_closure', 'video_invitation', 'payment_success',
        'prompt_video_invite', 'prompt_contract', 'rehire_offer', 'system'
    ].includes(msg.type);

    if (isSystemAction) {
        return (
            <div className="my-4">
                <SystemActionBubble
                    message={msg}
                    userRole={userRole}
                    isClosed={isClosed}
                />
                {isClosed && msg.type === 'video_invitation' && (
                    <div className="text-center pt-1 text-[9px] text-zinc-700 font-mono flex items-center justify-center gap-1">
                        <Lock size={8} /> La invitación ha expirado
                    </div>
                )}
            </div>
        );
    }

    // --- 4. STANDARD MESSAGE ---
    return <StandardMessageBubble message={msg} isMe={isMe} isClosed={isClosed} />;
};

export default MessageRenderer;
