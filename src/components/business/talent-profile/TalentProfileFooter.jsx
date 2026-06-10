import React from 'react';
import { Send } from 'lucide-react';


export const TalentProfileFooter = ({ onInviteClick, profile, disabled }) => {
    if (!profile) return null;

    return (
        <div className="p-5 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/5 z-20">
            <button
                onClick={() => onInviteClick?.(profile)}
                disabled={disabled}
                className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-[0.15em] rounded-2xl transition-all active:scale-[0.97] disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2 text-[10px] shadow-xl shadow-white/5"
            >
                Invitar a Turno <Send size={14} />
            </button>
        </div>
    );
};

export default TalentProfileFooter;
