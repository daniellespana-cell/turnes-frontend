import React from 'react';

import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Contexto para manejar el estado del flujo de registro en Turnes.
 * Permite compartir el rol seleccionado (Candidato vs Empresa) entre
 * componentes hermanos sin prop-drilling.
 */
const RegisterContext = createContext(null);


export const RegisterProvider = ({ children }) => {
    // 🚀 ULTRA-PERFORMANCE: Usamos estado local en lugar de URL SearchParams.
    // Esto evita que React Router vuelva a ejecutar el 'rootLoader' (y su timeout de 2s)
    // cada vez que el usuario elige un perfil.
    const [role, setRoleState] = useState(null);

    // Función setter que actualiza el estado local (instantáneo)
    const setRole = useCallback((newRole) => {
        setRoleState(newRole);
    }, []);

    const resetRegistration = useCallback(() => {
        setRoleState(null);
    }, []);

    const value = {
        role,
        setRole,
        resetRegistration
    };

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