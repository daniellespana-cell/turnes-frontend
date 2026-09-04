import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UI_STRINGS } from '../domain/uiTranslations';
import { VacancyService } from '../services/vacancyService';

export const useVacantesLogic = () => {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Activa');

  // Helper para calcular costo visual dinámicamente
  const getDisplayCost = useCallback((type, billingConfig) => {
    if (billingConfig) {
      if (billingConfig.isFree) return 'Gratis';
      if (type === 'temporal') return `${billingConfig.comisionPorcentaje}%`;
      return '$19.900';
    }
    const plan = user?.plan?.toLowerCase() || 'básico';
    if (type === 'fijo') {
      return plan === 'pro' || plan === 'micro' ? 'Gratis' : '$19.900';
    }
    const rates = { 'básico': '6%', 'micro': '4%', 'pro': '0%' };
    return rates[plan] || '6%';
  }, [user]);

  // 🔄 CARGA DE DATOS CENTRALIZADA CON REACT QUERY (SSOT & Cero Spinners Innecesarios)
  const queryKey = useMemo(() => ['mis-vacantes', user?.id], [user?.id]);

  const {
    data: vacantes = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await VacancyService.getMyVacancies(user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !authLoading,
    select: useCallback((rawData) => {
      return (rawData || [])
        .map(v => ({
          id: v.id,
          title: v.titulo,
          type: v.tipo_turno || 'temporal',
          status: v.status === 'activa' ? 'Activa' 
            : (v.status === 'cerrada' ? 'Completada' 
            : (v.status === 'pendiente' ? 'Activa' : 'Oculta')), // 🛡️ Cancelada -> Oculta
          date: new Date(v.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
          applicants: Array.isArray(v.postulaciones) ? (v.postulaciones[0]?.count ?? v.postulaciones.length) : 0,
          esUrgente: v.es_urgente,
          urgenteExpiracion: v.urgente_expiracion,
          cost: getDisplayCost(v.tipo_turno, null),
          lat: v.lat,
          lng: v.lng,
          direccion_formateada: v.direccion_formateada
        }))
        .filter(v => v.status !== 'Oculta');
    }, [getDisplayCost])
  });

  // Listeners del sistema para invalidación reactiva
  useEffect(() => {
    if (!user?.id) return;

    const handleInvalidate = () => {
      queryClient.invalidateQueries({ queryKey });
    };

    window.addEventListener('vacanteFinalizada', handleInvalidate);
    window.addEventListener('turnes_vacancy_update', handleInvalidate);

    return () => {
      window.removeEventListener('vacanteFinalizada', handleInvalidate);
      window.removeEventListener('turnes_vacancy_update', handleInvalidate);
    };
  }, [user?.id, queryKey, queryClient]);

  // --- LÓGICA DE FILTRADO Y CONTEO ---
  const counts = useMemo(() => {
    return vacantes.reduce((acc, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    }, { Activa: 0, Completada: 0 });
  }, [vacantes]);

  const vacantesFiltradas = useMemo(() => {
    return vacantes.filter(v => v.status === activeTab);
  }, [vacantes, activeTab]);

  // --- ACCIONES CON ACTUALIZACIÓN OPTIMISTA Y ROLLBACK SEGURO ---
  const moverACompletada = useCallback(async (id) => {
    const previous = queryClient.getQueryData(queryKey);

    // Optimistic Update en caché de React Query
    queryClient.setQueryData(queryKey, (old = []) =>
      old.map(v => String(v.id) === String(id) ? { ...v, status: 'cerrada' } : v)
    );

    try {
      await VacancyService.close(id);
      showToast(UI_STRINGS.TOASTS.VACANCY_CLOSED, 'success');
    } catch (err) {
      console.error("Error closing vacancy:", err);
      showToast(UI_STRINGS.TOASTS.VACANCY_CLOSE_ERROR, 'error');
      if (previous) queryClient.setQueryData(queryKey, previous);
    } finally {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [queryClient, queryKey, showToast]);

  const handleAction = useCallback(async (id, type) => {
    if (type === 'delete') {
      const vacanteTarget = vacantes.find(v => String(v.id) === String(id));
      const previous = queryClient.getQueryData(queryKey);

      // Optimistic Update en caché de React Query
      queryClient.setQueryData(queryKey, (old = []) =>
        old.filter(v => String(v.id) !== String(id))
      );

      try {
        await VacancyService.delete(id);
        showToast(`Vacante Eliminada: Has eliminado "${vacanteTarget?.title || 'la vacante'}".`, 'success');
      } catch (err) {
        console.error("Error deleting vacancy:", err);
        showToast(UI_STRINGS.TOASTS.VACANCY_DELETE_ERROR, 'error');
        if (previous) queryClient.setQueryData(queryKey, previous);
      } finally {
        queryClient.invalidateQueries({ queryKey });
      }
    }
  }, [queryClient, queryKey, showToast, vacantes]);

  return {
    vacantes: vacantesFiltradas,
    activeTab,
    setActiveTab,
    counts,
    moverACompletada,
    handleAction,
    cargarDatos: refetch,
    isLoading: authLoading || isLoading
  };
};