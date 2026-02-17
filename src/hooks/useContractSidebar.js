import { useState, useEffect, useMemo } from 'react';

/**
 * useContractSidebar
 * Centralizes the logic for the Contract & Payment Sidebar.
 * - Handles 'storage' events for cross-tab sync.
 * - Manages optimistic UI states (isPaying, confirmingPay).
 * - Derives financial config from props (or defaults).
 */
export const useContractSidebar = ({
    candidate,
    finanzas,
    permisos,
    onPay,
    onClose
}) => {

    // 1. LOCAL UI STATE
    const [confirmingPay, setConfirmingPay] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [optimisticPaid, setOptimisticPaid] = useState(false);

    // 2. STORAGE EVENT LISTENER (Cross-Tab Sync)
    useEffect(() => {
        const handleStorageChange = () => {
            try {
                if (!candidate?.id) return;
                const storedCandidate = localStorage.getItem(`input_data_${candidate.id}`);
                if (storedCandidate) {
                    const parsed = JSON.parse(storedCandidate);
                    if (parsed?.isPaid) {
                        setOptimisticPaid(true);
                    }
                }
            } catch (e) {
                console.error("Error syncing contract state:", e);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('wallet_update', handleStorageChange);

        // Initial check
        handleStorageChange();

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('wallet_update', handleStorageChange);
        };
    }, [candidate?.id]);

    // 3. TRANSACTION ID (Memoized Session ID)
    const transactionId = useMemo(
        () => Math.random().toString(36).substring(7).toUpperCase(),
        [candidate?.id]
    );

    // 4. FINANCIAL CONFIG DERIVATION
    // Resolves the "Source of Truth" for money: Props > Candidate Meta > Defaults
    const config = useMemo(() => {
        const cargo = finanzas?.cargoServicio ?? candidate?.billingConfig?.cargoServicio ?? 0;
        const pago = finanzas?.pagoPersonal ?? candidate?.payment ?? 50000;
        const plan = finanzas?.plan ?? candidate?.billingConfig?.plan ?? 'Básico';
        return { cargo, pago, plan };
    }, [finanzas, candidate]);

    // 5. STATUS FLAGS
    const isRehire = candidate?.estadoTurno === 'AGENDADO' || permisos?.reason === 'REHIRE_ACTIVE';

    const isSealed = Boolean(
        candidate?.cicloCerrado ||
        candidate?.estadoTurno === 'FINALIZADO' ||
        permisos?.isClosed
    );

    // The "Paid" status is a mix of Backend Confirmation (permisos) + Local Optimistic
    const isPaid = permisos?.isPaid || candidate?.isPaid || optimisticPaid;

    // 6. ACTIONS WRAPPERS
    const handlePay = async () => {
        setIsPaying(true);
        try {
            if (onPay) await onPay();
            setOptimisticPaid(true);
            if (window.innerWidth < 768 && onClose) onClose(); // Auto-close on mobile
        } catch (error) {
            console.error("Payment failed", error);
        } finally {
            setIsPaying(false);
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
            isPaying
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
