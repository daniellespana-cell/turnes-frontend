import React from 'react';
import Spinner from '../../components/ui/Spinner';

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, refreshSession } = useAuth();
    const { showToast } = useToast();
    const [statusMessage, setStatusMessage] = useState("Autenticando de forma segura...");

    useEffect(() => {
        let isMounted = true;

        const handleAuthFlow = async () => {
            try {
                // 🛡️ 0. CANJE DE CÓDIGO PKCE (Confirmación de Email y Activación)
                const code = searchParams.get('code');
                if (code) {
                    const { data, error } = await authService.exchangeCodeForSession(code);
                    if (!error && data?.session) {
                        await refreshSession();
                        if (isMounted) {
                            navigate('/dashboard', { replace: true });
                        }
                        return;
                    }
                }

                // 🛡️ 1. INTERCEPTOR DE ERRORES / ESCÁNERES DE CORREO
                // Si un escáner de correo o doble clic consumió el token, verificamos si ya existe sesión activa
                const hash = window.location.hash;
                const hashParams = hash && hash.includes('error=') ? new URLSearchParams(hash.substring(1)) : null;
                const errorCode = searchParams.get('error_code') || hashParams?.get('error_code');

                if (errorCode === 'otp_expired') {
                    const currentSession = await authService.getSession();
                    if (currentSession) {
                        await refreshSession();
                        if (isMounted) {
                            navigate('/dashboard', { replace: true });
                        }
                        return;
                    }

                    if (isMounted) {
                        showToast("Tu cuenta ya fue activada. Por favor inicia sesión con tu contraseña.", 'info');
                        navigate('/login', { replace: true });
                    }
                    return;
                }

                // 🛡️ 2. GESTIÓN DE SESIÓN GOOGLE OAUTH Y ROLES (Lógica Existente Preservada)
                if (user) {
                    const rawRole = searchParams.get('role');
                    const role = ['empresa', 'trabajador'].includes(rawRole) ? rawRole : null;

                    // Si traía rol explícito en OAuth, sincronizar
                    if (role && (user.needs_onboarding || user.role !== role)) {
                        if (isMounted) setStatusMessage(`Configurando permisos de ${role}...`);
                        await authService.setRoleAfterOAuth(role);
                        await refreshSession();
                        if (isMounted) navigate('/dashboard', { replace: true });
                        return;
                    }

                    // Muro de Identidad para usuarios sin rol
                    if (user.needs_onboarding) {
                        if (isMounted) {
                            showToast("¡Bienvenido a Turnes! Selecciona tu rol para continuar.", 'info');
                            navigate('/register', { replace: true });
                        }
                        return;
                    }

                    // Flujo Regular directo al Dashboard
                    if (isMounted) navigate('/dashboard', { replace: true });
                }

            } catch (err) {
                console.error('[AuthCallback] Error en flujo de autenticación:', err);
                if (isMounted) navigate('/login', { replace: true });
            }
        };

        handleAuthFlow();

        return () => { isMounted = false; };
    }, [user, searchParams, navigate, refreshSession, showToast]);

    return (
        <div className="h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center space-y-4 font-manrope">
            <Spinner size="lg" variant="emerald" text={statusMessage} />
        </div>
    );
};

export default AuthCallback;
