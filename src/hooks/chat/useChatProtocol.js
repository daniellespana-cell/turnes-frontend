import { useState, useEffect, useMemo } from 'react';
import { ContractService, PROTOCOL_STEPS } from '../../services/contractService';
import { useChatPermissions } from './useChatPermissions';

export const useChatProtocol = (candidato, config, constraints) => {
    // Estado Local Sincronizado con DB
    const [contractStatus, setContractStatus] = useState({ step: 0, isPaid: false });

    // 🔄 SYNC INITIAL STATE
    useEffect(() => {
        if (candidato?.id) {
            ContractService.getContractStatus(candidato.id)
                .then(status => setContractStatus(status))
                .catch(err => console.warn("Could not sync contract status", err));
        }
    }, [candidato?.id]);

    // Merge DB Permissions with Legacy Config
    const basePermissions = useChatPermissions(candidato, config, constraints?.isVacanteCerrada);

    // Override Permissions with Real DB Status
    const permissions = useMemo(() => ({
        ...basePermissions,
        isPaid: contractStatus.isPaid || basePermissions.isPaid,
        confirmado: contractStatus.step >= PROTOCOL_STEPS.AGREEMENT_CONFIRMED || basePermissions.confirmado,
        isClosed: contractStatus.step === PROTOCOL_STEPS.FINALIZED || basePermissions.isClosed
    }), [basePermissions, contractStatus]);

    // 🧠 CENTRALIZED WORKFLOW LOGIC (The "Wizard" State)
    const activeStep = useMemo(() => {
        if (permissions.isClosed) return null;

        // PASO 1: PAGO
        if (!permissions.isPaid) return 'PAYMENT';

        // PASO 2: VIDEO (Si no está confirmado)
        if (!permissions.confirmado) {
            // Check legacy or explicit video validation
            const isVideoDone =
                candidato?.estadoTurno === 'VALIDADO' ||
                candidato?.estadoTurno === 'EJECUTADO' ||
                contractStatus.step >= PROTOCOL_STEPS.VIDEO_VALIDATED ||
                candidato?.videoHabilitado === true;

            return isVideoDone ? 'AGREEMENT' : 'VIDEO';
        }

        // PASO 3/4: FINALIZAR
        if (permissions.confirmado && !permissions.isClosed) return 'FINALIZE';

        return null;
    }, [permissions, candidato, contractStatus.step]);

    return {
        permissions,
        contractStatus,
        setContractStatus,
        activeStep, // 🆕 The Unified Source of Truth
        PROTOCOL_STEPS
    };
};
