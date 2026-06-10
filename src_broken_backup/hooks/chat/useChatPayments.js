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

                // 4. Feedback Activo & Siguiente Paso (Video Validation Prompt)
                if (onSystemMessage && (user?.role === 'empresa' || user?.role === 'BUSINESS_ROLE')) {
                    onSystemMessage(
                        'Conexión Segura Desbloqueada',
                        'system_info',
                        {
                            subtype: 'payment_success',
                            instruction: 'Has asegurado al talento. Sugerimos agendar o invitar a una validación visual rápida ahora mismo.',
                            timestamp: new Date().toISOString()
                        },
                        'prompt_video_invite'
                    );
                }

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
