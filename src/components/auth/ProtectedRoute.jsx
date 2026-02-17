import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PROTECTED ROUTE (Senior Hardening)
 * 1. Checks Authentication (Redirects to /login)
 * 2. Checks Role Access (Redirects to /dashboard or 404)
 * 3. Checks Profile Completion (Redirects to /onboarding)
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 0. Loading State (Prevent Flash of content)
  if (loading) {
    return null; // Or a mini-spinner if desired, but App.jsx usually handles global loading
  }

  // 1. Auth Check
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role Check (RBAC)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.warn(`⛔ Access Denied: User role '${user.role}' not in [${allowedRoles}]`);
    // Redirect to their appropriate dashboard to avoid getting stuck
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Profile Gate (The "Complete Profile" Check)
  // Logic: If user is authenticated but has no name, force them to complete it.
  // Exception: Don't redirect if we are ALREADY at the profile/onboarding page to avoid loops.
  const isProfileIncomplete = !user.nombre_display || user.nombre_display === 'Usuario Nuevo';
  const isOnboardingPage = location.pathname.includes('/perfil') || location.pathname.includes('/onboarding');

  if (isProfileIncomplete && !isOnboardingPage) {
    console.log("⚠️ Profile Incomplete -> Redirecting to Profile Settings");
    return <Navigate to="/dashboard/perfil" replace />;
  }

  // 4. Access Granted
  return children;
};

export default ProtectedRoute;