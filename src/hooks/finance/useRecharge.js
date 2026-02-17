import { useState } from 'react';
import { useNotifications } from '../useNotifications';
import { useAuth } from '../../context/AuthContext';
import financeService from '../../services/financeService'; // Importamos el experto

/**
 * 💳 useRecharge (UI Controller)
 * Delegamos la lógica financiera al Service.
 * Este hook solo gestiona el Formulario y el Feedback.
 */
export const useRecharge = () => {
  const { actualizarSaldo } = useAuth(); // Solo para sync visual
  const { addNotification } = useNotifications();

  // State UI
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // INPUT LOGIC
  const handleAmountChange = (e) => {
    const val = e?.target?.value || '';
    setAmount(val.replace(/\D/g, ''));
  };

  const handlePayment = async () => {
    // 1. UI VALIDATION
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount < 10000) {
      addNotification('error', 'Monto Inválido', 'Mínimo $10.000 COP.');
      return;
    }

    if (numericAmount > 5000000) {
      addNotification('error', 'Límite Excedido', 'Máximo $5.000.000 COP.');
      return;
    }

    setLoading(true);
    setIsDone(false);

    try {
      // 2. BUSINESS LOGIC (Service Layer)
      // Atomic transaction happens here
      const result = await financeService.recharge(numericAmount, method);

      // 3. STATE SYNC (React Context)
      // Actualizamos el saldo visual inmediatamente
      if (actualizarSaldo) actualizarSaldo(result.newBalance);

      // 4. SUCCESS FEEDBACK
      const receiptId = result.transaction.id.slice(0, 8);
      addNotification(
        'success',
        'Recarga Exitosa',
        `Saldo actualizado. Ref: ${receiptId}`,
        '/dashboard/finanzas'
      );

      setIsDone(true);
      setAmount('');

    } catch (error) {
      console.error("Recharge Error", error);

      let msg = "El banco rechazó la operación.";
      if (error.message === "GATEWAY_TIMEOUT") msg = "El banco tardó mucho en responder.";
      if (error.code === 'PAYMENT_ERROR') msg = "Transacción denegada por la entidad financiera.";

      addNotification('error', 'Error en Transacción', msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    amount,
    setAmount: handleAmountChange,
    method,
    setMethod,
    loading,
    isDone,
    handlePayment
  };
};