import React from 'react';


const FormField = ({ icon: Icon, children, className = "" }) => (
  <div className={`flex items-center gap-3 bg-[#0f0f0f] border border-zinc-800 hover:border-zinc-700 rounded-xl px-4 py-3.5 shadow-sm transition-all duration-300 focus-within:border-emerald-500/50 focus-within:bg-[#151515] focus-within:shadow-[0_0_15px_rgba(16,185,129,0.15)] ${className}`}>
    {Icon && <Icon size={16} className="text-zinc-600 shrink-0" />}
    {children}
  </div>
);

export default FormField;