import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import SubscriptionService from '../services/subscriptionService';
import financeService from '../services/financeService';
import { useToast } from '../context/ToastContext';
import { logger } from '../utils/logger';

/**
 * 💎 useSubscription Hook (SSOT)
 * Centraliza la lógica de suscripciones para toda la App.
 * No habla con la base de datos directamente (usa servicios).
 * No tiene datos quemados (usa la tabla planes).
 */
export const useSubscription = () => {
    const { user, actualizarPerfil } = useAuth();
    const { showToast } = useToast();
    
    const [currentPlan, setCurrentPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isToggling, setIsToggling] = useState(false);

    // 🚀 SSOT: Carga dinámica del plan actual desde la base de datos
    const loadPlanDetails = useCallback(async () => {
        if (!user?.plan) {
            setCurrentPlan({ nombre: 'Básico', slug: 'free', features: [] });
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await SubscriptionService.getPlanDetails(user.plan);
            if (!error && data) {
                setCurrentPlan(data);
            }
        } catch (err) {
            console.error("[useSubscription] Fallo al cargar detalles del plan:", err);
        } finally {
            setLoading(false);
        }
    }, [user?.plan]);

    // Efecto reactivo: Si el perfil cambia en Realtime (AuthContext), recargamos el plan
    useEffect(() => {
        loadPlanDetails();
    }, [loadPlanDetails]);

    // Escuchar evento global de sincronización (segundo nivel de reactividad)
    useEffect(() => {
        const handleSync = () => loadPlanDetails();
        window.addEventListener('turnes_profile_sync', handleSync);
        return () => window.removeEventListener('turnes_profile_sync', handleSync);
    }, [loadPlanDetails]);

    const handleToggleRenewal = async () => {
        if (!user) return;
        try {
            setIsToggling(true);
            const newState = !user.cancel_at_period_end;
            const response = await financeService.toggleSubscriptionRenewal(newState);
            if (response.error) throw response.error;

            await actualizarPerfil({ cancel_at_period_end: newState });
            showToast(newState ? 'Suscripción cancelada' : 'Renovación activada', 'success');
        } catch (err) {
            showToast('Error al actualizar renovación.', 'error');
        } finally {
            setIsToggling(false);
        }
    };

    const handleDowngrade = async (targetPlan, immediate) => {
        try {
            setIsToggling(true);
            logger.info(`🚀 [useSubscription] Iniciando cambio de plan a ${targetPlan}...`);
            
            const res = await financeService.changePlan(targetPlan, immediate);
            
            if (res.error) {
                console.error("❌ [useSubscription] Error de Supabase:", res.error);
                throw res.error;
            }
            
            logger.info("✅ [useSubscription] RPC exitoso, actualizando perfil local...");
            
            if (immediate) {
                // 🚀 Actualización reactiva inmediata
                await actualizarPerfil({ plan: targetPlan });
                showToast(`¡Downgrade exitoso! Ahora eres Plan ${targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)}.`, 'success');
            } else {
                // Para downgrade diferido, notificamos y recargamos plan details (sin forzar plan actual si no es inmediato)
                const expiresAtStr = user?.plan_expires_at 
                    ? new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(user.plan_expires_at)) 
                    : 'finalizar tu ciclo actual';
                showToast(`El downgrade a ${targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)} se aplicará el ${expiresAtStr}.`, 'success');
                window.dispatchEvent(new CustomEvent('turnes_profile_sync'));
            }
        } catch (err) {
            console.error("🔥 [useSubscription] Error fatal en downgrade:", err);
            showToast('Error al cambiar de plan.', 'error');
        } finally {
            setIsToggling(false);
        }
    };

    const handleDowngradeToMicro = () => handleDowngrade('micro', true);
    const handleDowngradeToBasic = () => handleDowngrade('basic', false);

    return {
        currentPlan,
        isPaidPlan: currentPlan?.slug !== 'free' && currentPlan?.slug !== 'basic',
        isCanceled: user?.cancel_at_period_end,
        expiresAt: user?.plan_expires_at,
        loading,
        isToggling,
        toggleRenewal: handleToggleRenewal,
        downgradeToMicro: handleDowngradeToMicro,
        downgradeToBasic: handleDowngradeToBasic,
        refresh: loadPlanDetails
    };
};
