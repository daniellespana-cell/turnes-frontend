import React from 'react';
import { X, AlertTriangle, Check, Trash2, Copy } from 'lucide-react';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'delete', confirmText = 'Confirmar' }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setTimeout(() => setIsVisible(false), 300); // Wait for exit animation
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return createPortal(
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'bg-black/80 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none pointer-events-none'}`}>
            <div
                className={`bg-[#0a0a0a] border border-transparent w-full max-w-sm rounded-[2rem] p-8  transform transition-all duration-300 relative overflow-hidden ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
            >
                {/* Glow de ambientación */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 blur-[80px] rounded-full pointer-events-none ${type === 'delete' ? 'bg-red-500/20' : 'bg-emerald-500/20'}`} />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${
                        type === 'delete' 
                            ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                            : type === 'info'
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            : 'bg-zinc-800 border-white/5 text-zinc-400'
                    }`}>
                        {type === 'delete' ? <Trash2 size={20} /> : type === 'info' ? <AlertTriangle size={20} /> : <Copy size={20} />}
                    </div>

                    <h3 className="text-white font-bold text-lg mb-2 tracking-tight">{title}</h3>
                    <p className="text-zinc-500 text-xs font-medium leading-relaxed mb-8 px-4">
                        {message}
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-white/5 hover:text-white transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => { onConfirm(); onClose(); }}
                            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${type === 'delete'
                                    ? 'bg-red-500 hover:bg-red-600 shadow-red-900/20'
                                    : 'bg-[#21c99a] hover:bg-[#1db389] shadow-emerald-900/20' // Brand primary
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmationModal;
