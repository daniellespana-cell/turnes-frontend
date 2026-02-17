import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { typography } from '../../styles/typography';
import { useAuth } from '../../context/AuthContext';

// Componentes Core
import RechargeAmount from '../../components/finance/RechargeAmount';
import PaymentMethods from '../../components/finance/PaymentMethods';
import RechargeSummary from '../../components/finance/RechargeSummary';
import TransactionSuccess from '../../components/finance/TransactionSuccess';
import TransactionError from '../../components/finance/TransactionError';
import Toast from '../../components/common/Toast';
import ConfirmNavigationModal from '../../components/common/ConfirmNavigationModal';

// Services
// Services
import { useNotifications } from '../../hooks/useNotifications'; // Import hook
import financeService, { formatCurrency } from '../../services/financeService';
import paymentService from '../../services/paymentService'; // [NEW] Wompi Integration
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const RechargePage = () => {
  const navigate = useNavigate();
  const { user, actualizarSaldo } = useAuth();
  const { addNotification } = useNotifications(); // Access context

  // ESTADO MAESTRO
  const [status, setStatus] = useState('idle'); // idle | processing | success | error
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('card');
  const [transactionId, setTransactionId] = useState(null);
  const [toast, setToast] = useState(null);

  // 1. GESTIÓN DE NOTIFICACIONES
  const triggerToast = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  // 2. BLOQUEADOR DE NAVEGACIÓN (BLINDAJE TOTAL)
  const blocker = useBlocker(
    useCallback(
      ({ currentValue, nextValue }) =>
        amount > 0 &&
        status === 'idle' &&
        currentValue.pathname !== nextValue.pathname,
      [amount, status]
    )
  );

  // 3. PROTECCIÓN CIERRE PESTAÑA
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (amount > 0 && status === 'idle') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [amount, status]);

  // 4. ORQUESTADOR DE PAGO (INTEGRACIÓN WOMPI)
  const handlePayment = useCallback(async () => {
    if (amount < 20000) {
      triggerToast('warning', 'El monto mínimo permitido es $20.000');
      return;
    }

    setStatus('processing');
    setTransactionId(null);

    try {
      // 1. Preparar la transacción (Generar Referencia y Firma desde Backend)
      // Nota: En producción, esto debe llamar a una Edge Function para firmar con el Secreto.
      const transactionData = await financeService.prepareWompiTransaction(amount, user?.email);

      // 2. Abrir Widget Wompi
      await paymentService.openWidget({
        amountInCents: amount * 100, // Wompi usa centavos
        reference: transactionData.reference,
        email: user?.email,
        integritySignature: transactionData.signature,
        redirectUrl: `${window.location.origin}/dashboard/finanzas/success` // URL de retorno
      });

      // Nota: El flujo se interrumpe aquí porque Wompi redirige o usuario cierra.
      // El estado 'success' se manejará en la página de retorno o via Webhook.

    } catch (error) {
      console.error(error);
      setStatus('error');
      triggerToast('error', 'No se pudo iniciar la pasarela de pagos.');
    }
  }, [amount, method, triggerToast, user?.email]);

  const handleReset = useCallback(() => {
    setTransactionId(null);
    setStatus('idle');
  }, []);

  // 5. GENERAR RECIBO PDF
  const handleDownloadReceipt = useCallback(() => {
    const doc = new jsPDF();
    const companyName = user?.name || "Cliente Turnes";

    // Encabezado
    doc.setFontSize(20);
    doc.text("Recibo de Transacción - Turnes", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Cliente: ${companyName}`, 14, 32);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 38);
    doc.text(`ID Transacción: ${transactionId}`, 14, 44);

    // Tabla de Detalles
    const tableColumn = ["Concepto", "Método", "Estado", "Monto"];
    const tableRows = [[
      "Recarga de Saldo",
      method === 'card' ? 'Tarjeta Global' : method === 'pse' ? 'Transferencia (PSE)' : 'Billetera',
      "Aprobado",
      formatCurrency(amount)
    ]];

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [16, 185, 129] } // Emerald color
    });

    // Pie de página
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Este documento es un comprobante válido de la transacción.", 14, doc.lastAutoTable.finalY + 10);
    doc.text(`Generado el ${new Date().toLocaleString()}`, 14, doc.lastAutoTable.finalY + 16);

    doc.save(`Recibo_Turnes_${transactionId}.pdf`);
  }, [amount, method, transactionId, user?.name]);

  // --- RENDERIZADO DE ESTADOS FINALES ---
  if (status === 'success') {
    return (
      <div className="max-w-5xl mx-auto p-4 font-manrope min-h-screen">
        <TransactionSuccess
          amount={amount}
          transactionId={transactionId}
          onDownloadPDF={handleDownloadReceipt}
        />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-5xl mx-auto p-4 font-manrope min-h-screen">
        <TransactionError onRetry={handlePayment} onCancel={handleReset} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 pt-4 md:pt-8 px-4 md:px-6 text-zinc-300 antialiased font-manrope min-h-screen">

      <header className="flex flex-row items-center gap-4 md:gap-6 mb-8 md:mb-12 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-zinc-900 rounded-full border border-white/5 active:scale-95 transition-all shadow-lg shrink-0 group hover:bg-white/5"
        >
          <ArrowLeft size={20} className="md:size-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <div className="flex-1 min-w-0 space-y-0.5">
          <h1 className={typography.pageTitle}>
            Recargar <span className={typography.gradient}>Saldo</span>
          </h1>
          <nav className="flex items-center gap-2 mt-1 md:mt-2 opacity-60">
            <span className={typography.sectionTitle + " cursor-pointer hover:text-white transition-colors text-[9px]"} onClick={() => navigate('/dashboard/finanzas')}>Finanzas</span>
            <ChevronRight size={10} className="text-zinc-600" />
            <span className={typography.sectionTitle + " text-emerald-500 text-[9px]"}>Fondos</span>
          </nav>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6 max-w-5xl mx-auto">

        <div className={`lg:col-span-8 space-y-6 transition-all duration-500 ${status === 'processing' ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'
          }`}>
          <RechargeAmount
            amount={amount}
            setAmount={setAmount}
            onAmountChange={(msg) => triggerToast('info', msg)}
          />
          <PaymentMethods method={method} setMethod={setMethod} />
        </div>

        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          <RechargeSummary
            amount={amount}
            isProcessing={status === 'processing'}
            onPay={handlePayment}
          />

          <footer className="px-6 opacity-40">
            <p className="text-[8px] text-zinc-600 font-bold uppercase text-center leading-relaxed tracking-tighter">
              PCI-DSS Compliant Infrastructure • Turnes v4.0. <br />
              Las transacciones son procesadas bajo protocolos de cifrado de grado militar.
            </p>
          </footer>
        </aside>

      </div>

      {toast && <Toast data={toast} onClose={() => setToast(null)} />}

      {blocker && blocker.state === "blocked" && (
        <ConfirmNavigationModal
          isOpen={true}
          onConfirm={() => blocker.proceed()}
          onCancel={() => blocker.reset()}
        />
      )}
    </div>
  );
};

export default RechargePage;