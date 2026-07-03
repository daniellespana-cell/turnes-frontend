import React from 'react';
import { Outlet } from 'react-router-dom';
import BaseSidebar from './BaseSidebar';
import AppNavbar from './AppNavbar';

import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { WORKER_MENU } from '../../config/navigation.config';

const WorkerLayout = ({ user }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    const isChat = location.pathname.includes('/chat');

    // Mismo patrón "Clean Layout" que BusinessLayout
    return (
        <div className="flex min-h-[100dvh] bg-[#0a0a0a] relative">
            <BaseSidebar
                menuItems={WORKER_MENU}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 w-full">
                {/* Ocultamos AppNavbar en modo Chat para permitir UX Edge-to-Edge nativa */}
                {!isChat && (
                    <AppNavbar
                        user={user}
                        isSidebarExpanded={isExpanded}
                        onOpenMobileSidebar={() => setIsMobileOpen(true)}
                    />
                )}

                <main 
                    className={`flex-1 flex flex-col min-w-0 w-full ${isChat ? 'pt-0 pb-0 px-0' : 'pt-24 pb-12 px-4 sm:px-6 lg:px-10'}`}
                    style={{ paddingTop: isChat ? 'env(safe-area-inset-top)' : 'calc(6rem + env(safe-area-inset-top))' }}
                >
                    <div className={`flex-1 flex flex-col min-w-0 w-full ${isChat ? 'h-full' : 'max-w-6xl mx-auto'}`}>
                        <Outlet context={{ user }} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default WorkerLayout;
