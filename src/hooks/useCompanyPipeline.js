import { useState, useEffect, useCallback, useMemo } from 'react';
import { CandidateService } from '../services/candidateService';
import { VacancyService } from '../services/vacancyService';
import { applicationService } from '../services/applicationService';
import { useToast } from '../context/ToastContext';

import { GeoService } from '../services/geoService';

/**
 * 🕵️‍♂️ USE COMPANY PIPELINE (SENIOR)
 * Encapsula toda la lógica de negocio de la Mesa de Contratación.
 * 
 * Responsabilidades:
 * - Fetch de vacantes + postulantes
 * - Agrupación por vacante
 * - Ordenamiento reactivo (client-side, sin re-fetch)
 * - Cierre manual de vacantes (Servicio atómico)
 * - Sincronización real-time via ApplicationService
 */
export const useCompanyPipeline = (userId, activeVacancyId) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [rawGrupos, setRawGrupos] = useState([]); // Datos crudos del servidor
  const [sortByRating, setSortByRating] = useState(false);

  // ─── FETCH ────────────────────────────────────────────────────────
  const fetchCompanyData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);

    try {
      const [vacsResponse, candResponse] = await Promise.all([
        VacancyService.getMyVacancies(userId),
        CandidateService.getCompanyCandidates(userId)
      ]);

      if (vacsResponse.error) throw vacsResponse.error;
      if (candResponse.error) throw candResponse.error;

      let myVacancies = vacsResponse.data || [];
      const postulaciones = candResponse.data || [];

      // Filtro dinámico según la ruta
      if (activeVacancyId === 'activa') {
        myVacancies = myVacancies
          .filter(v => v.status === 'activa' || v.status === 'pendiente')
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else if (activeVacancyId && activeVacancyId !== 'activa') {
        myVacancies = myVacancies.filter(v => String(v.id) === String(activeVacancyId));
      }

      // Agrupación
      const gruposMap = new Map();

      myVacancies.forEach(vac => {
        if (vac.status === 'cerrada') return;
        gruposMap.set(vac.id, { vacante: vac, postulantes: [] });
      });

      postulaciones.forEach(postulacion => {
        if (!postulacion.vacante || postulacion.status === 'finalizado') return;
        const vId = postulacion.vacante.id;

        if (gruposMap.has(vId)) {
          const profile = postulacion.candidato || {};
          const vac = gruposMap.get(vId).vacante;
          
          let distStr = 'Desconocida';
          if (vac.lat && vac.lng && profile.lat && profile.lng) {
            const dist = GeoService.calculateDistance(vac.lat, vac.lng, profile.lat, profile.lng);
            distStr = dist < 1 ? '< 1 km' : `${dist.toFixed(1)} km`;
          }

          gruposMap.get(vId).postulantes.push({
            id: profile.id,
            applicationId: postulacion.id,
            name: profile.nombre_display || 'Usuario Turnes',
            role: profile.rol || profile.skills?.[0] || 'Talento',
            rating: profile.calificacion || 5.0,
            verified: profile.verificado || false,
            avatar_url: profile.avatar_url,
            distance: distStr,
            status: postulacion.status
          });
        }
      });

      setRawGrupos(Array.from(gruposMap.values()));
    } catch (err) {
      console.error('Error en useCompanyPipeline:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, activeVacancyId]);

  // ─── DERIVED STATE: Sorting reactivo sin re-fetch (Fix #3 + #4) ──
  const vacantesAgrupadas = useMemo(() => {
    if (!sortByRating) return rawGrupos;

    return rawGrupos.map(grupo => ({
      ...grupo,
      postulantes: [...grupo.postulantes].sort((a, b) => b.rating - a.rating)
    }));
  }, [rawGrupos, sortByRating]);

  // ─── ACTIONS ──────────────────────────────────────────────────────

  /**
   * Cierre manual de vacante (Vía Servicio).
   */
  const closeVacancy = useCallback(async (vacancyId) => {
    try {
      const { data, error } = await VacancyService.closeVacancy(vacancyId);
      if (error) throw error;

      const title = data?.vacancyTitle || 'Vacante';
      const count = data?.affectedCount || 0;
      const msg = count > 0
        ? `"${title}" cerrada. ${count} candidato${count > 1 ? 's' : ''} notificado${count > 1 ? 's' : ''}.`
        : `"${title}" cerrada exitosamente.`;

      showToast(msg, 'success');
      window.dispatchEvent(new CustomEvent('turnes_postulacion_update'));
    } catch (err) {
      console.error('Error closing vacancy:', err);
      showToast('No pudimos cerrar la vacante.', 'error');
    }
  }, [showToast]);

  // ─── REAL-TIME SYNC (SSOT via Service) ─────────────────────────────
  useEffect(() => {
    if (!userId) return;

    // 🛡️ Suscripción Delegada al ApplicationService (Contexto Empresa)
    const channel = applicationService.subscribeToUserApplications(userId, () => {
        fetchCompanyData();
    });

    fetchCompanyData();

    return () => { 
        import('../services/supabaseClient').then(m => m.supabase.removeChannel(channel));
    };
  }, [userId, fetchCompanyData]);

  // Listener para actualizaciones manuales (Eventos de ventana)
  useEffect(() => {
    const handleUpdate = () => fetchCompanyData();
    window.addEventListener('turnes_postulacion_update', handleUpdate);
    return () => window.removeEventListener('turnes_postulacion_update', handleUpdate);
  }, [fetchCompanyData]);

  return {
    isLoading,
    vacantesAgrupadas,
    refresh: fetchCompanyData,
    sortByRating,
    setSortByRating,
    closeVacancy
  };
};
