import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { configService } from '../services/configService';

/**
 * 🚀 useBoostPurchase
 * Hook senior para orquestar la compra de Impulso Urgente (48H).
 * Gestiona el estado del modal, el flujo de pasos y la transacción atómica.
 */
export const useBoostPurchase = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('details'); // 'details' | 'picker' | 'processing'
  const [selectedVacancyId, setSelectedVacancyId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dynamicPrice, setDynamicPrice] = useState(7000); // Fallback inicial

  // 📡 Cargar precio real desde el SSOT (Base de Datos)
  useEffect(() => {
    const fetchPrice = async () => {
      const { data } = await configService.getMicroservices();
      if (data) {
        const target = user?.role === 'empresa' ? 'EMPRESAS' : 'TRABAJADORES';
        const boostService = data.find(s => 
            s.title.toLowerCase().includes('impulso') && 
            s.target_audience === target
        );
        if (boostService) setDynamicPrice(parseFloat(boostService.price));
      }
    };
    fetchPrice();
  }, [user?.role]);

  const openBoostFlow = useCallback(() => {
    setIsOpen(true);
    setStep('details');
    setSelectedVacancyId(null);
  }, []);

  const closeBoostFlow = useCallback(() => {
    setIsOpen(false);
    setStep('details');
  }, []);

  const goToPicker = useCallback(() => setStep('picker'), []);

  /**
   * Ejecuta la compra atómica vía RPC.
   */
  const executePurchase = useCallback(async (vacancyId) => {
    if (!vacancyId) return;
    
    setIsSubmitting(true);
    setStep('processing');

    try {
      const { data, error } = await supabase.rpc('rpc_buy_boost_v1', {
        p_vacancy_id: vacancyId,
        p_price: dynamicPrice 
      });

      if (error) throw error;

      showToast(`¡Impulso Activo! "${data.vacancyTitle}" estará destacada por 48 horas.`, 'success');
      
      if (refreshUser) await refreshUser();
      closeBoostFlow();
      
      window.dispatchEvent(new CustomEvent('turnes_vacancy_update'));

    } catch (err) {
      console.error('Error buying boost:', err);
      const msg = err.message?.includes('INSUFFICIENT_FUNDS') 
        ? 'Saldo insuficiente. Recarga tu cuenta para continuar.' 
        : 'Error al procesar la compra. Inténtalo de nuevo.';
      
      showToast(msg, 'error');
      setStep('picker');
    } finally {
      setIsSubmitting(false);
    }
  }, [showToast, refreshUser, closeBoostFlow, dynamicPrice]);

  return {
    isOpen,
    step,
    isSubmitting,
    selectedVacancyId,
    setSelectedVacancyId,
    openBoostFlow,
    closeBoostFlow,
    goToPicker,
    executePurchase,
    userBalance: user?.saldo || 0,
    price: dynamicPrice
  };
};
