import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotificationsContext } from '../../context/NotificationsContext';
import { useWorkerStats } from '../../hooks/useWorkerStats';
import WhatsAppOnboardingBanner from './WhatsAppOnboardingBanner';
import ProfileBanner from '../Dashboard/ProfileBanner';
import EliteBanner from '../Dashboard/EliteBanner';

/**
 * WorkerActionBanners — Orquestador de Prioridad de Banners (SSOT)
 *
 * Responsabilidad Única:
 * - Evitar la "fatiga de banners" (múltiples recuadros apilados en el Dashboard).
 * - Mostrar en cualquier momento exactamente UN solo banner prioritario siguiendo una jerarquía determinista:
 *   1. 🥇 P1: WhatsApp (Si el postulante no tiene teléfono registrado).
 *   2. 🥈 P2: Completitud de Perfil (Si tiene teléfono pero su perfil está incompleto < 100%).
 *   3. 🥉 P3: Élite Verificado (Si su perfil está al 100% y tiene notificación de verificación aprobada).
 *
 * Cero deuda técnica, cero lógica de base de datos directa en la UI.
 */
const WorkerActionBanners = () => {
    const { user } = useAuth();
    const { notifications } = useNotificationsContext();
    const { stats } = useWorkerStats();

    // 1. Evaluación P1: ¿Falta teléfono?
    const needsPhone = !user?.telefono;

    // 2. Evaluación P2: ¿Perfil incompleto?
    const profileCompleteness = stats?.profileCompletion ?? 0;
    const isProfileIncomplete = profileCompleteness < 100;

    // 3. Evaluación P3: ¿Notificación Élite no leída?
    const hasUnreadEliteNotice = useMemo(() => {
        return notifications?.some(
            (n) => n.tipo === 'VERIFICATION_APPROVED' && !n.leida
        );
    }, [notifications]);

    // ==========================================
    // 🎯 MÁQUINA DE ESTADOS DETERMINISTA
    // ==========================================
    if (needsPhone) {
        return <WhatsAppOnboardingBanner />;
    }

    if (isProfileIncomplete) {
        return <ProfileBanner />;
    }

    if (hasUnreadEliteNotice) {
        return <EliteBanner userName={user?.name} />;
    }

    return null;
};

export default WorkerActionBanners;
