import React from 'react';

import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Contexto para manejar el estado del flujo de registro en Turnes.
 * Permite compartir el rol seleccionado (Candidato vs Empresa) entre
 * componentes hermanos sin prop-drilling.
 */
const RegisterContext = createContext(null);


export const RegisterProvider = ({ children }) => {
    // 🚀 ULTRA-PERFORMANCE: Usamos estado local en lugar de URL SearchParams para la navegación interna.
    // Sin embargo, si recibimos un query param `?type=company` o `?role=company` desde otra página (ej. Marketing),
    // lo usamos como valor inicial para saltar la pantalla de selección.
    const [role, setRoleState] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const type = params.get('type') || params.get('role');
            if (type === 'company' || type === 'empresa') return 'company';
            if (type === 'jobseeker' || type === 'postulante') return 'jobseeker';
        }
        return null;
    });

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