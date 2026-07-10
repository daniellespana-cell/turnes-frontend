import React from 'react';


/**
 * Sistema Unificado de Carga (Product-Grade)
 * 
 * Diseño minimalista inspirado en Nequi / inDriver:
 * - Tres puntos que pulsan en secuencia.
 * - Sin ruido visual. Sutil y profesional.
 */

const sizeMap = { sm: 4, md: 6, lg: 8, xl: 10 };
const palette = {
    emerald: '#10b981',
    blue:    '#3b82f6',
    white:   '#ffffff',
    muted:   '#52525b',
    danger:  '#ef4444',
};
const textColorMap = {
    emerald: 'text-emerald-500',
    blue:    'text-blue-500',
    white:   'text-white',
    muted:   'text-zinc-500',
    danger:  'text-red-500',
};

export const Spinner = ({ 
    size = 'md', 
    variant = 'emerald', 
    center = false,
    text = null,
    className = ""
}) => {
    const dotSize = typeof size === 'number' ? Math.max(4, size / 6) : sizeMap[size] || sizeMap.md;
    const gap = dotSize * 0.8;
    const color = palette[variant] || palette.emerald;

    const spinnerContent = (
        <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
            <div className="flex items-center" style={{ gap }}>
                {[0, 1, 2].map(i => (
                    <div
                        key={i}
                        className="rounded-full"
                        style={{
                            width: dotSize,
                            height: dotSize,
                            backgroundColor: color,
                            animation: `spinnerPulse 1.2s ease-in-out ${i * 0.15}s infinite`,
                        }}
                    />
                ))}
            </div>

            {text && (
                <span 
                    className={`text-[11px] font-medium tracking-wide ${textColorMap[variant] || textColorMap.emerald} opacity-60`}
                    style={{ fontFamily: "'Google Sans', 'Inter', system-ui, sans-serif" }}
                >
                    {text}
                </span>
            )}

            <style>{`
                @keyframes spinnerPulse {
                    0%, 80%, 100% { opacity: 0.15; transform: scale(0.8); }
                    40% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );

    if (center) {
        return (
            <div className="flex w-full h-full min-h-[150px] items-center justify-center p-4">
                {spinnerContent}
            </div>
        );
    }

    return spinnerContent;
};

export default Spinner;
