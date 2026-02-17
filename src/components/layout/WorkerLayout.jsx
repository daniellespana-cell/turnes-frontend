import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import WorkerSidebar from './WorkerSidebar';
import AppNavbar from './AppNavbar';

const WorkerLayout = ({ user }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    // Mismo patrón "Clean Layout" que BusinessLayout
    return (
        <div className="flex min-h-screen bg-[#0a0a0a] relative">
            <WorkerSidebar
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 w-full">
                {/* Reutilizamos AppNavbar pero el usuario inyectará la lógica de Worker */}
                <AppNavbar
                    user={user}
                    isSidebarExpanded={isExpanded}
                    onOpenMobileSidebar={() => setIsMobileOpen(true)}
                />

                <main className={`flex-1 ${location.pathname.includes('/chat') ? 'pt-20 pb-0 px-0' : 'pt-24 pb-12 px-4 sm:px-6 lg:px-10'}`}>
                    <div className={location.pathname.includes('/chat') ? 'w-full h-full' : 'max-w-6xl mx-auto'}>
                        <Outlet context={{ user }} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default WorkerLayout;
