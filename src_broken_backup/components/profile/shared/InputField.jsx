import React from 'react';

const InputField = React.memo(({ label, value, onChange, disabled, icon, fullWidth, isLocked, type = "text" }) => (
    <div className={`flex flex-col gap-2 ${fullWidth ? 'md:col-span-2' : ''}`}>
        <label className="text-[10px] md:text-xs font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2">
            {label} {isLocked && <Lock size={10} className="text-zinc-700" />}
        </label>
        <div className={`relative group transition-all duration-500 ${disabled ? 'opacity-60' : 'opacity-100'}`}>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                disabled={disabled}
                className={`
                    w-full h-12 bg-white/5 border border-white/5 
                    rounded-2xl px-4 pl-12 text-sm text-white 
                    outline-none transition-all duration-300
                    placeholder:text-zinc-700 font-bold
                    ${disabled ? 'cursor-not-allowed' : 'focus:border-emerald-500/30 focus:bg-white/10 hover:border-white/20'}
                `}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-400 transition-all duration-500">
                {icon ? React.cloneElement(icon, { size: 18 }) : <Check size={18} />}
            </div>
        </div>
    </div>
));

InputField.displayName = 'InputField';
export default InputField;
