import { useState, useEffect, useMemo } from "react";
import { getWalletData } from "../services/financeService";
import { CIUDADES_COORDS } from "../domain/vacantes.taxonomy";
import { supabase } from "../services/supabaseClient";
import { VacancyService } from "../services/vacancyService";

const INITIAL_STATE = {
  title: "",
  location: "",
  address: "", // Exact Address
  lat: null,
  lng: null,
  description: "",
  schedule: "",
  date: "",
  payment: 50000,
  type: "temporal",
  quantity: 1,
  isUrgent: false,
};

export const useCreateVacante = (user) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadWallet = async () => {
      const userId = user?.id || user?.uid || user?._id;
      if (!userId) return;
      const data = await getWalletData(userId);
      setWalletBalance(data?.balance || 0);
    };
    loadWallet();
  }, [user]);

  // --- AUTO-DETECT LAT/LNG ---
  useEffect(() => {
    if (formData.location && CIUDADES_COORDS[formData.location]) {
      const { lat, lng } = CIUDADES_COORDS[formData.location];
      // Solo actualizamos si son diferentes para evitar loop
      if (formData.lat !== lat || formData.lng !== lng) {
        setFormData(prev => ({ ...prev, lat, lng }));
      }
    }
  }, [formData.location]);

  const totals = useMemo(() => {
    const plan = user?.plan?.toLowerCase() || 'básico';
    const qty = Math.max(1, formData.quantity || 1);

    // --- 1. DETECTOR DE DATOS SENSIBLES (ANTI-FUGA) ---
    const sensitivePatterns = [
      /\d{7,}/g,
      /calle|carrera|cll|cra|avenida|av\.|transversal|diagonal/gi,
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      /3\d{9}/g,
      /(uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|cero|celular|teléfono|contacto|llamar|escríbeme|wpp|whatsapp)/gi
    ];

    const hasSensitiveData = sensitivePatterns.some(pattern => {
      const match = formData.description.match(pattern);
      if (pattern.source.includes('uno|dos')) {
        return match && match.length >= 3;
      }
      return match;
    });

    // --- 2. LÓGICA DE COMISIONES POR CANTIDAD ---
    const comisiones = { básico: 0.06, micro: 0.04, pro: 0.0 };
    const porcentajePlan = comisiones[plan] ?? 0.06;

    const comisionPorPersona = formData.type === "temporal" ? formData.payment * porcentajePlan : 0;
    const totalComisiones = comisionPorPersona * qty;

    // --- 3. LÓGICA DE COSTOS FIJOS ---
    let costoBase = 0;
    if (formData.type === "fijo") {
      const fixedPrice = 19900;
      if (plan === 'básico') costoBase = fixedPrice * qty;
      if (plan === 'micro') {
        const remainingFree = Math.max(0, 7 - (user?.fixedCount || 0));
        const billableQty = Math.max(0, qty - remainingFree);
        costoBase = billableQty * fixedPrice;
      }
      if (plan === 'pro') {
        const remainingFree = Math.max(0, 30 - (user?.fixedCount || 0));
        const billableQty = Math.max(0, qty - remainingFree);
        costoBase = billableQty * fixedPrice;
      }
    }

    const costoUrgente = formData.isUrgent ? 7000 : 0;
    const totalInversion = costoBase + costoUrgente + totalComisiones;

    const isFormComplete = formData.title.trim() &&
      formData.location.trim() &&
      formData.date &&
      formData.description.trim().length >= 10;

    // --- NUEVO: billingConfig (Contrato para el Chat) ---
    // Agrupamos la data financiera para que useChatLogic la lea después
    const billingConfig = {
      plan,
      cargoServicio: Math.round(comisionPorPersona), // Lo que se cobra por cada chat exitoso
      total: Math.round(formData.payment + comisionPorPersona), // Lo que el sidebar mostrará
      comisionPorcentaje: porcentajePlan * 100,
      isFree: comisionPorPersona === 0
    };

    return {
      total: totalInversion,
      costoBase,
      costoUrgente,
      totalComisiones,
      comisionPorPersona,
      comisionPorcentaje: porcentajePlan * 100,
      hasSensitiveData,
      hasFunds: walletBalance >= totalInversion,
      isPriceValid: formData.payment >= 50000,
      canPublish: isFormComplete &&
        walletBalance >= totalInversion &&
        formData.payment >= 50000 &&
        !hasSensitiveData,
      billingConfig // Inyectamos el contrato
    };
  }, [formData, walletBalance, user]);



  const saveToSupabase = async (vacante) => {
    try {
      // 1. Preparamos el Payload (DTO)
      const vacancyPayload = {
        titulo: vacante.title,
        descripcion: vacante.description,
        empresa_id: user?.id,
        categoria: 'VARIOS', // TODO: Usar categoría real del form
        lat: vacante.lat,
        lng: vacante.lng,
        direccion_formateada: vacante.address || vacante.location,
        pago_monto: vacante.payment, // DB schema uses pago_monto? Need to check schema or VacancyService
        fecha_turno: vacante.date,
        tipo_turno: vacante.type,
        estado: 'activa'
      };

      // 2. Llamada al Servicio (KISS)
      const { data, error } = await VacancyService.create(vacancyPayload);

      if (error) throw error;

      console.log("✅ Vacante creada:", data);

    } catch (err) {
      console.error("Service Error:", err);
      // Fallback LocalStorage (Solo si falla la API, para demo robusta)
      const existentes = JSON.parse(localStorage.getItem("turnes_vacantes") || "[]");
      localStorage.setItem("turnes_vacantes", JSON.stringify([vacante, ...existentes]));
      throw err; // Re-throw para que la UI sepa
    }
  };

  return {
    formData,
    setFormData,
    walletBalance,
    isSubmitting,
    setIsSubmitting,
    totals,
    saveToLocalStorage: saveToSupabase, // Kept name to avoid breaking Page
    INITIAL_STATE
  };
};