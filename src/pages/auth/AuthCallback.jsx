import React from 'react';
import Spinner from '../../components/ui/Spinner';

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { authService } from '../../services/authService';
import { supabase } from '../../services/supabaseClient';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, refreshSession } = useAuth();

    // UI State for smooth transitions
    const [statusMessage, setStatusMessage] = useState("Autenticando de forma segura...");

    useEffect(() => {
        let isMounted = true;

        // 🛡️ 0. PKCE CODE EXCHANGE (Confirmación de Email — Supabase PKCE Flow)
        // Supabase envía ?code=xxx en la URL al confirmar email.
        // Debemos canjearlo por una sesión real ANTES de cualquier otra lógica.
        const code = searchParams.get('code');
        if (code) {
            supabase.auth.exchangeCodeForSession(code)
                .then(({ error }) => {
                    if (!isMounted) return;
                    if (error) {
                        toast.error("El enlace de confirmación expiró o ya fue usado. Solicita uno nuevo.", { id: 'pkce-error', duration: 8000 });
                        navigate('/login', { replace: true });
                    }
                    // Si tuvo éxito, onAuthStateChange en AuthContext dispara automáticamente
                    // y setUser se actualiza → el useEffect de abajo con [user] se encarga del redirect
                })
                .catch(() => {
                    if (isMounted) navigate('/login', { replace: true });
                });
            return;
        }

        // 🛡️ 1. INTERCEPTOR DE ERRORES EN LA URL (OTP Expirado, Link Inválido)
        const hash = window.location.hash;
        if (hash && hash.includes('error=')) {
            const hashParams = new URLSearchParams(hash.substring(1));
            const errorCode = hashParams.get('error_code');
            const errorDesc = hashParams.get('error_description') || hashParams.get('error');
            
            // 🔥 FIX UX: Si el usuario ya está autenticado (ej. doble clic al enlace o escáner de correos),
            // ignoramos el error de expiración y lo redirigimos silenciosamente al dashboard.
            if (errorCode === 'otp_expired' && user) {
                navigate('/dashboard', { replace: true });
                return;
            }

            let mensajeAmigable = decodeURIComponent(errorDesc).replace(/\+/g, ' ');
            
            if (errorCode === 'otp_expired') {
                mensajeAmigable = "El enlace de seguridad ha expirado, ya fue utilizado o tu gestor de correos lo invalidó por seguridad. Intenta iniciar sesión de nuevo.";
            }

            toast.error(mensajeAmigable, { id: 'auth-hash-error', duration: 8000 });
            setStatusMessage("Redirigiendo...");
            navigate('/login', { replace: true });
            return;
        }

        // 🛡️ 2. GESTIÓN DE SESIÓN
        const handleOAuthSync = async () => {
            const rawRole = searchParams.get('role');
            const action = searchParams.get('action'); // 'login_only'

            // Validación estricta del rol para prevenir inyección de parámetros (Security)
            const role = ['empresa', 'trabajador'].includes(rawRole) ? rawRole : null;

            if (!user) return; // Paranoia check

            // ========================================================
            // 🎯 FLUJO DE INTENCIÓN EXPLÍCITA (Mata la Amnesia)
            // ========================================================
            // Si el usuario traía un rol en la URL (ej: clic explícito en botón de Google como Empresa),
            // lo respetamos y completamos su onboarding automáticamente.
            if (role && (user.needs_onboarding || user.role !== role)) {
                try {
                    if (isMounted) setStatusMessage(`Configurando permisos de ${role}...`);
                    await authService.setRoleAfterOAuth(role);
                    
                    await refreshSession();
                    if (isMounted) navigate('/dashboard', { replace: true });
                } catch (error) {
                    console.error('[AuthCallback] Sincronización fallida:', error);
                    if (isMounted) {
                        toast.error("Hubo un problema verificando tu rol. Por favor confírmalo manualmente.", { id: 'auth-callback-error' });
                        navigate('/register', { replace: true });
                    }
                }
                return;
            }

            // ========================================================
            // 🧱 MURO DE IDENTIDAD (El Guardián)
            // ========================================================
            // Si entró directo sin rol y es 'pendiente', va al registro.
            if (user.needs_onboarding) {
                if (isMounted) {
                    toast.info("¡Bienvenido a Turnes! Selecciona tu rol para continuar.", { id: 'auth-callback-welcome', duration: 5000 });
                    navigate('/register', { replace: true });
                }
                return;
            }

            // ========================================================
            // 🚶 FLUJO REGULAR (Login exitoso)
            // ========================================================
            if (isMounted) navigate('/dashboard', { replace: true });
        };

        if (user) {
            handleOAuthSync();
        }

        return () => { isMounted = false; };
    }, [user, searchParams, navigate, refreshSession]);

    return (
        <div className="h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center space-y-4 font-manrope">
            <Spinner size="lg" variant="emerald" text={statusMessage} />
        </div>
    );
};

export default AuthCallback;
