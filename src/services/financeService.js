import { supabase } from './supabaseClient';
import { BaseService } from './base/BaseService';
import { financeMapper } from '../utils/financeMapper';

/**
 * 💰 FINANCE SERVICE
 * Maneja billeteras, movimientos y compras internas usando la Wallet.
 */

export const FINANCE_ERRORS = {
    FETCH_FAILED: { code: 'FETCH_FAILED', message: 'Error sincronizando finanzas.' },
    UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Sesión inválida o expirada.' },
    INSUFFICIENT_FUNDS: { code: 'INSUFFICIENT_FUNDS', message: 'Saldo insuficiente en billetera.' },
    PAYMENT_ERROR: { code: 'PAYMENT_ERROR', message: 'Error procesando el pago.' },
    UNKNOWN_ERROR: { code: 'UNKNOWN_ERROR', message: 'Error desconocido.' }
};

export const FinanceService = {

    /**
     * Obtiene el balance de la billetera del usuario.
     * @param {string} userId 
     * @param {number} timeoutMS
     */
    async getBalance(userId, timeoutMS = 3000) {
        if (!userId) return { data: null, error: null };

        const query = supabase
            .from('billeteras')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        // 🛡️ Fail Open: We use a strict fast timeout so it never blocks the auth boot sequence.
        // If it times out or 403s due to RLS, it safely returns { data: { saldo: 0 } }
        const response = await BaseService.handle(query, timeoutMS, 'FinanceService.getBalance');

        if (response?.error || !response?.data) {
            if (response?.error?.message?.includes('TIMEOUT')) {
                console.warn("⚠️ [FinanceService] getBalance timed out. Defaulting to 0.");
            }
            return { data: { saldo: 0 }, error: null };
        }

        return response;
    },

    /**
     *  SSOT: Obtiene el historial de movimientos unificado y mapeado.
     * @param {string} userId 
     * @param {number} limit 
     * @param {number} offset
     */
    async getHistory(userId, limit = 20, offset = 0) {
        if (!userId) return { data: [], error: null };

        const query = supabase
            .from('movimientos')
            .select('*')
            .eq('billetera_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data, error } = await BaseService.handle(query);
        if (error) return { data: [], error };

        return { data: financeMapper.mapTransactions(data), error: null };
    },

    /**
     * Recrea e invoca el generador de firmas Wompi (RPC)
     */
    async prepareWompiTransaction(amountInCop, email, userId, itemType = null, itemId = null) {
        try {
            const amountInCents = Math.floor(amountInCop * 100);
            const timestamp = Date.now();

            // 🚀 OJO DE ÁGUILA: Alineación con formato real (UUID-TIPO-ID)
            // Por defecto es 'R' (Recarga) para evitar pérdida de fondos por mala clasificación
            const typeCode = itemType === 'plan' ? 'S' : (itemType === 'verification' ? 'V' : 'R');
            const safeItemId = itemId ? `-${itemId}` : '';
            const reference = `${userId}-${typeCode}${safeItemId}-${timestamp}`;

            const query = supabase.rpc('get_wompi_signature', {
                p_reference: reference,
                p_amount_in_cents: amountInCents,
                p_user_email: email || 'anon'
            });

            const { data, error } = await BaseService.handle(query);

            if (error) throw error;
            // El RPC devuelve jsonb con reference, amountInCents, currency, signature
            return {
                reference: data.reference,
                amountInCents: data.amountInCents,
                signature: data.signature
            };
        } catch (err) {
            console.error("Fallo obteniendo firma Wompi:", err);
            throw err;
        }
    },

    /**
     * Realiza un polling a la base de datos (Read-Only) verificando si el Webhook de Wompi
     * ya insertó el movimiento en la billetera. (Single Source of Truth)
     */
    async waitForTransaction(transactionId, maxWaitMs = 60000) {
        const checkInterval = 3000;
        let elapsed = 0;

        while (elapsed < maxWaitMs) {
            // 🛰️ RADAR READ-ONLY: Buscar si el webhook ya registró el movimiento
            const { data, error } = await supabase
                .from('movimientos')
                .select('id, estado')
                .eq('metadata->>wompi_id', transactionId)
                .maybeSingle();

            if (data && data.id) {
                return { found: true, status: 'APPROVED' };
            }

            if (error && error.code !== 'PGRST116') {
                console.warn("Polling Warning:", error);
            }

            await new Promise(resolve => setTimeout(resolve, checkInterval));
            elapsed += checkInterval;
        }

        throw new Error("Transacción no confirmada en el tiempo esperado.");
    },

    /**
     * Adquiere un beneficio digital pagando con el saldo de la Billetera. (V2 Hardened)
     * @param {string} itemId (e.g. 'verify')
     * @param {string} itemType (e.g. 'service')
     * @param {string} concept Descripción para el recibo (opcional)
     */
    async processWalletPayment(itemId, itemType, monto, concepto) {
        const query = supabase.rpc('rpc_procesar_pago_wallet_v2', {
            p_item_id: itemId,
            p_item_type: itemType,
            p_monto: monto,
            p_concepto: concepto
        });

        return await BaseService.handle(query);
    },

    /**
     * 🚀 SSOT: Cambia el plan del usuario (Upgrade/Downgrade)
     * @param {string} newPlanId ('micro', 'pro', 'elite', 'free')
     * @param {boolean} immediate Si es true, el cambio es instantáneo. Si no, es programado.
     */
    async changePlan(newPlanId, immediate = false) {
        const query = supabase.rpc('rpc_change_user_plan', {
            p_immediate: immediate,
            p_new_plan_id: newPlanId
        });

        return await BaseService.handle(query);
    },

    /**
     * 🚀 SENIOR FIX: Puente Front-Back para alternar la auto-renovación
     * Invoca el RPC seguro para evitar mutaciones directas a las tablas.
     * @param {boolean} cancelStatus true para cancelar, false para reactivar
     */
    async toggleSubscriptionRenewal(cancelStatus) {
        const query = supabase.rpc('rpc_toggle_subscription_renewal', {
            p_cancel_status: cancelStatus
        });

        return await BaseService.handle(query);
    },

    /**
     * Suscribirse a cambios en vivo de la Billetera (Zero-F5)
     */
    subscribeToWallet(userId, callback) {
        if (!userId) return;
        return supabase
            .channel(`public:billeteras:${userId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'billeteras',
                filter: `id=eq.${userId}`
            }, callback)
            .subscribe();
    },

    /**
     * Suscribirse a nuevos movimientos en vivo (Zero-F5)
     */
    subscribeToHistory(userId, callback) {
        if (!userId) return;
        return supabase
            .channel(`public:movimientos:${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'movimientos',
                filter: `billetera_id=eq.${userId}`
            }, callback)
            .subscribe();
    },

    unsubscribe(channel) {
        if (channel) supabase.removeChannel(channel);
    }
};

/**
 * Format currency utility
 */
export const formatCurrency = (amount, locale = 'es-CO', currency = 'COP') => {
    const num = Number(amount);
    if (isNaN(num)) return '$0';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
};

export default FinanceService;