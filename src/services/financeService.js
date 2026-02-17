
import { supabase } from './supabaseClient';
import { authService } from './authService';

/**
 * 💰 FINANCE SERVICE (Supabase Integrated v3.0)
 * Lógica financiera real conectada al Backend.
 */

export const FINANCE_ERRORS = {
  FETCH_FAILED: { code: 'FETCH_FAILED', message: 'Error sincronizando finanzas.' },
  UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Sesión inválida o expirada.' },
  INSUFFICIENT_FUNDS: { code: 'INSUFFICIENT_FUNDS', message: 'Saldo insuficiente en billetera.' },
  PAYMENT_ERROR: { code: 'PAYMENT_ERROR', message: 'Error procesando el pago.' },
  UNKNOWN_ERROR: { code: 'UNKNOWN_ERROR', message: 'Error desconocido.' }
};

export const WALLET_EVENTS = {
  UPDATE: 'turnes_wallet_update'
};

class FinanceService {

  // --- UTILS ---
  formatCurrency(amount, locale = 'es-CO', currency = 'COP') {
    const num = Number(amount);
    if (isNaN(num)) return '$0';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }

  // --- READERS (Data Fetching) ---

  /**
   * Obtiene el estado consolidado de la billetera.
   */
  async getWalletData() {
    try {
      const session = await authService.getSession();
      if (!session) throw FINANCE_ERRORS.UNAUTHORIZED;

      // Parallel Fetch: Saldo + Historia
      const [walletRes, txRes] = await Promise.all([
        supabase.from('billeteras').select('saldo, id').eq('id', session.user.id).single(),
        supabase.from('movimientos')
          .select('*')
          .eq('billetera_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      if (walletRes.error) {
        // Auto-fix: Si por alguna razón no existe la billetera (migración), crearla ?
        // No, el trigger handle_new_user ya debió crearla. Si falla es error real.
        console.error("Wallet Fetch Error", walletRes.error);
        return { balance: 0, transactions: [] };
      }

      return {
        balance: walletRes.data.saldo,
        currency: 'COP',
        transactions: txRes.data || []
      };

    } catch (error) {
      console.error("Finance Service Error", error);
      throw error;
    }
  }

  // --- WRITERS (RPC Calls) ---

}

  /**
   * Prepara los datos para Wompi (Referencia + Firma)
   * En producción, la firma debe generarse en el Backend (RPC) con el secreto.
   */
  async prepareWompiTransaction(amount, email) {
  const reference = `REF-${Date.now()}`;
  // TODO: Llamar a RPC 'rpc_get_wompi_signature'
  // Por ahora retornamos datos dummy para que el widget abra en Sandbox
  return {
    reference,
    signature: 'INTEGRITY_SIGNATURE_PLACEHOLDER',
    amountInCents: amount * 100
  };
}

  async recharge(amount, method) {
  if (amount < 10000) throw new Error("Monto mínimo $10.000");

  try {
    // Llamada segura al Backend (Postgres Function)
    const { data, error } = await supabase.rpc('rpc_recargar_saldo', {
      monto_recarga: amount,
      referencia_pago: `MANUAL-${Date.now()}` // Simulado por ahora
    });

    if (error) throw error;

    // Eventos para actualizar UI
    this._emitChange(data.nuevo_saldo);

    return {
      success: true,
      newBalance: data.nuevo_saldo,
      transaction: { id: 'rpc-tx', amount, type: 'recarga' } // Dummy for UI feedback
    };

  } catch (error) {
    console.error("Recharge Failed", error);
    throw FINANCE_ERRORS.PAYMENT_ERROR;
  }
}

  async processDebit(amount, description = "Cargo por servicio") {
  if (amount <= 0) return { success: true };

  try {
    const { data, error } = await supabase.rpc('rpc_pagar_servicio', {
      monto_pago: amount,
      concepto: description
    });

    if (error) {
      // Mapeo de errores de Postgres a JS
      if (error.message.includes('Saldo insuficiente')) throw FINANCE_ERRORS.INSUFFICIENT_FUNDS;
      throw error;
    }

    this._emitChange(data.nuevo_saldo);

    return { success: true, newBalance: data.nuevo_saldo };

  } catch (error) {
    if (error.code === 'INSUFFICIENT_FUNDS') throw error;
    console.error("Debit Failed", error);
    throw FINANCE_ERRORS.PAYMENT_ERROR;
  }
}

  // --- HIGH LEVEL OPERATIONS ---

  /**
   * Pagar tasa de desbloqueo de candidato
   * @param {string} userId - Quien paga
   * @param {number} amount - Monto
   * @param {string} candidateName - Concepto
   */
  async payUnlockFee(userId, amount, candidateName) {
  return this.processDebit(amount, `Desbloqueo de contacto: ${candidateName}`);
}

// --- EVENT SYSTEM ---
_emitChange(newBalance) {
  // Comunicamos a React que debe refrescar
  window.dispatchEvent(new CustomEvent(WALLET_EVENTS.UPDATE, { detail: { balance: newBalance } }));
  // Helper legacy para AuthContext
  window.dispatchEvent(new Event('wallet_update'));
}
}

const financeService = new FinanceService();
export default financeService;

// LEGACY EXPORTS (Mantener compatibilidad)
export const formatCurrency = (a) => financeService.formatCurrency(a);
export const getWalletData = () => financeService.getWalletData();
export const processDebit = (a, d) => financeService.processDebit(a, d);
export const createRechargeIntent = (a, m) => financeService.recharge(a, m);