import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import financeService, { formatCurrency } from '../services/financeService';
import paymentService from '../services/paymentService';
import { validateRechargeAmount } from '../utils/validationUtils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logger } from '../utils/logger';

export const useRechargePageLogic = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    // ESTADO MAESTRO
    const [status, setStatus] = useState('idle'); // idle | processing | success | error
    const [amount, setAmount] = useState(0);
    // const [method, setMethod] = useState('card'); // Deprecated: Wompi widgets handles selection
    const [transactionId, setTransactionId] = useState(null);
    const [toast, setToast] = useState(null);

    // 1. GESTIÓN DE NOTIFICACIONES LOCALES
    const triggerToast = useCallback((type, message) => {
        setToast({ type, message });
    }, []);

    // 2. BLOQUEADOR DE NAVEGACIÓN
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
        // Validación Centralizada SSOT
        const rechargeCheck = validateRechargeAmount(amount, 15000, 10000000);
        if (!rechargeCheck.isValid) {
            triggerToast('warning', rechargeCheck.error);
            return;
        }

        setStatus('processing');
        setTransactionId(null);

        try {
            // Referencia y Firma
            // AHORA PASAMOS 'recharge' explícitamente para evitar clasificación errónea
            const transactionData = await financeService.prepareWompiTransaction(amount, user?.email, user?.id, 'recharge');

            // Widget Wompi
            logger.info("💳 Iniciando Transacción:", { reference: transactionData.reference, amount: transactionData.amountInCents });

            if (!transactionData.reference || !transactionData.signature) {
                throw new Error("Datos de transacción incompletos");
            }

            // FIX: Wompi bloquea redirecciones a entornos HTTP locales.
            // Los celulares en LAN (192.168.x.x) arrojan localhost = false y recibían un redicertUrl inseguro
            // lo cual aborta Wompi Web Checkout silenciosamente.
            const isLocalEnv = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1' || 
                               window.location.hostname.startsWith('192.168.') ||
                               window.location.hostname.startsWith('10.');

            const redirectUrl = isLocalEnv ? undefined : `${window.location.origin}/dashboard/finanzas/success`;

            await paymentService.openWidget({
                amountInCents: transactionData.amountInCents, // USAR EL VALOR FIRMADO (CRÍTICO)
                reference: transactionData.reference,
                email: user?.email,
                integritySignature: transactionData.signature,
                redirectUrl: redirectUrl
            });

        } catch (error) {
            console.error(error);
            setStatus('error');
            triggerToast('error', 'No se pudo iniciar la pasarela de pagos.');
        }
    }, [amount, triggerToast, user?.email]);

    const handleReset = useCallback(() => {
        setTransactionId(null);
        setStatus('idle');
    }, []);

    // 5. GENERAR RECIBO PDF
    const handleDownloadReceipt = useCallback(() => {
        const doc = new jsPDF();
        const companyName = user?.name || "Cliente Turnes";

        doc.setFontSize(20);
        doc.text("Recibo de Transacción - Turnes", 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Cliente: ${companyName}`, 14, 32);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 38);
        doc.text(`ID Transacción: ${transactionId || 'PENDIENTE'}`, 14, 44);

        const tableColumn = ["Concepto", "Método", "Estado", "Monto"];
        const tableRows = [[
            "Recarga de Saldo",
            "Recarga de Saldo",
            "Pasarela Wompi (Todos los medios)",
            "Aprobado",
            formatCurrency(amount)
        ]];

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 55,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [16, 185, 129] }
        });

        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text("Este documento es un comprobante válido.", 14, doc.lastAutoTable.finalY + 10);

        doc.save(`Recibo_Turnes_${Date.now()}.pdf`);
    }, [amount, transactionId, user?.name]);

    return {
        status,
        amount,
        setAmount,
        transactionId,
        toast,
        setToast,
        blocker,
        handlePayment,
        handleReset,
        handleDownloadReceipt,
        triggerToast,
        navigate
    };
};
