import React from 'react';

const VacancySkeleton = () => {
    return (
        <div className="relative overflow-hidden bg-[#09090b] border border-white/5 rounded-2xl p-4 space-y-4">
            {/* Shimmer Effect Global */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent z-10" />

            {/* Header: Avatar + Title */}
            <div className="flex justify-between items-start relative">
                <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-zinc-800/50" />
                    {/* Texts */}
                    <div className="space-y-2">
                        <div className="h-3 w-32 bg-zinc-800/50 rounded-full" />
                        <div className="h-2 w-20 bg-zinc-800/50 rounded-full" />
                    </div>
                </div>
                {/* Badge */}
                <div className="w-16 h-6 rounded-full bg-zinc-800/50" />
            </div>

            {/* Chips Row */}
            <div className="flex gap-2">
                <div className="h-5 w-16 bg-zinc-800/50 rounded-md" />
                <div className="h-5 w-16 bg-zinc-800/50 rounded-md" />
            </div>

            {/* Description Lines */}
            <div className="space-y-2 pt-2">
                <div className="h-2 w-full bg-zinc-800/30 rounded-full" />
                <div className="h-2 w-3/4 bg-zinc-800/30 rounded-full" />
            </div>

            {/* Footer: Price + Button */}
            <div className="flex items-end justify-between pt-2 border-t border-white/5 mt-4">
                <div className="space-y-1">
                    <div className="h-2 w-10 bg-zinc-800/30 rounded-full" />
                    <div className="h-4 w-20 bg-zinc-800/50 rounded-full" />
                </div>
                <div className="h-9 w-24 bg-zinc-800/50 rounded-xl" />
            </div>
        </div>
    );
};

export default VacancySkeleton;
