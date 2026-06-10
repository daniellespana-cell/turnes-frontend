import { useState, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { VacancyService } from "../services/vacancyService";
import { useToast } from "../context/ToastContext";
import { UI_STRINGS } from "../domain/uiTranslations";

// Micro-Hooks K.I.S.S
import { useVacancyForm } from "./vacancy/useVacancyForm";
import { useVacancySecurity } from "./vacancy/useVacancySecurity";
import { useVacancyBilling } from "./vacancy/useVacancyBilling";
import { getSectorByTag } from "../domain/vacantes.taxonomy";

/**
 * 🔒 CERROJO DE MÓDULO — Anti-Doble-Tap iOS Safari
 *
 * Vivir en el scope del módulo (fuera de React) garantiza que sobrevive
 * a los re-mounts que iOS Safari hace al cambiar de app/tab.
 * Un useRef se resetea al desmontar; una variable de módulo no.
 */
let _vacancySubmitLock = false;

/**
 * useCreateVacante (Orchestrator Façade)
 * Delega estado, seguridad y cotización a micro-hooks (K.I.S.S).
 * Maneja la transacción de publicación con feedback explícito y cerrojo anti-doble-tap.
 */
export const useCreateVacante = (user) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Estado del Formulario
  const { formData, setFormData, handlers: formHandlers } = useVacancyForm();

  // 2. Seguridad (DLP)
  const { hasSensitiveData } = useVacancySecurity(formData.description);

  // 3. Cotización (Backend Source of Truth)
  const { walletBalance, quote, hasFunds } = useVacancyBilling(user, formData);

  // --- ACCIÓN PRINCIPAL ---
  const handlePublish = async () => {
    // Capa 1: Cerrojo de módulo (inmune a re-mounts de iOS Safari)
    if (_vacancySubmitLock) {
      showToast(UI_STRINGS.VALIDATION.PROCESSING, "info");
      return;
    }

    // Validación explícita con feedback por campo — no más silencios
    if (quote.isLoading) {
      showToast(UI_STRINGS.VALIDATION.CALCULATING_PRICE, "info");
      return;
    }
    if (!formData.tags || formData.tags.length === 0) {
      showToast(UI_STRINGS.VALIDATION.TAGS_REQUIRED, "error");
      return;
    }
    if (!formData.location?.trim()) {
      showToast(UI_STRINGS.VALIDATION.CITY_REQUIRED, "error");
      return;
    }
    
    // 🛡️ [LAW] MANDATORY MINIMUM OFFER (50k)
    if (formData.payment < 50000) {
      showToast(UI_STRINGS.VALIDATION.MIN_SALARY, "error");
      return;
    }

    if (!formData.date) {
      showToast(UI_STRINGS.VALIDATION.DATE_REQUIRED, "error");
      return;
    }

    // Validación Crítica: No permitir fechas en el pasado
    const localHoy = new Date().toLocaleDateString('en-CA'); // yyyy-mm-dd
    if (formData.date < localHoy) {
      showToast(UI_STRINGS.VALIDATION.DATE_PAST, "error");
      return;
    }
    if (!formData.description || formData.description.trim().length < 10) {
      showToast(UI_STRINGS.VALIDATION.DESCRIPTION_MIN, "error");
      return;
    }
    if (hasSensitiveData) {
      showToast(UI_STRINGS.VALIDATION.DESCRIPTION_PII, "error");
      return;
    }

    // Bajar el cerrojo sincrónicamente antes de cualquier await
    _vacancySubmitLock = true;
    setIsSubmitting(true);

    try {
      const { error } = await VacancyService.create({
        titulo: formData.tags.join(" y "),
        descripcion: formData.description,
        empresa_id: user?.id,
        categoria: formData.tags.length > 0 ? getSectorByTag(formData.tags[0]) : 'VARIOS',
        lat: formData.lat,
        lng: formData.lng,
        direccion_formateada: formData.location,
        pago_monto: formData.payment,
        fecha_turno: formData.date,
        tipo_turno: formData.type,
        status: 'activa',
        es_urgente: formData.isUrgent,
        etiquetas: formData.tags,
      });

      if (error) throw error;

      showToast(UI_STRINGS.TOASTS.VACANCY_PUBLISHED, "success");

      formHandlers.resetForm();
      _vacancySubmitLock = false; // Permitir crear otra vacante en la misma sesión
      navigate("/dashboard/vacantes");

    } catch (e) {
      console.error("❌ Error en Publicación:", e);
      const code = e?.code || '';
      const rawMsg = e?.message || 'Error desconocido';
      const errorMsg = rawMsg.includes('UNAUTHORIZED')
        ? "Sesión expirada, inicia sesión de nuevo"
        : `Error ${code}: ${rawMsg.slice(0, 55)}`;
      showToast(errorMsg, "error");

      _vacancySubmitLock = false;
      setIsSubmitting(false);
    }
  };

  // --- ADAPTADORES DE VISTA ---
  const isFormComplete =
    formData.tags?.length > 0 &&
    formData.location?.trim() &&
    formData.date &&
    formData.description?.trim().length >= 10;

  const totals = useMemo(() => ({
    ...quote,
    hasSensitiveData,
    hasFunds,
    canPublish: isFormComplete && !hasSensitiveData,
  }), [quote, hasSensitiveData, hasFunds, isFormComplete]);

  const ui = useMemo(() => ({
    detalles: {
      isDescriptionInvalid: hasSensitiveData,
      currentLength: formData.description.length,
      displayPayment: formData.payment > 0 ? new Intl.NumberFormat('es-CO').format(formData.payment) : ""
    },
    resumen: {
      quantity: formData.quantity || 1,
      labelContratacion: `Contratación ${formData.type === 'fijo' ? 'Fija' : 'por Turno'}`,
      showCommission: formData.type === "temporal",
      showUrgent: formData.isUrgent,
      showSensitiveAlert: hasSensitiveData,
      canPublish: totals.canPublish,
      hasFunds: true,
      isLoadingQuote: quote.isLoading
    },
    data: quote
  }), [formData, hasSensitiveData, quote, totals.canPublish]);

  const handlers = {
    ...formHandlers,
    handlePublish
  };

  return {
    formData,
    setFormData,
    walletBalance,
    isSubmitting,
    totals,
    handlers,
    ui,
    navigate
  };
};
