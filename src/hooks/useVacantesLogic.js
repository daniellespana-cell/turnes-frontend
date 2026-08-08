import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UI_STRINGS } from '../domain/uiTranslations';
import { VacancyService } from '../services/vacancyService';

export const useVacantesLogic = () => {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [vacantes, setVacantes] = useState([]);
  const [activeTab, setActiveTab] = useState('Activa');
  const [isLoading, setIsLoading] = useState(true);

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

  // 🔄 CARGA DE DATOS CENTRALIZADA (Supabase)
  const cargarDatos = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);

    try {
      const { data, error } = await VacancyService.getMyVacancies(user.id);

      if (error) throw error;

      if (data) {
        // Normalizar datos DB -> UI
        const normalized = data
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
          .filter(v => v.status !== 'Oculta'); // 🛡️ Filtro raíz: No mostrar canceladas

        setVacantes(normalized);
      }
    } catch (err) {
      console.error("Error loading vacancies:", err);
      setVacantes([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getDisplayCost]);

  useEffect(() => {
    // Si Auth está cargando, esperamos.
    if (authLoading) return;

    // Si ya cargó Auth pero no hay usuario, no cargamos nada
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    // Si tenemos usuario, cargamos datos
    cargarDatos();

    // Listeners opcionales (Solo eventos críticos del negocio, no pausas de UI)
    const handleFocus = () => { if (user?.id) cargarDatos(); };
    window.addEventListener('vacanteFinalizada', handleFocus);
    window.addEventListener('turnes_vacancy_update', handleFocus);

    return () => {
      window.removeEventListener('vacanteFinalizada', handleFocus);
      window.removeEventListener('turnes_vacancy_update', handleFocus);
    };
  }, [user?.id, authLoading, cargarDatos]);

  // --- LÓGICA DE FILTRADO Y CONTEO ---
  const counts = useMemo(() => {
    return vacantes.reduce((acc, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    }, { Activa: 0, Completada: 0 }); // 🛡️ Eliminado Cancelada del conteo
  }, [vacantes]);

  const vacantesFiltradas = useMemo(() => {
    return vacantes.filter(v => v.status === activeTab);
  }, [vacantes, activeTab]);

  // --- ACCIONES CENTRALIZADAS ---
  const moverACompletada = async (id) => {
    // Optimistic UI Update
    setVacantes(prev => prev.map(v =>
      String(v.id) === String(id) ? { ...v, status: 'Completada' } : v
    ));

    try {
      await VacancyService.close(id);
      showToast(UI_STRINGS.TOASTS.VACANCY_CLOSED, 'success');
    } catch (err) {
      console.error("Error closing vacancy:", err);
      showToast(UI_STRINGS.TOASTS.VACANCY_CLOSE_ERROR, 'error');
      cargarDatos(); // Revert
    }
  };

  const handleAction = async (id, type) => {
    if (type === 'delete') {
      const vacante = vacantes.find(v => String(v.id) === String(id));

      // Optimistic UI
      setVacantes(prev => prev.filter(v => String(v.id) !== String(id)));

      try {
        await VacancyService.delete(id);
        showToast(`Vacante Eliminada: Has eliminado "${vacante?.title || 'la vacante'}".`, 'success');
      } catch (err) {
        console.error("Error deleting vacancy:", err);
        showToast(UI_STRINGS.TOASTS.VACANCY_DELETE_ERROR, 'error');
        cargarDatos(); // Revert
      }
    }
  };

  return {
    vacantes: vacantesFiltradas,
    activeTab,
    setActiveTab,
    counts,
    moverACompletada,
    handleAction,
    cargarDatos,
    isLoading
  };
};