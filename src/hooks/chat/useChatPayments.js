import { useCallback } from 'react';
import { ContractService, PROTOCOL_STEPS } from '../../services/contractService';
import financeService from '../../services/financeService';
import { useAuth } from '../../context/AuthContext';

export const useChatPayments = (candidato, finanzas, setContractStatus) => {
    const { user, actualizarSaldo } = useAuth();

    const ejecutarPagoComision = useCallback(async () => {
        try {
            if (!candidato?.id) return { success: false };

            const costo = finanzas.cargoServicio;
            const saldoActual = user?.saldo || 0;

            // 1. Validación de Fondos (Pre-Fetch)
            if (saldoActual < costo) {
                alert("Fondos insuficientes. Recarga tu billetera.");
                return { success: false };
            }

            const applicationId = candidato.id;
            const candidateName = candidato.name || "Candidato";

            // 2. Procesar Pago Atómico (ContractService -> RPC)
            const result = await ContractService.step1_payCommission(applicationId, costo, candidateName);

            if (result.success) {
                // 3. Actualizar Estado Local
                setContractStatus(prev => ({ ...prev, step: PROTOCOL_STEPS.PAID, isPaid: true }));

                if (actualizarSaldo) actualizarSaldo(result.newBalance);
                return { success: true };
            }

            return { success: false };

        } catch (err) {
            console.error("Error pago:", err);
            if (err.code === 'INSUFFICIENT_FUNDS') {
                alert("No tienes saldo suficiente.");
            } else {
                alert("Error procesando el pago. Intenta nuevamente.");
            }
            return { success: false };
        }
    }, [candidato, finanzas, user, actualizarSaldo, setContractStatus]);

    return { ejecutarPagoComision };
};
