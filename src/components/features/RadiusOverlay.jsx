import React from 'react';
import { Navigation } from 'lucide-react';


/**
 * 🛰️ RadiusOverlay
 * Floating control for the map radius. Simplified for UX/Mobile.
 */
const RadiusOverlay = ({ value, onChange, onRecenter }) => {
    return (
        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-[999] flex flex-col gap-2 pointer-events-none">
            {/* COMPACT CONTROL BOX */}
            <div className="bg-[#09090b]/90 backdrop-blur-xl border border-transparent p-3 rounded-2xl  w-[140px] md:w-[180px] pointer-events-auto animate-in fade-in slide-in-from-right-2 duration-500">
                <div className="flex justify-between items-center mb-2 px-0.5">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Radio</span>
                    <span className="text-sm font-black text-white">{value} km</span>
                </div>

                <input
                    type="range"
                    min="2"
                    max="20"
                    step="1"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all outline-none"
                />
                <div className="flex justify-between mt-1 px-0.5">
                    <span className="text-[8px] text-zinc-700">2km</span>
                    <span className="text-[8px] text-zinc-700">20km</span>
                </div>
            </div>

            {/* QUICK RECENTER BUTTON */}
            {onRecenter && (
                <button
                    onClick={onRecenter}
                    className="self-end bg-emerald-500 hover:bg-emerald-400 text-black p-2.5 rounded-xl  transition-all active:scale-95 pointer-events-auto flex items-center gap-2 group"
                >
                    <Navigation size={14} strokeWidth={3} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-wider pr-1">Mi GPS</span>
                </button>
            )}
        </div>
    );
};

export default RadiusOverlay;
