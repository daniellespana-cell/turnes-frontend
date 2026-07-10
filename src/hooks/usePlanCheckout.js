import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import pricingService from '../services/pricingService';
import financeService from '../services/financeService';
import { normalizeCheckoutItem } from '../utils/pricingHelpers';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/logger';

export const usePlanCheckout = (planSlug) => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { refreshSession } = useAuth();

    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Payment States
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [isProcessingWallet, setIsProcessingWallet] = useState(false);
    const [walletError, setWalletError] = useState(null);

    useEffect(() => {
        const fetchWithTimeout = async (promise, ms = 15000) => {
            let timerId;
            const timeout = new Promise((_, reject) => {
                timerId = setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), ms);
            });
            try {
                return await Promise.race([promise, timeout]);
            } finally {
                clearTimeout(timerId);
            }
        };

        const fetchItem = async () => {
            setLoading(true);
            setError(false);

            try {
                // ⚡ PARALLEL PERFORMANCE: Fetch both at same time
                logger.info(`📡 Fetching data for: ${planSlug}...`);
                const startTime = Date.now();

                const [planData, serviceData] = await fetchWithTimeout(
                    Promise.all([
                        pricingService.getPlanBySlug(planSlug),
                        pricingService.getServiceById(planSlug)
                    ])
                );

                logger.info(`✅ Fetch completed in ${Date.now() - startTime}ms`);

                if (planData) {
                    setItem(normalizeCheckoutItem(planData, 'plan'));
                } else if (serviceData) {
                    setItem(normalizeCheckoutItem(serviceData, 'service'));
                } else {
                    console.warn(`⚠️ Checkout: No item found for slug/id: ${planSlug}`);
                    setError(true);
                }
            } catch (err) {
                console.error("❌ Latency Audit: Checkout hang/error detected", err.message || err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (planSlug) {
            fetchItem();
        }
    }, [planSlug]);

    const handleSuccess = useCallback(async () => {
        setPaymentSuccess(true);

        if (item) {
            showToast(`¡Pago Exitoso!: Has adquirido: ${item.title}.`, 'success');
        }

        setTimeout(async () => {
            await refreshSession();
            setPaymentSuccess(false);
            // 🔐 Si es verificación, redirigir al flujo de documentos (no al dashboard)
            if (item?.id === 'verify') {
                navigate('/verificacion/documentos');
            } else {
                navigate('/dashboard');
            }
        }, 1500);
    }, [item, navigate, refreshSession]);

    // Anti-Double Click Guard (Synchronous vs React async state)
    const isProcessingRef = useRef(false);

    // 💳 PAY WITH WALLET ACTION
    const payWithWallet = async () => {
        if (!item || isProcessingWallet || isProcessingRef.current) return;

        isProcessingRef.current = true;
        setIsProcessingWallet(true);
        setWalletError(null);

        try {
            // El backend requiere el slug o ID, el tipo, el monto numérico exacto y el concepto.
            const targetId = item.type === 'plan' ? item.slug : item.id;

            const { error: rpcError } = await financeService.processWalletPayment(
                targetId,
                item.type,
                item.rawPrice,
                `Compra: ${item.title}`
            );

            if (rpcError) {
                throw rpcError;
            }

            // Transacción ACID exitosa. Pasamos al overlay de éxito.
            await handleSuccess();

        } catch (error) {
            console.error("Wallet Checkout Error:", error);
            setWalletError(error.message || "Error al procesar el pago con tu saldo.");
        } finally {
            isProcessingRef.current = false;
            setIsProcessingWallet(false);
        }
    };

    return {
        item,
        loading,
        error,
        paymentSuccess,
        isProcessingWallet,
        walletError,
        handleSuccess,
        payWithWallet // Exposed to UI
    };
};
