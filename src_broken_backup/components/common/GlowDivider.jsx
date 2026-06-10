
/**
 * GlowDivider
 * Separador minimalista con un efecto de luz sutil.
 * Ideal para separar secciones en dashboards premium.
 */
export const GlowDivider = ({ className = "" }) => {
    return (
        <div className={`relative h-px w-full my-8 ${className}`}>
            {/* Base line */}
            <div className="absolute inset-0 bg-white/5" />
            
            {/* Center Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent blur-[1px]" />
            
            {/* Micro-spark in the center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-40" />
        </div>
    );
};

export default GlowDivider;
