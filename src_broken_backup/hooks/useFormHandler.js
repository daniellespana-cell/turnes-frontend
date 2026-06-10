import { useState } from 'react';
import { logger } from '../utils/logger';

/**
 * Hook personalizado para manejar el envío de formularios de registro en Turnes.
 * Centraliza la validación básica y la gestión de estados de carga/éxito/error.
 * * @param {string} roleType - El nombre del rol para mostrar en mensajes (ej: "Candidato", "Empresa")
 * @param {function} successCallback - Función a ejecutar tras un registro exitoso (ej: setRole(null))
 */
const useFormHandler = (roleType, successCallback) => {
    const [message, setMessage] = useState('');
    // Tipos de mensaje: 'error' | 'success' | ''
    const [messageType, setMessageType] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmission = async (event) => {
        event.preventDefault();
        setMessage('');
        setIsLoading(true);

        const formData = new FormData(event.target);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // --- VALIDACIONES BÁSICAS ---
        
        // 1. Longitud de contraseña
        if (password && password.length < 8) {
            setMessage('Error: La contraseña debe tener al menos 8 caracteres.');
            setMessageType('error');
            setIsLoading(false);
            return;
        }

        // 2. Coincidencia de contraseñas
        if (password && confirmPassword && password !== confirmPassword) {
            setMessage('Error: Las contraseñas no coinciden. Por favor, revísalas.');
            setMessageType('error');
            setIsLoading(false);
            return;
        }

        // --- SIMULACIÓN DE LLAMADA AL BACKEND ---
        try {
            // Aquí iría tu llamada real a la API (ej: await authService.register(...))
            logger.info(`[SIMULACIÓN TURNES] Enviando datos de registro para ${roleType}:`, Object.fromEntries(formData.entries()));
            
            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 1500));

            setMessage(`¡Registro de ${roleType} exitoso! Redirigiendo...`);
            setMessageType('success');
            event.target.reset();

            // Ejecutar la acción post-registro (navegación o reset)
            setTimeout(() => {
                if (successCallback) successCallback();
                setMessage('');
                setMessageType('');
            }, 2000);

        } catch (error) {
            console.error(error);
            setMessage('Ocurrió un error al procesar tu solicitud. Intenta nuevamente.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    return { 
        message, 
        messageType, 
        isLoading,
        handleSubmission, 
        setMessage // Se expone por si el componente necesita limpiar mensajes manualmente
    };
};

export default useFormHandler;