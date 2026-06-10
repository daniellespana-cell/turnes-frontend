import React from 'react';
import { Navigation } from 'lucide-react';


/**
 * 🎨 LocationControls (Atómico)
 * Glassmorphism overlay para dirección y GPS.
 */
export const LocationControls = ({ isResolving, address, onUseMyLocation, isLocating }) => (
    <div className="absolute top-3 left-3 right-3 z-[999] flex items-start justify-between pointer-events-none">
        <div className="bg-[#0a0a0a]/70 backdrop-blur-md border border-transparent p-1.5 md:p-2 rounded-full flex items-center gap-2 px-3 md:px-4 shadow-lg pointer-events-auto max-w-[70%]">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isResolving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <div className="min-w-0">
                <p className="text-[10px] md:text-[11px] font-medium text-zinc-100 truncate">
                    {isResolving ? 'Buscando...' : address}
                </p>
            </div>
        </div>
        
        <button
            onClick={onUseMyLocation}
            className="p-2 md:p-2.5 bg-[#0a0a0a]/80 backdrop-blur-md border border-transparent rounded-xl text-zinc-400 shadow-lg hover:bg-zinc-800 hover:text-white transition-all pointer-events-auto group active:scale-90"
            title="Mi ubicación actual"
        >
            <Navigation size={14} className={`${isLocating ? 'animate-pulse text-emerald-400' : 'group-hover:text-emerald-400'}`} />
        </button>
    </div>
);

export default LocationControls;
