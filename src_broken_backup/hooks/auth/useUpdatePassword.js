import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';

export const useUpdatePassword = () => {
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Validar sesión al cargar (Seguridad extra)
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Si no hay sesión (el link expiró o es inválido), volver al login
                // navigate('/login'); 
            }
        };
        checkSession();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // 1. Validaciones básicas
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setIsLoading(true);

        try {
            // 2. Llamada a Supabase para actualizar el usuario
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            // 3. Éxito
            setIsSuccess(true);

            // Redirigir automáticamente después de 3 segundos
            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (err) {
            setError(err.message || 'Error al actualizar la contraseña.');
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    return {
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        showPassword,
        togglePasswordVisibility,
        isLoading,
        error,
        isSuccess,
        handleSubmit
    };
};
