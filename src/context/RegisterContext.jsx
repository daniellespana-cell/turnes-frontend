import React from 'react';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';

/**
 * Contexto para manejar el estado del flujo de registro en Turnes.
 * Permite compartir el rol seleccionado (Candidato vs Empresa) entre
 * componentes hermanos sin prop-drilling.
 */
const RegisterContext = createContext(null);


export const RegisterProvider = ({ children, initialRole = null, onReset }) => {
    // 🚀 ULTRA-PERFORMANCE: Usamos estado local en lugar de URL SearchParams para la navegación interna.
    // El initialRole se pasa desde RegisterPage usando useParams, manteniendo React Router como la "Single Source of Truth".
    const [role, setRoleState] = useState(initialRole);

    // SINCRONIZACIÓN REACTIVA (Senior Practice): Si el usuario navega desde `/register/talento` a `/register/empresa`
    // sin desmontar el componente (SPA navigation), useState ignorará el nuevo initialRole. 
    // Este useEffect garantiza que la URL siempre mande sobre el estado local si cambia.
    React.useEffect(() => {
        if (initialRole !== null && initialRole !== role) {
            setRoleState(initialRole);
        }
    }, [initialRole, role]);

    // Función setter que actualiza el estado local (instantáneo)
    const setRole = useCallback((newRole) => {
        if (newRole === null && onReset) {
            onReset();
        }
        setRoleState(newRole);
    }, [onReset]);

    const resetRegistration = useCallback(() => {
        setRoleState(null);
    }, []);

    const value = useMemo(() => ({
        role,
        setRole,
        resetRegistration
    }), [role, setRole, resetRegistration]);

    return (
        <RegisterContext.Provider value={value}>
            {children}
        </RegisterContext.Provider>
    );
};

// Hook personalizado para consumir el contexto fácilmente
export const useRegister = () => {
    const context = useContext(RegisterContext);

    // Buena práctica: Validar que el hook se use dentro del Provider
    if (!context) {
        throw new Error('useRegister debe ser usado dentro de un RegisterProvider');
    }

    return context;
};