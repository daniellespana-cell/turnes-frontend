import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * GUEST ROUTE
 * Evita que los usuarios logueados vean páginas de autenticación (Login/Register)
 * o la Landing Page pública. Si ya tienen sesión, se les redirige a su dashboard.
 */
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (user) {
    // Si ya está logueado, lo devolvemos al área privada automáticamente.
    // Usamos replace para no ensuciar el historial del navegador.
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children;
};

export default GuestRoute;
