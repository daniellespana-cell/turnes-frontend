import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * useContractSidebar
 * Centralizes the logic for the Contract & Payment Sidebar.
 * - Manages UX loading states (isPaying, confirmingPay).
 * - Derives financial config from props.
 * - Relies entirely on `permisos` (Server SOT) for the actual lock state.
 */
export const useContractSidebar = ({
    candidate,
    finanzas,
    permisos,
    onPay,
    onClose,
    isFinalizing
}) => {

    // 1. LOCAL UI STATE
    const [confirmingPay, setConfirmingPay] = useState(false);

    // 2. TRANSACTION ID (Per-mount Session ID)
    const [transactionId] = useState(() => Math.random().toString(36).substring(7).toUpperCase());

    // 3. FINANCIAL CONFIG DERIVATION
    const { user } = useAuth();
    const isEmpresa = user?.role === 'empresa' || user?.role === 'BUSINESS_ROLE';

    const config = useMemo(() => {
        const cargo = finanzas?.cargoServicio ?? candidate?.billingConfig?.cargoServicio ?? 0;
        const pago = finanzas?.pagoPersonal ?? candidate?.payment ?? 0;
        
        // 🛡️ RAZONAMIENTO SENIOR: Capa de Privacidad. 
        // Al postulante NO le importa el plan de la empresa.
        let plan = null;
        if (isEmpresa) {
            const rawPlan = user?.perfil?.plan || user?.user_metadata?.plan || user?.plan || 'MICRO';
            plan = (finanzas?.plan ?? rawPlan).toUpperCase();
        }
        
        const labelCobro = finanzas?.labelCobro ?? 'Comisión';
        const beneficioPlan = finanzas?.beneficioPlan ?? null;
        const isFijo = finanzas?.isFijo ?? false;

        return { cargo, pago, plan, labelCobro, beneficioPlan, isFijo };
    }, [finanzas, candidate, user, isEmpresa]);

    // 4. STATUS FLAGS (From Server Context)
    const isRehire = candidate?.estadoTurno === 'AGENDADO' || permisos?.reason === 'REHIRE_ACTIVE';

    const isSealed = Boolean(
        candidate?.cicloCerrado ||
        candidate?.estadoTurno === 'FINALIZADO' ||
        permisos?.isClosed
    );

    // 🔥 SECURITY FIX: `isPaid` must come exclusively from `permisos` which reads Supabase. 
    // No more optimistic localStorage overriding!
    const isPaid = Boolean(permisos?.isPaid);

    // 5. ACTIONS WRAPPERS
    const handlePay = async () => {
        try {
            if (onPay) await onPay();
            // La visibilidad de carga ahora la controla íntegramente el `useChatPayments` central.
            if (window.innerWidth < 768 && onClose) onClose(); // Auto-close on mobile
        } catch (error) {
            console.error("Payment action failed / cancelled", error);
        } finally {
            setConfirmingPay(false);
        }
    };

    const handleMobileAction = (action) => {
        if (action) action();
        if (window.innerWidth < 768 && onClose) onClose();
    };

    return {
        // State
        config,
        transactionId,
        status: {
            isRehire,
            isSealed,
            isPaid,
            confirmingPay,
            isPaying: finanzas?.isPaying || false, // Consumimos el estado reactivo centralizado
            isFinalizing
        },
        // Setters
        setConfirmingPay,
        // Actions
        actions: {
            handlePay,
            handleMobileAction
        }
    };
};
