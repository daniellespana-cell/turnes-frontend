
import { useCallback, useState } from 'react';
import { ContractService, PROTOCOL_STEPS } from '../../services/contractService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UI_STRINGS } from '../../domain/uiTranslations';

export const useChatPayments = (candidato, finanzas, setContractStatus, onSystemMessage) => {
    const { user, actualizarSaldo } = useAuth();
    const { showToast } = useToast();
    const [isPaying, setIsPaying] = useState(false);

    const ejecutarPagoComision = useCallback(async () => {
        if (isPaying) return { success: false };
        setIsPaying(true);
        try {
            if (!candidato?.id) return { success: false };

            const applicationId = candidato.id;
            const candidateName = candidato.name || "Candidato";
            const companyName = user?.nombre_empresa || user?.nombre_display || "La empresa";

            // 2. Procesar Pago Atómico (ContractService -> RPC V3)
            // El backend calcula el precio exacto según el plan y tipo de vacante.
            const result = await ContractService.step1_payCommission(applicationId, candidateName);

            if (result.success) {
                // 3. Actualizar Estado Local Optimista (Fuente de Verdad Inmediata)
                setContractStatus(prev => ({ ...prev, step: PROTOCOL_STEPS.PAID, isPaid: true }));
                // ⚠️ NO dispatching 'turnes_contract_update' here — that caused a race condition
                // where the DB refetch returned the old state and overwrote our optimistic update.
                // The setContractStatus above is sufficient and immediate.

                if (actualizarSaldo && result.newBalance !== undefined) {
                    actualizarSaldo(result.newBalance);
                }

                // 4. Feedback Activo
                // 🚀 SENIOR FIX: Eliminada la inyección de `onSystemMessage` desde el Frontend.
                // Ahora el `rpc_process_protocol_step1_v3` inserta el mensaje de "Conexión Segura Desbloqueada" 
                // directamente en la tabla mensajes para garantizar SSOT y seguridad.

                showToast(UI_STRINGS.CHAT.PAYMENT_SUCCESS, "success");
                setIsPaying(false);
                return { success: true };
            }

            showToast(UI_STRINGS.CHAT.PAYMENT_ERROR, "error");
            setIsPaying(false);
            return { success: false };

        } catch (err) {
            console.error("Error pago:", err);
            if (err.code === 'INSUFFICIENT_FUNDS') {
                showToast(UI_STRINGS.CHAT.NO_BALANCE, "error");
            } else {
                showToast(UI_STRINGS.CHAT.PAYMENT_RETRY, "error");
            }
            setIsPaying(false);
            return { success: false };
        }
    }, [candidato, finanzas, user, actualizarSaldo, setContractStatus, showToast, onSystemMessage, isPaying]);

    return { ejecutarPagoComision, isPaying };
};
