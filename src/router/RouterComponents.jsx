import { Outlet } from 'react-router-dom';
import { ScrollRestoration } from 'react-router-dom';
import Spinner from '../components/ui/Spinner';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { PATHS } from '../config/routes.paths';

// Loading Component (Full Screen - ONLY for Boot)
export const GlobalLoading = () => (
    <div className="h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center space-y-4 font-manrope">
        <Spinner size="xl" variant="emerald" text="Sincronizando Turnes..." />
    </div>
);

// Loading Component (Inline - for Navigation)
export const PageLoadingBar = () => (
    <div className="fixed top-0 left-0 w-full h-[3px] bg-emerald-500/20 z-[9999] overflow-hidden">
        <div className="h-full bg-emerald-500 animate-[loading-bar_1.5s_infinite_linear] shadow-[0_0_10px_#10b981]"></div>
        <style>{`
            @keyframes loading-bar {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        `}</style>
    </div>
);

/**
 * GLOBAL AUTH LISTENER
 * Escucha cambios de estado de Supabase para navegación reactiva (ej: logout).
 */
export const GlobalAuthListener = () => {
    const navigate = useNavigate();
    React.useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'PASSWORD_RECOVERY') navigate(PATHS.PUBLIC.UPDATE_PASSWORD);
            if (event === 'SIGNED_OUT') navigate(PATHS.PUBLIC.LOGIN, { replace: true });
        });
        return () => subscription.unsubscribe();
    }, [navigate]);
    return (
        <>
            <ScrollRestoration />
            <Outlet />
        </>
    );
};
