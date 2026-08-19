import React from 'react';
import MessageBox from '../ui/MessageBox';
import { Divider, GoogleButton } from '../ui/SocialButtons';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService'; // Conexión Real
import { validateRegistrationPayload } from '../../utils/validationUtils';
import PasswordSecurityGroup from './PasswordSecurityGroup';

const FormClasses = {
    inputGroup: "space-y-0.5", // Tighter label spacing
    input: "w-full px-3 py-2 bg-zinc-900/50 border border-transparent rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40 transition-all shadow-sm ",
    label: "text-[10px] font-medium text-zinc-400 uppercase tracking-wider ml-0.5" // More subtle label
};

const CompanyForm = () => {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ message: null, type: null });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ message: null, type: null });

        const formData = new FormData(e.target);
        const companyName = formData.get('companyName')?.toString().trim();
        const email = formData.get('contactEmail')?.toString().trim();
        const password = formData.get('password')?.toString().trim();
        const confirmPassword = formData.get('confirmPassword')?.toString().trim();

        // Validación Centralizada SSOT
        const validation = validateRegistrationPayload({
            fullName: companyName,
            email,
            password,
            confirmPassword,
            role: 'empresa'
        });

        if (!validation.isValid) {
            setStatus({ message: validation.firstError, type: "error" });
            setIsLoading(false);
            return;
        }

        /* 
           3. Domain Validation (Optional / "Soft" block)
           Allows gmail/hotmail but could warn user. Currently permissive.
        */

        try {
            // REGISTRO REAL (Dispara trigger -> public.empresas)
            const { session } = await authService.register(email, password, {
                rol: 'empresa',
                full_name: companyName,
                nombre_comercial: companyName, // Mapping consistency
                companyName
            });

            if (session) {
                // ⚡ INSTANT REDIRECT: Don't wait for "Success" message
                navigate('/dashboard');
            } else {
                setStatus({ message: "Registro exitoso. Revisa tu email para confirmar.", type: "success" });
            }

        } catch (error) {
            console.error("Register Error:", error);
            setStatus({ message: error.message || "Error al registrar la empresa.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await authService.loginWithGoogle('empresa');
        } catch (error) {
            console.error("Google Login Error:", error);
            setStatus({ message: "Error iniciando con Google.", type: "error" });
        }
    };

    return (
        <div className="w-full animate-fade-in">
            {/* SOCIAL TOP */}
            <GoogleButton
                onClick={handleGoogleLogin}
                label="Regístrate con Google"
                role="button"
                tabIndex={0}
                onKeyDown={handleGoogleLogin} />
            <Divider text="o registra tu empresa" />
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                {/* COMPANY NAME */}
                <div className={FormClasses.inputGroup}>
                    <label htmlFor="companyName" className={FormClasses.label}>Nombre de la Empresa</label>
                    <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        required
                        className={FormClasses.input}
                        placeholder="Ej. Tech Solutions"
                    />
                </div>

                {/* EMAIL */}
                <div className={FormClasses.inputGroup}>
                    <label htmlFor="contactEmail" className={FormClasses.label}>Email Corporativo</label>
                    <input
                        type="email"
                        id="contactEmail"
                        name="contactEmail"
                        required
                        className={FormClasses.input}
                        placeholder="contacto@empresa.com"
                    />
                </div>

                {/* PASSWORD GRID WITH LIVE FEEDBACK */}
                <PasswordSecurityGroup />

                {/* SUBMIT BUTTON */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-primary hover:bg-emerald-500 text-white font-medium text-sm py-2.5 rounded-md transition duration-200 shadow-none border-none disabled:opacity-70 mt-2"
                    aria-label="Acción">
                    {isLoading ? "Creando..." : "Registrar Empresa"}
                </button>
            </form>
            {status.message && <MessageBox message={status.message} type={status.type} />}
        </div>
    );
};

export default CompanyForm;
