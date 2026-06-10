import { useState, useEffect } from 'react';

import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
// CORRECCIÓN: Apuntamos al archivo que acabamos de restaurar
import { useCandidatosLogic } from './useCandidatosLogic';
import { formatCurrency } from '../services/financeService';

export const useDashboard = () => {
  const { user } = useAuth();
  // Extraemos 'pendientes' para detectar el proceso más urgente
  const { stats, pendientes } = useCandidatosLogic();

  // ELIMINADO: const [loading, setLoading] = useState(true);

  const dashboardData = useMemo(() => {
    // Return Safe Defaults immediately if data is missing
    const safeBalance = user ? formatCurrency(user.saldo || 0) : "$0";
    const safeUnread = 0; // TODO: chats count

    // Default Empty Stats
    const defaultStats = {
      totalPendientes: 0,
      hayGanador: false,
      score: '5.0'
    };
    const currentStats = stats || defaultStats;

    /**
     * LÓGICA DE PROCESO ACTIVO:
     * Buscamos si hay alguien en estado 'AGENDADO' (Recontratación) 
     * o simplemente el primer pendiente de la lista.
     */
    const prioritizedCandidate = pendientes?.find(c => c.estadoTurno === 'AGENDADO') || pendientes?.[0];

    return {
      balance: safeBalance,
      unreadChats: safeUnread,

      priorities: [
        {
          id: 1,
          type: 'postulation',
          title: `${currentStats.totalPendientes || 0} postulantes esperando respuesta`,
          color: 'emerald'
        },
        {
          id: 2,
          type: 'critical',
          title: currentStats.hayGanador ? `Cierre de Turno en progreso` : `Sistema de Blindaje Activo`,
          color: currentStats.hayGanador ? 'indigo' : 'orange'
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
        growth: `${currentStats.score || '5.0'}`,
        percentile: parseFloat(currentStats.score) >= 4.5 ? 'Top 12%' : 'Top 25%'
      }
    };
  }, [user, stats, pendientes]);

  // ELIMINADO: useEffect para el loading artificial

  return {
    user,
    ...dashboardData,
    loading: false // Siempre falso para mostrar la UI de inmediato
  };
};
