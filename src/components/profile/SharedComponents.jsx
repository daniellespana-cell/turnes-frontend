import React from 'react';
import { Check, Lock } from 'lucide-react';

/* --- SUB-COMPONENTES ORGANIZADOS --- */

export const StatCard = ({ label, value, icon }) => (
    <div className="bg-[#09090b] border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center gap-0.5 hover:bg-zinc-900/40 transition-colors group">
        <div className="text-zinc-500 mb-0.5 group-hover:text-purple-500 transition-colors scale-75">{icon}</div>
        <span className="text-sm font-bold text-white tracking-tight">{value}</span>
        <span className="text-[9px] uppercase tracking-wider text-zinc-600 font-bold group-hover:text-zinc-500 transition-colors">{label}</span>
    </div>
);

export const SectionCard = ({ title, icon, children }) => (
    <div className="bg-[#09090b] border border-white/5 rounded-2xl p-4 md:p-5 hover:border-white/10 transition-colors">
        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
            <div className="p-1.5 bg-zinc-900 rounded-md text-zinc-400">
                {icon}
            </div>
            <h2 className="text-sm font-bold text-white tracking-tight">{title}</h2>
        </div>
        {children}
    </div>
);

export const InputField = ({ label, value, onChange, disabled, icon, fullWidth, isLocked }) => (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'md:col-span-2' : ''}`}>
        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider pl-1 flex items-center gap-1">
            {label} {isLocked && <Lock size={8} className="text-zinc-600" />}
        </label>
        <div className={`relative group transition-all duration-300 ${disabled ? 'opacity-70' : 'opacity-100'}`}>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                disabled={disabled}
                className={`w-full bg-zinc-900/30 border ${disabled ? 'border-transparent' : 'border-zinc-700 focus:border-purple-500/30 focus:bg-zinc-900/50'} rounded-lg py-2 px-3 pl-8 text-xs text-zinc-200 outline-none transition-all placeholder:text-zinc-600 font-medium`}
            />
            <div className="absolute left-2.5 top-2.5 text-zinc-600 group-focus-within:text-purple-500 transition-colors scale-75">
                {icon || <Check size={14} />}
            </div>
        </div>
    </div>
);
