import React from 'react';
import { motion } from 'framer-motion';

const TurnesButton = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    icon: Icon,
    type = 'button'
}) => {

    // VARIANTES (Estilos Base)
    // VARIANTES (Estilos Base)
    const variants = {
        primary: "bg-[#21c99a] hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 border border-white/10",
        secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-lg shadow-black/20",
        danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20",
        ghost: "bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white"
    };

    // TAMAÑOS
    const sizes = {
        sm: "px-3 py-1.5 text-[10px]",
        md: "px-6 py-2.5 text-xs",
        lg: "px-8 py-3.5 text-sm"
    };

    return (
        <motion.button
            whileTap={!disabled ? { scale: 0.95 } : {}}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
                relative overflow-hidden group font-semibold tracking-normal rounded-xl transition-all duration-300
                flex items-center justify-center gap-2
                ${variants[variant] || variants.primary}
                ${sizes[size] || sizes.md}
                ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
                ${className}
            `}
        >
            {/* Efecto de Brillo (Glassmorphism Shine) */}
            {!disabled && variant !== 'ghost' && (
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-[800ms] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0 ease-in-out"></div>
            )}

            {/* Icono (Opcional) */}
            {Icon && <Icon size={size === 'sm' ? 12 : 16} className="relative z-10" />}

            {/* Texto */}
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
};

export default TurnesButton;
