import React from 'react';


/**
 * Skeleton (Standardized Shimmer)
 * Unifica el estilo de carga fantasma en toda la app.
 */
export const Skeleton = ({ 
    width = 'w-full', 
    height = 'h-4', 
    rounded = 'rounded-md',
    className = "" 
}) => {
    return (
        <div 
            className={`
                relative overflow-hidden bg-zinc-900/50 ${width} ${height} ${rounded} ${className}
                before:absolute before:inset-0
                before:-translate-x-full
                before:animate-[shimmer_2s_infinite]
                before:bg-gradient-to-r
                before:from-transparent before:via-white/5 before:to-transparent
            `}
        />
    );
};

export default Skeleton;
