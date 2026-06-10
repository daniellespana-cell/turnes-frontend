import { useState, useEffect, useMemo, useCallback } from 'react';
import { ContractService, PROTOCOL_STEPS } from '../../services/contractService';
import { useChatPermissions } from './useChatPermissions';

export const useChatProtocol = (candidato, config, constraints) => {
    // 1. Estado Sincronizado con BD y Flag de Seguridad
    const [contractStatus, setContractStatus] = useState({ step: 0, isPaid: false });
    const [isLoadingProtocol, setIsLoadingProtocol] = useState(true);

    // 🔄 SYNC INITIAL STATE AND LISTEN FOR UPDATES FROM BACKEND
    const fetchStatus = useCallback(() => {
        if (!candidato?.id) return;
        setIsLoadingProtocol(true);
        ContractService.getContractStatus(candidato.id)
            .then(status => {
                // 🔥 ANTI-RACE-CONDITION: Never let a DB fetch retrograde a step
                // that a local optimistic update already advanced.
                setContractStatus(prev => ({
                    ...status,
                    step: Math.max(prev.step, status.step),
                    isPaid: prev.isPaid || status.isPaid,
                }));
                setIsLoadingProtocol(false);
            })
            .catch(err => {
                console.warn("Could not sync contract status, defaulting to safe state", err);
                setContractStatus(prev => prev.step > 0 ? prev : { step: 0, isPaid: false });
                setIsLoadingProtocol(false);
            });
    }, [candidato?.id]);

    useEffect(() => {
        let isSubscribed = true;
        fetchStatus();

        // 🚨 CRITICAL FIX: The React hook now listens to DOM events emitted by Payment / Seal Actions
        // so that the entire Chat state re-evaluates automatically without the user pressing F5.
        const handleUpdate = () => {
            if (isSubscribed) fetchStatus();
        };

        window.addEventListener('turnes_contract_update', handleUpdate);
        return () => {
            isSubscribed = false;
            window.removeEventListener('turnes_contract_update', handleUpdate);
        };
    }, [fetchStatus]);

    // 2. Evaluador Estricto de Permisos (Server-Side SOT)
    const permissions = useChatPermissions(
        contractStatus,
        candidato,
        constraints?.isVacanteCerrada,
        isLoadingProtocol
    );

    // 🧠 3. ORQUESTADOR CENTRALIZADO DE PASOS (The "Wizard" State)
    // Mapea la vista actual del chat en base al paso certificado en DB
    const activeStep = useMemo(() => {
        if (isLoadingProtocol) return null;
        if (permissions.isClosed) return null;

        const currentStep = contractStatus.step;

        // PASO 1: PAGO
        if (currentStep < PROTOCOL_STEPS.PAID) return 'PAYMENT';

        // PASO 2: VIDEO
        if (currentStep < PROTOCOL_STEPS.VIDEO_VALIDATED) {
            return 'VIDEO';
        }

        // PASO 3: ACUERDO
        if (currentStep < PROTOCOL_STEPS.AGREEMENT_CONFIRMED) {
            return 'AGREEMENT';
        }

        // PASO 4: FINALIZAR
        if (currentStep >= PROTOCOL_STEPS.AGREEMENT_CONFIRMED && !permissions.isClosed) {
            return 'FINALIZE';
        }

        return null;
    }, [permissions.isClosed, contractStatus.step, isLoadingProtocol]);

    return {
        permissions,
        contractStatus,
        setContractStatus,
        activeStep, // 🆕 The Unified Source of Truth
        isLoadingProtocol, // Flag to show global loading mechanism
        PROTOCOL_STEPS
    };
};
