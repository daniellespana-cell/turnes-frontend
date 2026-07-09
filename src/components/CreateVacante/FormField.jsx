import React from 'react';


const FormField = ({ icon: Icon, children, className = "" }) => (
  <div className={`flex items-center gap-3 bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-xl px-4 py-4 min-h-[56px] shadow-sm transition-all duration-300 focus-within:border-emerald-500/50 focus-within:bg-white/[0.04] focus-within:shadow-[0_0_15px_rgba(16,185,129,0.15)] ${className}`}>
    {Icon && <Icon size={20} className="text-zinc-500 shrink-0" />}
    {children}
  </div>
);

export default FormField;