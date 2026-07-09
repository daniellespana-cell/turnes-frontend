import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../../components/forms/LoginForm';
import AuthNavbar from '../../components/layout/AuthNavbar';
import AntigravityBackground from '../../components/layout/AntigravityBackground';

// 🛡️ SENIOR FIX: Importamos Link

const LoginPage = () => {
    const [isFirstTime, setIsFirstTime] = useState(false);

    useEffect(() => {
        // Chequeo heurístico inteligente en caché
        let isKnownUser = !!localStorage.getItem('turnes_has_logged_in');
        
        if (!isKnownUser) {
            // Buscamos rastros de sesiones previas de Supabase (sb-...) o de la app
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('turnes'))) {
                    isKnownUser = true;
                    // Migración silenciosa para la próxima vez
                    localStorage.setItem('turnes_has_logged_in', 'true');
                    break;
                }
            }
        }

        if (!isKnownUser) {
            setIsFirstTime(true);
        }
    }, []);
    return (
        <div className="min-h-screen w-full bg-[#09090b] font-manrope antialiased flex flex-col items-center justify-center text-white selection:bg-emerald-500/30 relative overflow-hidden">

            {/* --- ANTIGRAVITY ANIMATED BACKGROUND --- */}
            <AntigravityBackground />

            {/* --- NAVBAR --- */}
            <AuthNavbar />

            {/* --- MAIN CONTENT --- */}
            <div className="w-full max-w-[340px] relative z-10 flex flex-col gap-6 animate-fade-in-up p-4">

                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                        Bienvenido
                    </h2>
                    <p className="text-zinc-400 text-base md:text-lg">
                        Ingresa a tu espacio de trabajo.
                    </p>
                </div>

                {isFirstTime && (
                    <div className="bg-emerald-500/15 border-2 border-emerald-500/30 rounded-2xl p-4 md:p-5 text-center animate-fade-in shadow-lg">
                        <p className="text-emerald-400 text-base md:text-lg font-medium leading-relaxed">
                            ¿Primera vez en Turnes?{' '}
                            <Link to="/auth/tipo-registro" className="font-extrabold underline decoration-2 underline-offset-4 text-emerald-300 hover:text-white transition-colors">
                                Escoge tu rol y regístrate
                            </Link>
                        </p>
                    </div>
                )}

                <div className="w-full">
                    {/* El bug de "Iniciando..." vive dentro de este componente. 
                      Seguramente le falta un bloque 'finally' para apagar el loading si falla la red.
                    */}
                    <LoginForm />
                </div>

                {/* LEGAL FOOTER */}
                <div className="text-center space-y-3">
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-[300px] mx-auto">
                        Al continuar, aceptas nuestros{' '}
                        {/* 🛡️ SENIOR FIX: Usamos <Link> en lugar de <a> */}
                        <Link to="/terminos" className="text-zinc-300 hover:text-emerald-400 underline font-medium transition-colors">
                            Términos
                        </Link>{' '}
                        y{' '}
                        <Link to="/privacidad" className="text-zinc-300 hover:text-emerald-400 underline font-medium transition-colors">
                            Política de Privacidad
                        </Link>.
                    </p>
                    <div className="text-xs font-medium text-zinc-600">
                        Turnes™ © 2026
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;