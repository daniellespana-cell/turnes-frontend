import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Contexto para manejar el estado del flujo de registro en Turnes.
 * Permite compartir el rol seleccionado (Candidato vs Empresa) entre
 * componentes hermanos sin prop-drilling.
 */
const RegisterContext = createContext(null);

import { useSearchParams } from 'react-router-dom';

export const RegisterProvider = ({ children }) => {
    // Principal Level: URL-Driven State (Single Source of Truth)
    const [searchParams, setSearchParams] = useSearchParams();

    // Obtener rol de la URL (safely)
    const roleParam = searchParams.get('role');
    const role = (roleParam === 'jobseeker' || roleParam === 'company') ? roleParam : null;

    // Función setter que actualiza la URL
    const setRole = useCallback((newRole) => {
        if (newRole) {
            setSearchParams({ role: newRole });
        } else {
            setSearchParams({}); // Limpiar params para volver al inicio
        }
    }, [setSearchParams]);

    const resetRegistration = useCallback(() => {
        setSearchParams({});
    }, [setSearchParams]);

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