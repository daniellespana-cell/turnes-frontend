import React from 'react';
import { MapPinOff } from 'lucide-react';
import ProfileBanner from '../../components/Dashboard/ProfileBanner';
import EliteBanner from '../../components/Dashboard/EliteBanner';
import HeroStatsRing from '../../components/worker-dashboard/HeroStatsRing';
import SkillMatchRadar from '../../components/worker-dashboard/SkillMatchRadar';
import QuickStatsStrip from '../../components/worker-dashboard/QuickStatsStrip';
import ActivityFeed from '../../components/worker-dashboard/ActivityFeed';
import DailyTip from '../../components/worker-dashboard/DailyTip';
import TodayMission from '../../components/worker-dashboard/TodayMission';
import RecommendedSection from '../../components/worker-dashboard/RecommendedSection';
import LocationHint from '../../components/common/LocationHint';

import { useWorkerDashboard } from '../../hooks/useWorkerDashboard';
import { useWorkerStats } from '../../hooks/useWorkerStats';
import { useSkillMatchCompanies } from '../../hooks/useSkillMatchCompanies';

// UI Components

// Dashboard Widgets (Modular Architecture)

/**
 * GpsWarning — Sub-component simple para alertas de sistema.
 */
const GpsWarning = () => (
    <div className="flex items-center gap-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-2.5">
        <MapPinOff size={13} className="text-amber-400 shrink-0" />
        <p className="text-[11px] text-amber-300 font-medium">
            <span className="font-bold">GPS desactivado.</span> Activa tu ubicación para ver vacantes cerca de ti.
        </p>
    </div>
);

/**
 * WorkerDashboard (Orchestrator)
 * Responsabilidad: Componer widgets y proveer datos vía Hooks.
 */
const WorkerDashboard = () => {
    const { 
        user, recommendationsLoading, priorityAction, gpsDenied, 
        appliedIds, locationMode, cityName
    } = useWorkerDashboard();
    
    const { stats, loading: statsLoading } = useWorkerStats();
    const { companies, loading: companiesLoading } = useSkillMatchCompanies();

    // 🚀 LCP Optimization: ELIMINADO EL SPINNER GLOBAL
    // El dashboard se renderiza inmediatamente. La estructura base no espera a la BD.

    return (
        <div className="max-w-md mx-auto md:max-w-5xl pb-24 pt-4 min-h-screen font-manrope space-y-5 animate-fade-in px-4 md:px-0 w-full min-w-0">

            {/* 1. WELCOME HEADER (Aparece al instante) */}
            <header className="flex justify-between items-end">
                <div>
                    <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-1">
                        Command Center
                    </p>
                    <h1 className="text-2xl md:text-3xl font-light text-white tracking-tight">
                        Hola, <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            {user?.name?.split(' ')[0] || 'Talento'}
                        </span>
                    </h1>
                </div>
            </header>

            {/* 2. SYSTEM ALERTS */}
            <ProfileBanner />
            <EliteBanner userName={user?.name} />
            <LocationHint locationMode={locationMode} cityName={cityName} />
            {gpsDenied && locationMode !== 'profile' && <GpsWarning />}

            {/* 3. WIDGET GRID (Upper Body) */}
            <main className="space-y-5 md:grid md:grid-cols-2 md:gap-5 md:space-y-0">
                {/* Left: Financial & Progress */}
                <div className="space-y-5">
                    <HeroStatsRing
                        stats={stats}
                        avatarUrl={user?.avatar_url}
                        userName={user?.name}
                        loading={statsLoading}
                    />
                    <QuickStatsStrip stats={stats} loading={statsLoading} />
                    <DailyTip stats={stats} loading={statsLoading} />
                </div>

                {/* Right: Networking & Activity */}
                <div className="space-y-5">
                    <SkillMatchRadar companies={companies} loading={companiesLoading} />
                    <ActivityFeed />
                </div>
            </main>

            {/* 4. DYNAMIC PRIORITY CONTENT (Lower Body) */}
            <TodayMission priorityAction={priorityAction} loading={recommendationsLoading} />
            
            <RecommendedSection 
                priorityAction={priorityAction} 
                appliedIds={appliedIds} 
                loading={recommendationsLoading}
            />
        </div>
    );
};

export default WorkerDashboard;
