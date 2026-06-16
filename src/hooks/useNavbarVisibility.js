import { useLocation } from 'react-router-dom';

/**
 * useNavbarVisibility
 *
 * Single Source of Truth para decidir qué elementos extras del AppNavbar
 * (Recarga y Upgrade) son visibles para las empresas.
 */
export const useNavbarVisibility = () => {
    const { pathname } = useLocation();

    // Regla exacta de negocio solicitada:
    // 1. Panel de control (home): /dashboard -> FULL NAVBAR
    // 2. Mi perfil: /dashboard/perfil -> FULL NAVBAR
    // 3. El resto de sub-páginas (/dashboard/finanzas, /dashboard/vacantes, etc.) -> MINI NAVBAR (Solo account, notificaciones, mensajes)
    
    // Normalizamos el pathname quitando el trailing slash si existe para hacer un match perfecto
    const path = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;

    const isDashboardHome = path === '/dashboard';
    const isPerfil = path === '/dashboard/perfil';

    const showFullNavbar = isDashboardHome || isPerfil;

    return {
        showExtraActions: showFullNavbar
    };
};
