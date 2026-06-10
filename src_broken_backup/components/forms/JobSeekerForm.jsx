import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService'; // Conexión Real
import { useRegister } from '../../context/RegisterContext';
import { validatePasswordStrength } from '../../utils/validationUtils';

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

        if (password !== confirmPassword) {
            setStatus({ message: "Las contraseñas no coinciden", type: "error" });
            setIsLoading(false);
            return;
        }

        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            setStatus({ message: passwordValidation.error, type: "error" });
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
            <GoogleButton onClick={handleGoogleLogin} />
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

                <div className="grid grid-cols-2 gap-3">
                    <div className={FormClasses.inputGroup}>
                        <label htmlFor="password" className={FormClasses.label}>Contraseña</label>
                        <input type="password" id="password" name="password" required className={FormClasses.input} placeholder="******" />
                        <p className="text-[9px] text-zinc-500 mt-1 ml-1 leading-tight">Mín. 8 caracteres, 1 mayúscula, 1 número y 1 símbolo.</p>
                    </div>

                    <div className={FormClasses.inputGroup}>
                        <label htmlFor="confirmPassword" className={FormClasses.label}>Confirmar</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required className={FormClasses.input} placeholder="******" />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-primary hover:bg-emerald-500 text-white font-medium text-sm py-2.5 rounded-md transition duration-200 shadow-none border-none disabled:opacity-70 mt-2"
                >
                    {isLoading ? "Creando..." : "Crear Cuenta"}
                </button>
            </form>

            {status.message && <MessageBox message={status.message} type={status.type} />}
        </div>
    );
};

export default JobSeekerForm;