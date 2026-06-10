import React from 'react';
import MessageBox from '../ui/MessageBox';
import { Divider, GoogleButton } from '../ui/SocialButtons';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService'; // Conexión Real
import { validatePasswordStrength } from '../../utils/validationUtils';

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

        // 1. Validation: Passwords Match
        if (password !== confirmPassword) {
            setStatus({ message: "Las contraseñas no coinciden.", type: "error" });
            setIsLoading(false);
            return;
        }

        // 2. Validation: Password Strength (Strict)
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            setStatus({ message: passwordValidation.error, type: "error" });
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
            <GoogleButton onClick={handleGoogleLogin} label="Regístrate con Google" />
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

                {/* PASSWORD GRID */}
                <div className="grid grid-cols-2 gap-3">
                    <div className={FormClasses.inputGroup}>
                        <label htmlFor="password" className={FormClasses.label}>Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            className={FormClasses.input}
                            placeholder="••••••••"
                        />
                        <p className="text-[9px] text-zinc-500 mt-1 ml-1 leading-tight">Mín. 8 caracteres, 1 mayúscula, 1 número y 1 símbolo.</p>
                    </div>
                    <div className={FormClasses.inputGroup}>
                        <label htmlFor="confirmPassword" className={FormClasses.label}>Confirmar</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            required
                            className={FormClasses.input}
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-primary hover:bg-emerald-500 text-white font-medium text-sm py-2.5 rounded-md transition duration-200 shadow-none border-none disabled:opacity-70 mt-2"
                >
                    {isLoading ? "Creando..." : "Registrar Empresa"}
                </button>
            </form>

            {status.message && <MessageBox message={status.message} type={status.type} />}
        </div>
    );
};

export default CompanyForm;
