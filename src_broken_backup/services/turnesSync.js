import { VacancyService } from './vacancyService';
import { logger } from '../utils/logger';

/**
 * Turnes Sync Protocol v2.0 (Live)
 * Coordina el cierre de ciclos de trabajo contra la Nube (Supabase).
 */

export const finalizarTurnoEnSistema = async (vacanteId) => {
  if (!vacanteId) {
    console.warn("[Turnes Sync] Intento de cierre sin ID de vacante válido.");
    return { success: false, error: "ID de vacante ausente" };
  }

  try {
    // 1. LLAMADA REAL A SUPABASE
    logger.info(`[Turnes Sync] Cerrando vacante ${vacanteId} en la nube...`);

    const { data, error } = await VacancyService.close(vacanteId);

    if (error) throw error;

    // 2. RITUAL DE SINCRONIZACIÓN (Eventos de Red)
    // Disparamos eventos para que la UI se refresque (Optimistic Update support)
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('vacanteFinalizada', { detail: { vacanteId } }));

    logger.info(`[Turnes Sync] ✅ Vacante ${vacanteId} sincronizada y finalizada.`);

    return { success: true, data };

  } catch (error) {
    console.error("[Turnes Sync] Error crítico en el cierre:", error);
    // TODO: Implementar Offline Queue si falla la red
    return { success: false, error: error.message };
  }
};

/**
 * Servicio para verificar si una vacante necesita calificación
 * (Ahora debería consultar a VacancyService.getById, pero mantenemos wrapper por compatibilidad)
 */
export const checkVacanteStatus = async (vacanteId) => {
  try {
    const { data } = await VacancyService.getById(vacanteId);
    return data?.estado === 'cerrada' || data?.estado === 'completada' ? 'Completada' : data?.estado;
  } catch (e) {
    return null;
  }
};