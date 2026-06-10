import React from 'react';
import { Eye, EyeOff } from 'lucide-react';


const PasswordInput = ({
    id,
    value,
    onChange,
    label,
    placeholder,
    showPassword,
    onToggleVisibility,
    required = true
}) => {
    return (
        <div className="group relative">
            <input
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={onChange}
                required={required}
                className="peer w-full px-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-white placeholder-transparent focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-text hover:bg-zinc-900/80 pr-10"
                placeholder={placeholder}
                id={id}
            />
            <label
                htmlFor={id}
                className="absolute left-4 top-1 text-xs text-zinc-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-600 peer-focus:top-1 peer-focus:text-xs peer-focus:text-emerald-500"
            >
                {label}
            </label>
            {onToggleVisibility && (
                <button
                    type="button"
                    onClick={onToggleVisibility}
                    className="absolute right-3 top-3.5 text-zinc-500 hover:text-white transition-colors focus:outline-none"
                    aria-label={showPassword ? "Ocultar Contraseña" : "Mostrar Contraseña"}
                >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            )}
        </div>
    );
};

export default PasswordInput;
