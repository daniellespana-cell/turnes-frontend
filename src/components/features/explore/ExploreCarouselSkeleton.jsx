import React from 'react';
import { m as motion } from 'framer-motion';


const ExploreCarouselSkeleton = () => (
    <motion.div
        key="loading"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="space-y-10 pt-4"
        role="status"
        aria-label="Cargando vacantes"
    >
        {[1, 2].map(n => (
            <div key={n}>
                <div className="h-5 w-36 bg-zinc-800/60 rounded-full mb-5 animate-pulse" />
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-[280px] md:w-[320px] shrink-0 h-[240px] bg-zinc-900/50 rounded-2xl border border-transparent animate-pulse" />
                    ))}
                </div>
            </div>
        ))}
    </motion.div>
);

export default ExploreCarouselSkeleton;
