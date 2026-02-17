import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
// CORRECCIÓN: Apuntamos al archivo que acabamos de restaurar
import { useCandidatosLogic } from './useCandidatosLogic';
import { formatCurrency } from '../services/financeService';

export const useDashboard = () => {
  const { user } = useAuth();
  // Extraemos 'pendientes' para detectar el proceso más urgente
  const { stats, pendientes } = useCandidatosLogic();
  const [loading, setLoading] = useState(true);

  const dashboardData = useMemo(() => {
    if (!user || !stats) return {
      balance: "$0",
      unreadChats: 0,
      priorities: [],
      activeProcess: null,
      performance: { growth: '0%', percentile: 'Top --' }
    };

    /**
     * LÓGICA SENIOR DE PROCESO ACTIVO:
     * Buscamos si hay alguien en estado 'AGENDADO' (Recontratación) 
     * o simplemente el primer pendiente de la lista.
     */
    const prioritizedCandidate = pendientes?.find(c => c.estadoTurno === 'AGENDADO') || pendientes?.[0];

    return {
      balance: formatCurrency(user.saldo || 0),
      unreadChats: 2, // En el futuro esto vendrá de un useChatNotifications
      
      priorities: [
        { 
          id: 1, 
          type: 'postulation', 
          title: `${stats.totalPendientes || 0} postulantes esperando respuesta`, 
          color: 'emerald' 
        },
        { 
          id: 2, 
          type: 'critical', 
          title: stats.hayGanador ? `Cierre de Turno en progreso` : `Sistema de Blindaje Activo`, 
          color: stats.hayGanador ? 'indigo' : 'orange' 
        }
      ],

      activeProcess: prioritizedCandidate ? {
        title: prioritizedCandidate.estadoTurno === 'AGENDADO' 
          ? `Finalizar Recontratación Directa` 
          : `Elegir candidato para: ${prioritizedCandidate.title || 'Turno Activo'}`,
        meta: `Candidato: ${prioritizedCandidate.name} • Radicado #TRN-${prioritizedCandidate.id?.toString().slice(-4)}`,
        id: prioritizedCandidate.id
      } : {
        title: 'Sin procesos críticos hoy',
        meta: 'Todo está al día en tu ecosistema',
        id: null
      },

      performance: {
        growth: `${stats.score || '5.0'}`,
        percentile: stats.score >= 4.5 ? 'Top 12%' : 'Top 25%'
      }
    };
  }, [user, stats, pendientes]);

  useEffect(() => {
    // Reducimos el lag visual: si ya tenemos la data, cortamos el loading
    if (user && stats) {
      const timer = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(timer);
    }
  }, [user, stats]);

  return { 
    user, 
    ...dashboardData, 
    loading: loading || !user 
  };
};