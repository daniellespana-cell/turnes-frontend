import React from 'react';
import { ArrowLeft } from 'lucide-react';

const FormContainer = ({ children, onBack, title, subtitle }) => (
    <div className="animate-fade-in w-full max-w-[340px] mx-auto relative pt-4">
        {/* Navigation Header */}
        <div className="flex items-center gap-4 mb-6">
            <button
                onClick={onBack}
                className="p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95 group"
                aria-label="Volver"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className="flex flex-col flex-1 min-w-0">
                <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 leading-tight whitespace-nowrap overflow-hidden text-ellipsis drop-shadow-sm">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-xs text-zinc-500 truncate">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>

        {children}
    </div>
);

export default FormContainer;
