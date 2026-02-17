import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// IMPORTACIONES UI
import GoogleButton from '../ui/GoogleButton';
import MessageBox from '../ui/MessageBox';
import TurnesButton from '../ui/TurnesButton';

const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const navigate = useNavigate();
    const { login, loginWithGoogle } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            await login(email, password);
            // ⚡ INSTANT REDIRECT (Speed > Feedback)
            navigate('/dashboard');
        } catch (error) {
            console.error("Login Error:", error);
            setMessage({ text: "Credenciales inválidas.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            await loginWithGoogle();
        } catch (error) {
            console.error("Error Google:", error);
            setMessage({ text: "Error de conexión.", type: "error" });
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col gap-4">

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                {/* EMAIL INPUT (Subtle) */}
                <div className="space-y-0.5">
                    <label htmlFor="email" className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider ml-0.5">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        defaultValue="empresa@turnes.app"
                        required
                        className="w-full px-3 py-2 bg-zinc-900/50 border border-white/5 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40 transition-all shadow-sm hover:border-white/10"
                        placeholder="tu@email.com"
                    />
                </div>

                {/* PASSWORD INPUT (Subtle) */}
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
                            defaultValue="123456"
                            required
                            className="w-full px-3 py-2 bg-zinc-900/50 border border-white/5 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40 transition-all shadow-sm hover:border-white/10 pr-10"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                        >
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
            <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-zinc-800"></div>
                <span className="flex-shrink-0 mx-3 text-zinc-600 text-[10px]">O</span>
                <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            {/* SOCIAL */}
            <GoogleButton onClick={handleGoogleLogin} disabled={isLoading} />
        </div>
    );
};

export default LoginForm;