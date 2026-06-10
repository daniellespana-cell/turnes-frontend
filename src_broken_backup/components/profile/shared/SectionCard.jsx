import React from 'react';

const SectionCard = ({ title, icon, children }) => (
    <div className="glass-card p-5 md:p-8 transition-all duration-500 border-white/5">
        <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                {React.cloneElement(icon, { size: 18 })}
            </div>
            <h2 className="text-base md:text-lg font-black text-white tracking-tight uppercase tracking-widest">{title}</h2>
        </div>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

export default SectionCard;
