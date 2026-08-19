import React from 'react';
import MessageBox from '../ui/MessageBox';
import { Divider, GoogleButton } from '../ui/SocialButtons';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService'; // Conexión Real
import { useRegister } from '../../context/RegisterContext';
import { validateRegistrationPayload } from '../../utils/validationUtils';
import PasswordSecurityGroup from './PasswordSecurityGroup';

const FormClasses = {
    inputGroup: "space-y-0.5",
    input: "w-full px-3 py-2 bg-zinc-900/50 border border-transparent rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40 transition-all shadow-sm ",
    label: "text-[10px] font-medium text-zinc-400 uppercase tracking-wider ml-0.5"
};

const JobSeekerForm = () => {
    const navigate = useNavigate();
    const { setRole } = useRegister();

    // Estados para control de envío
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ message: null, type: null });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ message: null, type: null });

        const formData = new FormData(e.target);
        const fullName = formData.get('name')?.toString().trim();
        const email = formData.get('email')?.toString().trim();
        const password = formData.get('password')?.toString().trim();
        const confirmPassword = formData.get('confirmPassword')?.toString().trim();

        // Validación Centralizada SSOT
        const validation = validateRegistrationPayload({
            fullName,
            email,
            password,
            confirmPassword,
            role: 'postulante'
        });

        if (!validation.isValid) {
            setStatus({ message: validation.firstError, type: "error" });
            setIsLoading(false);
            return;
        }

        try {
            // REGISTRO REAL (Dispara el trigger en Supabase -> public.perfiles)
            const { session } = await authService.register(email, password, {
                full_name: fullName,
                rol: 'postulante'
            });

            if (session) {
                // ⚡ INSTANT REDIRECT
                navigate('/dashboard');
            } else {
                // Caso: Email Confirm activo
                setStatus({ message: "¡Casi listo! Revisa tu correo para confirmar la cuenta.", type: "success" });
            }

        } catch (error) {
            console.error("Register Error:", error);
            setStatus({ message: error.message || "Error al crear la cuenta.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await authService.loginWithGoogle('postulante');
        } catch (error) {
            console.error("Google Login Error:", error);
            setStatus({ message: "Error iniciando con Google.", type: "error" });
        }
    };

    return (
        <div className="w-full animate-fade-in">
            <GoogleButton
                onClick={handleGoogleLogin}
                role="button"
                tabIndex={0}
                onKeyDown={handleGoogleLogin} />
            <Divider text="o crea tu cuenta" />
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className={FormClasses.inputGroup}>
                    <label htmlFor="name" className={FormClasses.label}>Nombre Completo</label>
                    <input type="text" id="name" name="name" required className={FormClasses.input} placeholder="Juan Pérez" />
                </div>

                <div className={FormClasses.inputGroup}>
                    <label htmlFor="email" className={FormClasses.label}>Correo Electrónico</label>
                    <input type="email" id="email" name="email" required className={FormClasses.input} placeholder="juan@ejemplo.com" />
                </div>

                <PasswordSecurityGroup />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-primary hover:bg-emerald-500 text-white font-medium text-sm py-2.5 rounded-md transition duration-200 shadow-none border-none disabled:opacity-70 mt-2"
                    aria-label="Acción">
                    {isLoading ? "Creando..." : "Crear Cuenta"}
                </button>
            </form>
            {status.message && <MessageBox message={status.message} type={status.type} />}
        </div>
    );
};

export default JobSeekerForm;