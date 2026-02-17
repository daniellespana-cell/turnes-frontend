import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { CandidateService } from '../services/candidateService';
import { useNotifications } from './useNotifications';

export const useCandidatosLogic = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [candidatos, setCandidatos] = useState([]);
  const [activeTab, setActiveTab] = useState('pendientes');
  const [isLoading, setIsLoading] = useState(true);

  // 1. CARGA REAL DESDE SUPABASE
  const cargarDatos = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      const { data, error } = await CandidateService.getCompanyCandidates(user.id);

      if (error) throw error;

      if (data) {
        // Normalización para UI (Pipeline View)
        const normalized = data.map(app => ({
          id: app.id, // Application ID (Postulación)
          candidateId: app.candidato.id,
          name: app.candidato.nombre_display,
          avatar: app.candidato.avatar_url,
          role: app.candidato.rol,
          bio: app.candidato.bio,
          skills: app.candidato.skills || [],
          match: 95, // TODO: Calcular con MatchService real
          status: app.status, // 'pendiente', 'chat_abierto', etc.

          // Metadata derivada
          vacanteTitle: app.vacante.titulo,
          vacanteTipo: app.vacante.tipo_turno || 'Tiempo Completo',
          appliedAt: new Date(app.created_at),

          // Flags de UI (Mapeo de status DB a lógica frontend)
          isPaid: app.status === 'chat_abierto' || app.status === 'contratado',
          hasChat: app.status === 'chat_abierto' || app.status === 'contratado',

          // Billing (Mock, should come from Profile/Vacancy)
          payment: 50000,
          billingConfig: { cargoServicio: 3000 }
        }));

        setCandidatos(normalized);
      }
    } catch (err) {
      console.error("Error loading candidates:", err);
      addNotification('error', "Error de Conexión", "No pudimos cargar tus candidatos.");
      setCandidatos([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 2. SINCRONIZACIÓN (Reload on Focus / Mount)
  useEffect(() => {
    cargarDatos();
    const handleFocus = () => cargarDatos();
    window.addEventListener('focus', handleFocus);
    // Listeners custom de otros componentes
    window.addEventListener('wallet_update', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('wallet_update', handleFocus);
    };
  }, [cargarDatos]);

  // 4. FILTRADO INTELIGENTE
  const candidatosFiltrados = useMemo(() => ({
    pendientes: candidatos.filter(c =>
      c.status === 'pendiente' || c.status === 'visto'
    ),
    historial: candidatos.filter(c =>
      c.status === 'chat_abierto' || c.status === 'contratado' || c.status === 'rechazado'
    )
  }), [candidatos]);

  // --- ACCIONES (Que ahora llaman a la API) ---

  // Nota: Estas acciones complejas (Contratar/Pagar) se mueven al ChatLogic
  // Aquí solo exponemos métodos simples de gestión de lista si fuera necesario.

  const refresh = cargarDatos;

  // 6. ESTADÍSTICAS
  const stats = useMemo(() => ({
    totalPendientes: candidatosFiltrados.pendientes.length,
    totalHistorial: candidatosFiltrados.historial.length,
    score: "5.0"
  }), [candidatosFiltrados]);

  return {
    activeTab,
    setActiveTab,
    pendientes: candidatosFiltrados.pendientes,
    historial: candidatosFiltrados.historial,
    stats,
    isLoading,
    refresh
  };
};