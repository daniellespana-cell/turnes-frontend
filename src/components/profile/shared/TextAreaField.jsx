import { Check } from 'lucide-react';

import React from 'react';

const TextAreaField = React.memo(({ label, value, onChange, disabled, icon, fullWidth, placeholder }) => (
    <div className={`flex flex-col gap-2 ${fullWidth ? 'md:col-span-2' : ''}`}>
        <label className="text-[10px] md:text-xs font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2">
            {label}
        </label>
        <div className={`relative group transition-all duration-500 ${disabled ? 'opacity-60' : 'opacity-100'}`}>
            <textarea
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                className={`
                    w-full h-32 bg-white/5 border border-white/5 
                    rounded-2xl p-4 pl-12 text-sm text-white 
                    outline-none transition-all duration-300
                    placeholder:text-zinc-700 font-bold resize-none
                    ${disabled ? 'cursor-not-allowed' : 'focus:border-emerald-500/30 focus:bg-white/10 hover:border-white/20'}
                `}
            />
            <div className="absolute left-4 top-5 text-zinc-600 group-focus-within:text-emerald-400 transition-all duration-500">
                {icon ? React.cloneElement(icon, { size: 18 }) : <Check size={18} />}
            </div>
        </div>
    </div>
));

TextAreaField.displayName = 'TextAreaField';
export default TextAreaField;
