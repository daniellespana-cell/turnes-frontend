import React from 'react';
import { Navigate } from 'react-router-dom';

import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logger } from '../../utils/logger';

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

  // 3. Identity Wall (Onboarding Gate)
  // Logic: Si el rol en BD es 'pendiente', están atrapados en el registro.
  const isAtOnboarding = location.pathname.includes('/register');
  if (user.needs_onboarding && !isAtOnboarding) {
    logger.info("🧱 Identity Wall -> Redirecting to Role Selection");
    return <Navigate to="/register" replace />;
  }

  // 4. Access Granted

  // 4. Access Granted
  return children;
};

export default ProtectedRoute;