import React from 'react';
import { AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react';

const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-brand-danger" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    warning: <AlertCircle className="w-5 h-5 text-brand-warning" />
};

const styles = {
    success: "bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-100 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]",
    error: "bg-gradient-to-r from-red-500/10 to-red-500/5 border-red-500/20 text-red-100 shadow-[0_0_20px_-5px_rgba(239,68,68,0.2)]",
    info: "bg-gradient-to-r from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-100 shadow-[0_0_20px_-5px_rgba(59,130,246,0.2)]",
    warning: "bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-100 shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)]"
};

const MessageBox = ({ message, type = 'info' }) => {
    if (!message) return null;

    const icon = icons[type] || icons.info;
    const style = styles[type] || styles.info;

    return (
        <div className={`
            mt-6 relative flex items-start gap-4 p-4 rounded-xl border backdrop-blur-xl 
            animate-fade-in overflow-hidden
            ${style}
        `} role="alert">
            {/* Glossy Reflection Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <div className="shrink-0 mt-0.5 relative z-10 drop-shadow-md">{icon}</div>
            <div className="text-sm font-medium leading-relaxed opacity-90 relative z-10 tracking-wide">
                {message}
            </div>
        </div>
    );
};

export default MessageBox;