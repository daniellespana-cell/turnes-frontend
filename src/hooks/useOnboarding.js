import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_MAP_DB } from '../context/authConstants';
import { toast } from 'sonner';

/**
 * Patrón "Clean Architecture": 
 * Este Hook centraliza TODA la lógica de registro de Supabase, 
 * estados de carga ('spinners') y notificaciones (Toast).
 * Retira la Responsabilidad Única (SRP) de los componentes visuales.
 */
export const useOnboarding = () => {
    const { user, refreshSession } = useAuth();
    const navigate = useNavigate();
    const [isRoleLoading, setIsRoleLoading] = useState(false);

    // Salida de Emergencia
    const emergencyLogout = useCallback(async () => {
        try {
            const { authService } = await import('../services/authService');
            await authService.logout();
            navigate(0); // Forzar limpieza de caches en navegador
        } catch (e) {
            console.error(e);
        }
    }, [navigate]);

    // Lógica Central de Identidad (Asignar Rol vía Google/OAuth)
    const confirmGoogleRole = useCallback(async (uiRole) => {
        if (!user || !user.needs_onboarding) return false;

        setIsRoleLoading(true);
        try {
            const dbRole = ROLE_MAP_DB[uiRole];
            if (!dbRole) throw new Error("Rol mapeado inválido.");

            const { supabase } = await import('../services/supabaseClient');
            const { error } = await supabase.rpc('rpc_set_user_role_after_oauth', { p_role: dbRole });
            
            if (error) throw error;
            
            // Rehidratar Spa y redigir.
            await refreshSession();
            navigate('/dashboard', { replace: true });
            return true; // No apagamos el loader en éxito porque la página va a desmontarse (Navegación SPA)
        } catch (err) {
            console.error("Error confirmando rol de Google:", err);
            setIsRoleLoading(false);
            toast.error(err.message?.includes('ya tiene un rol') ? 'Tu cuenta ya definió un rol.' : 'Error servidor. Intenta de nuevo.');
            return false;
        }
    }, [user, navigate, refreshSession]);

    return {
        isOnboardingTrapped: user?.needs_onboarding,
        confirmGoogleRole,
        isRoleLoading,
        emergencyLogout
    };
};
