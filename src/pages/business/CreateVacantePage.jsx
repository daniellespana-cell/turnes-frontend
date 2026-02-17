import React, { useMemo, useCallback } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { formatCurrency } from "../../services/financeService";
import { useToast } from "../../context/ToastContext";
import { useCreateVacante } from "../../hooks/useCreateVacante";

// Sub-componentes Orquestadores
import Header from "../../components/CreateVacante/Header";
import ModalidadSelector from "../../components/CreateVacante/ModalidadSelector";
import DetallesForm from "../../components/CreateVacante/DetallesForm";
import ImpulsoSwitch from "../../components/CreateVacante/ImpulsoSwitch";
import ResumenLiquidacion from "../../components/CreateVacante/ResumenLiquidacion";

import { useNotifications } from "../../hooks/useNotifications"; // Import hook

// ... imports

const CreateVacantePage = () => {
  const { user } = useOutletContext();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { addNotification } = useNotifications(); // Access context

  const {
    formData, setFormData, walletBalance, isSubmitting,
    setIsSubmitting, totals, saveToLocalStorage, INITIAL_STATE
  } = useCreateVacante(user);

  // --- 1. DELEGACIÓN DE EVENTOS (Handlers) ---
  const handleModalidadChange = useCallback((type) => {
    setFormData(prev => ({ ...prev, type }));
  }, [setFormData]);

  const handleImpulsoChange = useCallback((isUrgent) => {
    setFormData(prev => ({ ...prev, isUrgent }));
  }, [setFormData]);

  const handleQuantityChange = useCallback((offset) => {
    setFormData(prev => ({ ...prev, quantity: Math.max(1, (prev.quantity || 1) + offset) }));
  }, [setFormData]);

  const handlePaymentChange = useCallback((e) => {
    const numValue = parseInt(e.target.value.replace(/\D/g, "")) || 0;
    setFormData(prev => ({ ...prev, payment: numValue }));
  }, [setFormData]);

  // --- 2. CONFIGURACIÓN SEMÁNTICA DE UI (Flags) ---
  const detallesUI = useMemo(() => ({
    isDescriptionInvalid: totals.hasSensitiveData,
    currentLength: formData.description.length,
    displayPayment: formData.payment > 0
      ? new Intl.NumberFormat('es-CO').format(formData.payment)
      : ""
  }), [totals.hasSensitiveData, formData.description.length, formData.payment]);

  const resumenUI = useMemo(() => ({
    quantity: formData.quantity || 1,
    labelContratacion: `Contratación ${formData.type === 'fijo' ? 'Fija' : 'por Turno'}`,
    showCommission: formData.type === "temporal",
    showUrgent: formData.isUrgent,
    showSensitiveAlert: totals.hasSensitiveData,
    canPublish: totals.canPublish,
    hasFunds: totals.hasFunds,
  }), [formData.quantity, formData.type, formData.isUrgent, totals.hasSensitiveData, totals.canPublish, totals.hasFunds]);

  const resumenData = useMemo(() => ({
    costoBase: totals.costoBase,
    total: totals.total,
    totalComisiones: totals.totalComisiones,
    comisionPorcentaje: totals.comisionPorcentaje,
    costoUrgente: totals.costoUrgente,
  }), [totals]);

  // --- 3. ACCIÓN DE PUBLICACIÓN ---
  const handlePublish = async () => {
    if (!totals.canPublish || isSubmitting) return;
    setIsSubmitting(true);

    const nuevaVacante = {
      ...formData,
      id: `v-${Date.now()}`,
      status: "Activa",
      createdAt: new Date().toISOString(),
      costLabel: formData.type === "fijo"
        ? (totals.costoBase === 0 ? "Bonificada" : formatCurrency(totals.costoBase))
        : `${totals.comisionPorcentaje}% comisión`,
    };

    try {
      saveToLocalStorage(nuevaVacante);
      showToast("Vacante en línea", "success");

      // NOTIFICACIÓN DE PUBLICACIÓN
      addNotification(
        'success',
        'Vacante Publicada',
        `Has publicado "${formData.title}" exitosamente.`,
        '/dashboard/vacantes'
      );

      setFormData(INITIAL_STATE);
      setTimeout(() => navigate("/dashboard/vacantes"), 800);
    } catch (e) {
      showToast("Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 pt-4 md:pt-8 px-4 md:px-6 min-h-screen text-zinc-300 antialiased font-manrope">

      <Header onBack={() => navigate(-1)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start mt-8">

        {/* LADO IZQUIERDO: CONFIGURACIÓN */}
        <div className="lg:col-span-8 space-y-10">
          <ModalidadSelector
            selectedType={formData.type}
            onChange={handleModalidadChange}
          />

          <DetallesForm
            formData={formData}
            setFormData={setFormData}
            ui={detallesUI}
            onQuantityChange={handleQuantityChange}
            onPaymentChange={handlePaymentChange}
          />
        </div>

        {/* LADO DERECHO: LIQUIDACIÓN */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          <ImpulsoSwitch
            isUrgent={formData.isUrgent}
            onChange={handleImpulsoChange}
          />

          <ResumenLiquidacion
            data={resumenData}
            ui={resumenUI}
            walletBalance={walletBalance}
            formatCurrency={formatCurrency}
            isSubmitting={isSubmitting}
            userPlan={user?.plan}
            onPublish={handlePublish}
          />

          <footer className="px-6 opacity-40">
            <p className="text-[8px] text-zinc-600 font-bold uppercase text-center leading-relaxed tracking-tighter">
              Turnes actúa como puente de conexión. El cumplimiento del pago pactado es responsabilidad directa del empleador.
            </p>
          </footer>
        </aside>

      </div>
    </div>
  );
};

export default CreateVacantePage;