import { useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { UI_STRINGS } from '../domain/uiTranslations';
import { CandidateService } from '../services/candidateService';
import { supabase } from '../services/supabaseClient';

/**
 * 🕵️‍♂️ USE DETALLE VACANTE (SENIOR)
 * Orquestador de acciones de contratación y entrevistas.
 */
export const useDetalleVacante = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [hiredAppId, setHiredAppId] = useState(null);

  const getFirstName = useCallback((fullName) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  }, []);

  // 🚀 SENIOR FIX: Ref para guard check sin stale closure
  const [processingIds, setProcessingIds] = useState([]);
  const processingRef = useRef(processingIds);
  processingRef.current = processingIds;

  const ejecutarAccion = useCallback(async (tipo, cand, vacanteId, vacanteActual = null, rachaActiva = 0, contratadosCount = 0) => {
    const targetAppId = cand.applicationId;
    
    // Guard: usa ref para evitar stale closure
    if (processingRef.current.includes(targetAppId)) return;
    
    try {
      if (!vacanteActual) {
        showToast('Error Crítico: Datos de vacante incompletos.', 'error');
        return;
      }

      // 1. REGLAS DE NEGOCIO: CUPOS MÁXIMOS
      if (tipo === 'MATCH' && contratadosCount >= 10) {
        showToast('🛑 Límite de Cupos: Esta vacante ya tiene el máximo permitido (10 seleccionados).', 'error');
        return;
      }

      // 1. REGLA DE NEGOCIO: LÍMITE DE ENTREVISTAS
      if (rachaActiva >= 10 && tipo !== 'MATCH') {
        showToast('Límite de Pipeline: Ya tienes demasiados chats abiertos para esta vacante.', 'warning');
        return;
      }

      const intenciones = {
        MATCH: {
          label: "Contratación",
          msg: `Match exitoso con ${cand.name} 🎉`,
          route: `/dashboard/chat/${targetAppId}`,
          status: 'contratado'
        },
        CITA: {
          label: "Entrevista",
          msg: `Abriendo chat de entrevista con ${cand.name}`,
          route: `/dashboard/chat/${targetAppId}`,
          status: 'chat_abierto'
        },
        INTERES: {
          label: "Interés",
          msg: `Marcando interés en ${cand.name}`,
          route: `/dashboard/chat/${targetAppId}`,
          status: 'visto'
        }
      };

      const accion = intenciones[tipo];
      if (!accion) return;

      // 2. ACTUALIZAR DATABASE (Sincronización Transaccional Fuerte)
      if (targetAppId) {
        setProcessingIds(prev => [...prev, targetAppId]); // 🔒 Bloquea el botón
        
        if (tipo === 'MATCH') {
          // 🚀 SENIOR FIX: Contratación Atómica con Notificaciones y Cierre
          const { error: rpcError } = await supabase.rpc('rpc_hire_candidate_v2', {
            p_application_id: targetAppId,
            p_vacancy_id: vacanteId
          });
          if (rpcError) throw rpcError;
        } else {
          // Acciones menores (Cita, Interés) siguen el flujo estándar
          await CandidateService.updateStatus(targetAppId, accion.status);
        }

        // 🔔 Notificar a DetalleVacantePage para que se refresque sin F5
        window.dispatchEvent(new CustomEvent('turnes_postulacion_update'));
      } else {
        showToast('No se encontró el ID de postulación.', 'error');
        return;
      }

      if (tipo === 'MATCH') setHiredAppId(targetAppId);
      showToast(accion.msg, 'success');

      // 3. NAVEGACIÓN SEGURA (Con Retraso de Satisfacción para "MATCH")
      const navegar = () => {
        navigate(`${accion.route}?intent=${tipo.toLowerCase()}`, {
          state: {
            fromVacante: vacanteId,
            candidato: cand,
            metadata: {
              type: vacanteActual.tipo_turno || 'temporal',
              status: accion.status
            }
          }
        });
      };

      // 🕒 Si es MATCH, esperamos 800ms para que vea el botón verde y procese el éxito visualmente
      if (tipo === 'MATCH') {
          setTimeout(navegar, 800);
      } else {
          navegar();
      }

    } catch (error) {
      console.error("Error en ejecutarAccion (Senior):", error);
      showToast(UI_STRINGS.TOASTS.NETWORK_ERROR, 'error');
    } finally {
      // 🔓 Desbloquear el botón
      setProcessingIds(prev => prev.filter(id => id !== targetAppId));
    }
  }, [navigate, showToast]);

  return { hiredAppId, setHiredAppId, ejecutarAccion, getFirstName, processingIds };
};