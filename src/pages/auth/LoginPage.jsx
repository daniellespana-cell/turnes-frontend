import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../../components/forms/LoginForm';
import AuthNavbar from '../../components/layout/AuthNavbar';
import AntigravityBackground from '../../components/layout/AntigravityBackground';

// 🛡️ SENIOR FIX: Importamos Link

const LoginPage = () => {
    const [isFirstTime, setIsFirstTime] = useState(false);

    useEffect(() => {
        // Chequeo rápido en caché para ver si el usuario ya ha interactuado antes
        const hasLoggedIn = localStorage.getItem('turnes_has_logged_in');
        if (!hasLoggedIn) {
            setIsFirstTime(true);
        }
    }, []);
    return (
        <div className="min-h-screen w-full bg-[#09090b] font-sans flex flex-col items-center justify-center text-white selection:bg-emerald-500/30 relative overflow-hidden">

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
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-center animate-fade-in">
                        <p className="text-emerald-400 text-sm font-medium">
                            ¿Primera vez en Turnes?{' '}
                            <Link to="/auth/tipo-registro" className="font-bold underline text-emerald-300">
                                Regístrate aquí primero
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