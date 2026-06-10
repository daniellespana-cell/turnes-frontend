import React from 'react';
import { X, Archive, ShieldAlert, Trash2, AlertCircle } from 'lucide-react';
import Spinner from '../ui/Spinner';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const ACTION_CONFIG = {
    archive: {
        title: 'Archivar Conversación',
        description: 'La conversación se ocultará de tu lista principal, pero no se borrará la historia.',
        icon: <Archive className="w-6 h-6 text-zinc-400" />,
        color: 'zinc',
        buttonAction: 'Archivar Chat',
        bgGradient: 'from-zinc-500/10 to-transparent',
        borderFocus: 'focus:ring-zinc-500/50'
    },
    block: {
        title: 'Bloquear Usuario',
        description: 'No recibirás más mensajes de esta persona. Esta acción se reportará al sistema.',
        icon: <ShieldAlert className="w-6 h-6 text-orange-400" />,
        color: 'orange',
        buttonAction: 'Bloquear',
        bgGradient: 'from-orange-500/10 to-transparent',
        borderFocus: 'focus:ring-orange-500/50'
    },
    delete: {
        title: 'Eliminar Chat',
        description: 'Se borrará la conexión de tu lista permanentemente. El otro usuario aún conservará su copia.',
        icon: <Trash2 className="w-6 h-6 text-red-400" />,
        color: 'red',
        buttonAction: 'Eliminar',
        bgGradient: 'from-red-500/10 to-transparent',
        borderFocus: 'focus:ring-red-500/50'
    }
};

const ChatActionModal = ({ isOpen, onClose, onConfirm, actionType, candidateName }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible || !actionType) return null;

    const config = ACTION_CONFIG[actionType];

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm(actionType);
        } finally {
            setIsLoading(false);
            onClose();
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center sm:px-4 sm:pt-4 sm:pb-20">
            {/* Backdrop con Blur Dinámico */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={!isLoading ? onClose : undefined}
            />

            {/* Contenedor Modal Modal Glassmorphism */}
            <div
                className={`relative bg-[#0a0a09] w-full sm:max-w-md sm:rounded-2xl border border-transparent  flex flex-col transition-all duration-300 origin-bottom sm:origin-center h-full sm:h-auto overflow-hidden
                    ${isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 sm:scale-95 translate-y-full sm:translate-y-0'}
                `}
            >
                {/* Degradado Superior Base */}
                <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${config.bgGradient} opacity-50 pointer-events-none`} />

                {/* Cabecera Responsiva */}
                <div className="flex justify-between items-center p-5 border-b border-white/5 relative z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-${config.color}-500/10 border border-${config.color}-500/20 shadow-inner`}>
                            {config.icon}
                        </div>
                        <h2 className="text-[18px] font-black tracking-tight text-white capitalize">
                            {config.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Contenido Flexible */}
                <div className="p-6 flex-1 overflow-y-auto no-scrollbar relative z-10 space-y-6">
                    <div className="bg-white/5 border border-transparent p-4 rounded-xl space-y-3">
                        <p className="text-zinc-300 text-[14px] leading-relaxed font-medium">
                            ¿Estás seguro de que deseas ejecutar esta acción con <strong className="text-white">{candidateName}</strong>?
                        </p>
                        <div className="flex gap-2 items-start bg-black/30 p-3 rounded-lg border border-transparent">
                            <AlertCircle className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                            <p className="text-zinc-500 text-[12px] leading-snug">
                                {config.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Sticky */}
                <div className="p-5 border-t border-white/5 bg-black/50 backdrop-blur-md relative z-10 shrink-0">
                    <div className="flex gap-3 relative">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 py-3 px-4 rounded-xl border border-transparent text-white font-bold text-[14px] hover:bg-white/5 transition-colors disabled:opacity-50 active:scale-95"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={`flex-1 py-3 px-4 rounded-xl font-black text-[14px] transition-all relative overflow-hidden group active:scale-95 disabled:opacity-50
                                ${actionType === 'archive' ? 'bg-zinc-100 text-black hover:bg-zinc-200  shadow-zinc-500/20' :
                                    actionType === 'delete' ? 'bg-red-500 hover:bg-red-600 text-white  shadow-red-500/20' :
                                        'bg-orange-500 hover:bg-orange-600 text-white  shadow-orange-500/20'
                                }
                            `}
                        >
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <Spinner size="sm" variant="white" />
                                ) : (
                                    config.buttonAction
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ChatActionModal;
