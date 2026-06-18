import React, { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';

const FormClasses = {
    input: "peer w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-white placeholder-transparent focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-text hover:bg-zinc-900/80 pr-10",
    label: "absolute left-4 top-1 text-[10px] font-medium text-zinc-500 uppercase tracking-wider transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-600 peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-emerald-500"
};

const PasswordSecurityGroup = () => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // Checks
    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
    
    const isMatch = password === confirm && password.length > 0;

    const toggleVisibility = () => setShowPassword(!showPassword);

    const Requirement = ({ met, text }) => (
        <div className={`flex items-center gap-1.5 text-[10px] transition-colors duration-300 ${met ? 'text-emerald-400' : 'text-zinc-500'}`}>
            {met ? <Check size={12} strokeWidth={3} /> : <div className="w-3 h-3 rounded-full border border-zinc-700 flex-shrink-0" />}
            {text}
        </div>
    );

    return (
        <div className="flex flex-col gap-3">
            {/* Password */}
            <div className="group relative">
                <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={FormClasses.input}
                    placeholder="Contraseña"
                />
                <label htmlFor="password" className={FormClasses.label}>Contraseña</label>
                <button
                    type="button"
                    onClick={toggleVisibility}
                    className="absolute right-3 top-3.5 text-zinc-500 hover:text-white transition-colors focus:outline-none"
                    tabIndex="-1"
                >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>

            {/* Live Feedback Checklist */}
            <div className="grid grid-cols-2 gap-y-1.5 ml-1 mt-0.5">
                <Requirement met={hasMinLength} text="Mín. 8 caracteres" />
                <Requirement met={hasUpper} text="1 mayúscula" />
                <Requirement met={hasNumber} text="1 número" />
                <Requirement met={hasSymbol} text="1 símbolo" />
            </div>

            {/* Confirm Password */}
            <div className="group relative mt-1">
                <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={`${FormClasses.input} ${confirm.length > 0 && !isMatch ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/10' : ''}`}
                    placeholder="Confirmar Contraseña"
                />
                <label htmlFor="confirmPassword" className={FormClasses.label}>Confirmar Contraseña</label>
                
                {/* Match Indicator */}
                {confirm.length > 0 && (
                    <div className="absolute right-3 top-3.5">
                        {isMatch ? (
                            <Check size={16} className="text-emerald-500" />
                        ) : (
                            <X size={16} className="text-red-500" />
                        )}
                    </div>
                )}
            </div>
            
            {/* Error text if confirmation doesn't match */}
            {confirm.length > 0 && !isMatch && (
                <p className="text-[10px] text-red-400 ml-1 mt-0.5">Las contraseñas no coinciden.</p>
            )}
        </div>
    );
};

export default PasswordSecurityGroup;
