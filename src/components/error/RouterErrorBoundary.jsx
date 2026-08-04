import React, { useEffect } from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { TriangleAlert, RefreshCcw, Home } from 'lucide-react';
import turnesLogo from "../../assets/logo-turnes.png";

export const RouterErrorBoundary = () => {
    const error = useRouteError();
    const navigate = useNavigate();

    useEffect(() => {
        // Auto-reload para errores de carga de chunks (caché vieja tras un deploy)
        if (
            error?.message?.includes('Failed to fetch dynamically imported module') ||
            error?.message?.includes('Importing a module script failed') ||
            error?.name === 'ChunkLoadError'
        ) {
            const hasReloaded = sessionStorage.getItem('chunk_reload');
            if (!hasReloaded) {
                console.warn('ChunkLoadError detectado. Limpiando Service Workers y forzando recarga...');
                sessionStorage.setItem('chunk_reload', 'true');
                
                // Desregistrar Service Workers para romper el caché infinito
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(function(registrations) {
                        for(let registration of registrations) {
                            registration.unregister();
                        }
                        window.location.reload();
                    });
                } else {
                    window.location.reload();
                }
            } else {
                console.error('El reload automático falló. El usuario debe vaciar la caché manualmente.');
                // Limpiamos la bandera para el futuro si el usuario recarga manual
                sessionStorage.removeItem('chunk_reload');
            }
        }
    }, [error]);

    return (
        <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center p-4 font-manrope selection:bg-emerald-500/30 text-white relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
                <img src={turnesLogo} alt="Turnes" className="h-8 opacity-50 grayscale" />
                
                <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center relative shadow-[0_0_40px_rgba(239,68,68,0.15)]">
                    <TriangleAlert size={40} className="text-red-400" />
                </div>
                
                <div className="space-y-3">
                    <h1 className="text-3xl font-black tracking-tight text-white">Algo salió mal</h1>
                    <p className="text-sm text-zinc-400 leading-relaxed max-w-[320px] mx-auto">
                        Hemos detectado un error inesperado al cargar esta página.
                    </p>
                    <p className="text-xs text-zinc-600 font-mono mt-2 bg-zinc-900/50 p-2 rounded-lg text-left overflow-hidden text-ellipsis">
                        {error?.message || 'Unknown error'}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors active:scale-95"
                        type="button"
                        aria-label="Acción">
                        <RefreshCcw size={16} />
                        Recargar Página
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 border border-white/10 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors active:scale-95"
                        type="button"
                        aria-label="Acción">
                        <Home size={16} />
                        Ir al Inicio
                    </button>
                </div>
            </div>
        </div>
    );
};
