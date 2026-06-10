import React from 'react';


const UpgradeSkeleton = () => {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto relative z-10 mb-16">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-[480px] rounded-3xl bg-zinc-900/40 animate-pulse border border-transparent backdrop-blur-xl" />
                ))}
            </div>
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 rounded-2xl bg-zinc-900/40 animate-pulse border border-transparent backdrop-blur-xl" />
                    ))}
                </div>
            </div>
        </>
    );
};

export default UpgradeSkeleton;
