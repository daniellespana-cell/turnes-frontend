import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from './useNotifications';
import { VacancyService } from '../services/vacancyService';

export const useVacantesLogic = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
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
        const normalized = data.map(v => ({
          id: v.id,
          title: v.titulo,
          type: v.tipo_turno || 'temporal',
          status: v.status === 'activa' ? 'Activa' : (v.status === 'cerrada' ? 'Completada' : 'Cancelada'),
          date: new Date(v.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
          applicants: 0, // TODO: Count applicants relation
          cost: getDisplayCost(v.tipo_turno, null) // TODO: Store billing config in DB
        }));
        setVacantes(normalized);
      }
    } catch (err) {
      console.error("Error loading vacancies:", err);
      // Fallback a array vacío pero sin localStorage
      setVacantes([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, getDisplayCost]);

  useEffect(() => {
    cargarDatos();
    // Listeners para refresco si otras pestañas cambian algo (opcional, requiere Realtime)
    window.addEventListener('vacanteFinalizada', cargarDatos);
    window.addEventListener('focus', cargarDatos); // Re-fetch on focus
    return () => {
      window.removeEventListener('vacanteFinalizada', cargarDatos);
      window.removeEventListener('focus', cargarDatos);
    };
  }, [cargarDatos]);

  // --- LÓGICA DE FILTRADO Y CONTEO ---
  const counts = useMemo(() => {
    return vacantes.reduce((acc, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    }, { Activa: 0, Completada: 0, Cancelada: 0 });
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
      addNotification('info', 'Vacante Completada', 'La vacante se ha cerrado exitosamente.');
    } catch (err) {
      console.error("Error closing vacancy:", err);
      addNotification('error', 'Error', 'No se pudo cerrar la vacante.');
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
        addNotification('warning', 'Vacante Eliminada', `Has eliminado "${vacante?.title || 'la vacante'}".`);
      } catch (err) {
        console.error("Error deleting vacancy:", err);
        addNotification('error', 'Error', 'No se pudo eliminar la vacante.');
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