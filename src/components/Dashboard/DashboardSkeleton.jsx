import React from 'react';


export const DashboardSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in font-manrope pb-20 pt-4 px-4 antialiased">

            {/* 0. Profile Banner Skeleton */}
            <div className="h-16 w-full bg-zinc-900/50 rounded-xl animate-pulse" />

            {/* 1. Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-3 w-full max-w-md">
                    <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
                    <div className="h-10 w-3/4 bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="flex gap-4">
                    <div className="h-12 w-32 bg-zinc-800 rounded-xl animate-pulse" />
                    <div className="h-12 w-12 bg-zinc-800 rounded-xl animate-pulse" />
                </div>
            </div>

            {/* 2. QuickStart Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-32 bg-zinc-900/50 rounded-2xl animate-pulse border border-transparent" />
                <div className="h-32 bg-zinc-900/50 rounded-2xl animate-pulse border border-transparent" />
            </div>

            {/* 3. Priority Block Skeleton */}
            <div className="h-24 w-full bg-zinc-900/30 rounded-2xl animate-pulse" />

            {/* Main Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Column */}
                <div className="lg:col-span-8 space-y-16">
                    {/* Solutions Lobby Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="h-40 bg-zinc-900/50 rounded-2xl animate-pulse" />
                        <div className="h-40 bg-zinc-900/50 rounded-2xl animate-pulse" />
                    </div>

                    {/* Process List Skeleton */}
                    <div className="space-y-4">
                        <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-20 w-full bg-zinc-900/30 rounded-xl animate-pulse border border-transparent" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column (Sidebar) */}
                <aside className="lg:col-span-4 space-y-8">
                    <div className="h-64 bg-zinc-900/50 rounded-2xl animate-pulse border border-transparent" />
                    <div className="h-48 bg-zinc-900/50 rounded-2xl animate-pulse border border-transparent" />
                    <div className="h-40 bg-zinc-900/50 rounded-2xl animate-pulse border border-transparent" />
                </aside>

            </div>
        </div>
    );
};

export default DashboardSkeleton;
