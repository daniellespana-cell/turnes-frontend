import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { CandidateService } from '../services/candidateService';
import { useToast } from '../context/ToastContext';
import { UI_STRINGS } from '../domain/uiTranslations';
import { MatchService } from '../services/matchService';
import { supabase } from '../services/supabaseClient';

export const useCandidatosLogic = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [candidatos, setCandidatos] = useState([]);
  const [activeTab, setActiveTab] = useState('pendientes');
  const [isLoading, setIsLoading] = useState(true);

  // 1. CARGA REAL DESDE SUPABASE
  const cargarDatos = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      const { data, error } = await CandidateService.getCompanyCandidates(user.id, true);

      if (error) throw error;

      if (data) {
        // Normalización para UI (Pipeline View)
        const normalized = data.map(app => {
          // Calcula match score real usando coordenadas del candidato y la vacante
          const candidateProfile = {
            lat: app.candidato.lat,
            lng: app.candidato.lng,
            categories: app.candidato.skills || []
          };
          const matchScore = MatchService.calculateScore(app.vacante, candidateProfile);

          return ({
            id: app.id,
            candidateId: app.candidato.id,
            name: app.candidato.nombre_display,
            avatar: app.candidato.avatar_url,
            role: app.candidato.rol,
            bio: app.candidato.bio,
            skills: app.candidato.skills || [],
            match: matchScore, 
            status: app.status,

            // 🛡️ REPUTACIÓN REAL (Búsqueda Polimórfica - No más 0.0)
            rating: app.protocol_state?.empresa_rated_stars || app.protocol_state?.empresa_stars || 0,
            ratingRecibido: app.protocol_state?.candidato_rated_stars || app.protocol_state?.trabajador_stars || app.protocol_state?.rating || 0,
            trabajadorYaCalifico: app.protocol_state?.candidato_rated === true || !!app.protocol_state?.trabajador_stars,
            ratingsUnlocked: app.protocol_state?.ratings_unlocked === true,
            cicloCerrado: app.status === 'finalizado',

            // Metadata derivada con sanitización
            vacanteTitle: app.vacante.titulo,
            vacanteTipo: app.vacante.tipo_turno || 'Tiempo Completo',
            appliedAt: app.created_at,
            fechaCierre: app.finalized_at || app.updated_at,

            // Flags de UI
            isPaid: app.status === 'chat_abierto' || app.status === 'contratado' || app.status === 'finalizado',
            hasChat: app.status === 'chat_abierto' || app.status === 'contratado' || app.status === 'finalizado',

            // Billing
            payment: app.vacante.pago_monto || 0,
            billingConfig: { cargoServicio: (app.vacante.pago_monto || 0) * 0.06 }
          });
        });

        // 🚀 SINCRONIZACIÓN GLOBAL: Avisar que hay nuevos datos disponibles
        window.dispatchEvent(new CustomEvent('turnes_app_sync'));

        setCandidatos(normalized);
      }
    } catch (err) {
      // Ignorar cancelaciones de React Strict Mode o cambio rápido de pestañas
      const isAbortError = err.name === 'AbortError' || (err.message && err.message.includes('AbortError'));
      if (isAbortError) return;

      console.error("Error loading candidates:", err);
      showToast(UI_STRINGS.COMMON.ERROR_FETCH_CANDIDATES, 'error');
      setCandidatos([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 2. SINCRONIZACIÓN (Evitar Bucles Infinitos)
  useEffect(() => {
    cargarDatos();
    
    const handleSync = () => {
      // 🛡️ Guard: Solo recargar si la pestaña está visible para ahorrar recursos
      if (document.visibilityState === 'visible') {
        cargarDatos();
      }
    };

    // Listeners de eventos externos de negocio
    window.addEventListener('wallet_update', handleSync);
    window.addEventListener('turnes_contract_update', handleSync);
    // ⚠️ NO escuchar 'turnes_app_sync' aquí, ya que este hook lo dispara, causando bucles.

    return () => {
      window.removeEventListener('wallet_update', handleSync);
      window.removeEventListener('turnes_contract_update', handleSync);
    };
  }, [cargarDatos]);

  // 4. FILTRADO INTELIGENTE (RED DE CONFIANZA / RATING)
  // ⚠️ Excluimos 'pendiente' y 'visto' porque esos van a la "Tarjeta de Mis Vacantes"
  const candidatosFiltrados = useMemo(() => ({
    pendientes: candidatos.filter(c =>
      c.status === 'contratado' // Está contratado/trabajando y pendiente de Sellar
    ),
    historial: candidatos.filter(c =>
      c.status === 'finalizado' // Ya fue calificado y sellado (Pasa al historial para recontratar)
    )
  }), [candidatos]);

  // --- ACCIONES DE RED DE CONFIANZA ---
  const updateCandidato = useCallback((id, updates) => {
    // Actualización optimista del UI local temporal (para rellenar estrellas/comentarios rápidos)
    setCandidatos(prev => prev.map(c =>
      c.id === id ? { ...c, ...updates } : c
    ));
  }, []);

  /**
   * Archivar un registro del historial.
   * Optimistic UI + marca 'archivado' en BD para que no vuelva a aparecer.
   */
  const dismissFromHistory = useCallback(async (applicationId) => {
    // 1. Optimistic: sacar del array de inmediato
    setCandidatos(prev => prev.filter(c => c.id !== applicationId));

    try {
      const { error } = await supabase
        .from('postulaciones')
        .update({ status: 'archivado', updated_at: new Date().toISOString() })
        .eq('id', applicationId);

      if (error) throw error;
      showToast('Registro archivado. Los datos y calificaciones se conservan.', 'success');
    } catch (err) {
      console.error('Error archiving candidate:', err);
      showToast('No se pudo archivar. Inténtalo de nuevo.', 'error');
      cargarDatos(); // Revertir: recargar datos reales
    }
  }, [cargarDatos, showToast]);

  const sellarTurno = useCallback(async (id, vacanteId) => {
    try {
      // 1. Obtener la calificación insertada por la empresa en UI local
      const targetLocal = candidatos.find(c => c.id === id);

      if (!targetLocal || !targetLocal.rating) {
        showToast('Faltan Estrellas: Por favor califica al candidato seleccionando al menos 1 estrella.', 'warning');
        return;
      }

      // 💥 ACTUALIZACIÓN OPTIMISTA AL INSTANTE (Evita que el usuario crea que se congeló y pulse F5)
      updateCandidato(id, { justSent: true });

      // 2. Envía a DB mediante Transacción Atómica (Ratings, Carga de Perfil, Sellado)
      const { error } = await CandidateService.rateAndSealCandidate(
        id, // applicationId
        targetLocal.candidateId,
        targetLocal.rating,
        targetLocal.comentarioPublico || '',
        targetLocal.asistio !== false // Por defecto true
      );

      if (error) throw error;

      // 🚀 ECO GLOBAL: Avisarle a toda la app que un contrato mutó estado (Para chats y red de confianza paralela)
      window.dispatchEvent(new CustomEvent('turnes_contract_update'));

      showToast('Ciclo Finalizado: El candidato ha sido calificado y movido a tu Red de Confianza (Historial).', 'success');
      cargarDatos();
    } catch (error) {
      console.error("Error al sellar candidato (RPC v2):", error);
      updateCandidato(id, { justSent: false }); // Revertir optimismo si falla
      showToast(`Error del Servidor: ${error.message || 'No se pudo guardar la calificación.'}`, 'error');
    }
  }, [candidatos, cargarDatos]);

  const refresh = cargarDatos;

  // 6. ESTADÍSTICAS
  const stats = useMemo(() => ({
    totalPendientes: candidatosFiltrados.pendientes.length,
    totalHistorial: candidatosFiltrados.historial.length,
  }), [candidatosFiltrados]);

  return {
    activeTab,
    setActiveTab,
    pendientes: candidatosFiltrados.pendientes,
    historial: candidatosFiltrados.historial,
    stats,
    isLoading,
    refresh,
    updateCandidato,
    sellarTurno,
    dismissFromHistory
  };
};