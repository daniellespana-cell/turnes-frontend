import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GoogleButton } from '../ui/SocialButtons';
import MessageBox from '../ui/MessageBox';
import TurnesButton from '../ui/TurnesButton';

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // 🛡️ Importamos useLocation
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/validationUtils';

// IMPORTACIONES UI

const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    // 🛡️ SENIOR FIX: Ya no necesitamos importar 'user' para observar el estado
    const { login, loginWithGoogle } = useAuth();

    // Recuperamos a dónde intentaba ir el usuario antes de ser expulsado al Login
    const from = new URLSearchParams(location.search).get('from') || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return; // Prevent double execution
        setIsLoading(true);
        setMessage(null);

        const formData = new FormData(e.target);
        const rawEmail = formData.get('email')?.toString() || '';
        const password = formData.get('password')?.toString() || '';

        const emailCheck = validateEmail(rawEmail);
        if (!emailCheck.isValid) {
            setMessage({ text: emailCheck.error, type: 'error' });
            setIsLoading(false);
            return;
        }

        if (!password) {
            setMessage({ text: 'Ingresa tu contraseña.', type: 'error' });
            setIsLoading(false);
            return;
        }

        try {
            // 1. Ejecutamos el login con email sanitizado
            await login(emailCheck.cleanEmail, password);
            localStorage.setItem('turnes_has_logged_in', 'true'); // Guardamos en caché que ya es usuario registrado

            // 2. Navegación Imperativa: Redirigimos EXACTAMENTE cuando la promesa se resuelve.
            navigate(from, { replace: true });

        } catch (error) {
            // Silenciado para producción: error?.message ya se envía al UI
            // Capturamos el mensaje exacto de Supabase o nuestro Contexto
            setMessage({ text: error?.message || 'Credenciales inválidas.', type: 'error' });
        } finally {
            // 3. LA RED DE SEGURIDAD: Pase lo que pase (éxito, error, o fallo de red), 
            // liberamos el botón. React 18 ignora este paso de forma segura si el componente ya se desmontó.
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            localStorage.setItem('turnes_has_logged_in', 'true'); // Guardamos antes del redirect
            await loginWithGoogle(null, true); 
        } catch (error) {
            setMessage({ text: "Error de conexión.", type: "error" });
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col gap-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                {/* EMAIL INPUT */}
                <div className="space-y-0.5">
                    <label htmlFor="email" className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider ml-0.5">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        defaultValue=""
                        required
                        autoComplete="email"
                        className="w-full px-4 py-3 md:py-3.5 bg-zinc-900/50 border border-transparent rounded-xl text-base text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40 transition-all shadow-sm "
                        placeholder="tu@email.com"
                    />
                </div>

                {/* PASSWORD INPUT */}
                <div className="space-y-0.5">
                    <div className="flex justify-between items-center px-0.5">
                        <label htmlFor="password" className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                            Contraseña
                        </label>
                        <Link
                            to="/forgot-password"
                            className="text-[10px] text-zinc-500 hover:text-white transition-colors"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            defaultValue=""
                            required
                            autoComplete="current-password"
                            className="w-full px-4 py-3 md:py-3.5 bg-zinc-900/50 border border-transparent rounded-xl text-base text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40 transition-all shadow-sm  pr-12"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                            aria-label="Acción">
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                </div>

                {/* MAIN ACTION */}
                <TurnesButton
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full !rounded-md !py-2 !text-sm !font-semibold normal-case tracking-normal shadow-none border-none hover:opacity-90 mt-1"
                    disabled={isLoading}
                >
                    {isLoading ? 'Iniciando...' : 'Iniciar sesión'}
                </TurnesButton>
            </form>
            {message && <MessageBox message={message.text} type={message.type} />}
            {/* SEPARATOR */}
            <div className="relative flex items-center py-3">
                <div className="flex-grow border-t border-zinc-800"></div>
                <span className="flex-shrink-0 mx-4 text-zinc-500 text-[11px] font-medium lowercase">o ingresa con</span>
                <div className="flex-grow border-t border-zinc-800"></div>
            </div>
            {/* SOCIAL */}
            <GoogleButton
                onClick={handleGoogleLogin}
                disabled={isLoading}
                role="button"
                tabIndex={0}
                onKeyDown={handleGoogleLogin} />
        </div>
    );
};

export default LoginForm;