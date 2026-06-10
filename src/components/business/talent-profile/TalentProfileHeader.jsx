import React from 'react';
import { X } from 'lucide-react';


export const TalentProfileHeader = ({ onClose }) => (
    <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-20">
        <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Perfil del Talento
        </h2>
        <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
            <X size={16} className="text-zinc-400 hover:text-white" />
        </button>
    </div>
);

export default TalentProfileHeader;
