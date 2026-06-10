import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';

/**
 * Hook para manejar la lógica de recuperación de contraseña.
 * Separa la UI de la lógica de negocio y estado.
 */
export const useForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type, text }
    const [isSent, setIsSent] = useState(false);
    const [cooldown, setCooldown] = useState(0); // ⏳ Rate Limiting

    // Countdown Logic
    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (message) setMessage(null); // Limpiar error al escribir
    };

    const submitRequest = async (e) => {
        e.preventDefault();

        // 🛡️ Rate Limit Check
        if (cooldown > 0) {
            setMessage({ type: 'error', text: `Por favor espera ${cooldown}s para reintentar.` });
            return;
        }

        if (!email || !email.includes('@')) {
            setMessage({ type: 'error', text: 'Por favor ingresa un email válido.' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            await authService.recoverPassword(email);
            setIsSent(true);
            setCooldown(60); // ⏳ Start Cooldown
            setMessage({
                type: 'success',
                text: 'Enlace enviado correctamente.'
            });
        } catch (error) {
            console.error("Recovery Logic Error:", error);
            setMessage({
                type: 'error',
                text: 'No pudimos encontrar ese usuario o hubo un error.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        email,
        isLoading,
        message,
        isSent,
        cooldown, // Expose to UI
        handleEmailChange,
        submitRequest
    };
};
