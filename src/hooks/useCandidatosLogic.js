import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { CandidateService } from '../services/candidateService';
import { useToast } from '../context/ToastContext';
import { UI_STRINGS } from '../domain/uiTranslations';
import { MatchService } from '../services/matchService';

// ─── Constantes de Dominio ────────────────────────────────────────────────────
/** Comisión de servicio de la plataforma — Single Source of Truth */
const TURNES_SERVICE_FEE_RATE = 0.06;

/** Estados que cuentan como "proceso activo con pago habilitado" */
const PAID_STATUSES = new Set(['chat_abierto', 'contratado', 'finalizado']);

/**
 * 🧑‍💼 useCandidatosLogic
 *
 * Orquestador de estado para la pantalla "Mis Candidatos" de las empresas.
 *
 * Responsabilidades:
 *   - Cargar y normalizar candidatos desde CandidateService
 *   - Filtrar por estado (pendientes / historial)
 *   - Exponer acciones: sellar, archivar, actualización optimista de UI
 *
 * NO importa supabase. NO hace fetch directo a BD.
 * Toda comunicación con la BD pasa por CandidateService.
 */
export const useCandidatosLogic = () => {
    const { user }        = useAuth();
    const { showToast }   = useToast();

    const [candidatos, setCandidatos] = useState([]);
    const [activeTab,  setActiveTab]  = useState('pendientes');
    const [isLoading,  setIsLoading]  = useState(true);

    // ─── Normalización ──────────────────────────────────────────────────────
    /**
     * Convierte un registro raw de postulaciones en el shape que consume la UI.
     * Centralizado aquí para que cualquier cambio de shape sólo toque este punto.
     */
    const normalizeApplication = useCallback((app) => {
        const candidateProfile = {
            lat:        app.candidato.lat,
            lng:        app.candidato.lng,
            categories: app.candidato.skills || []
        };

        const pago = app.vacante.pago_monto || 0;

        return {
            id:          app.id,
            candidateId: app.candidato.id,
            name:        app.candidato.nombre_display,
            avatar:      app.candidato.avatar_url,
            role:        app.candidato.rol,
            bio:         app.candidato.bio,
            skills:      app.candidato.skills || [],
            match:       MatchService.calculateScore(app.vacante, candidateProfile),
            status:      app.status,

            // Reputación — búsqueda polimórfica para cubrir versiones previas del protocol_state
            rating:              app.protocol_state?.candidato_rated_stars
                              ?? app.protocol_state?.trabajador_stars
                              ?? app.protocol_state?.rating
                              ?? 0,
            ratingRecibido:      app.protocol_state?.empresa_rated_stars
                              ?? app.protocol_state?.empresa_stars
                              ?? 0,
            trabajadorYaCalifico: app.protocol_state?.empresa_rated === true
                              || !!app.protocol_state?.empresa_stars,
            ratingsUnlocked:     app.protocol_state?.ratings_unlocked === true,
            cicloCerrado:        app.status === 'finalizado',

            // Metadata de la vacante
            vacanteTitle: app.vacante.titulo,
            vacanteTipo:  app.vacante.tipo_turno || 'Tiempo Completo',
            appliedAt:    app.created_at,
            fechaCierre:  app.finalized_at || app.updated_at,

            // Flags de UI derivados del estado
            isPaid:   PAID_STATUSES.has(app.status),
            hasChat:  PAID_STATUSES.has(app.status),

            // Billing con constante nombrada (no magic number)
            payment:       pago,
            billingConfig: { cargoServicio: pago * TURNES_SERVICE_FEE_RATE }
        };
    }, []);

    // ─── Carga de datos ─────────────────────────────────────────────────────
    const cargarDatos = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);

        try {
            const { data, error } = await CandidateService.getCompanyCandidates(user.id, true);
            if (error) throw error;

            if (data) {
                setCandidatos(data.map(normalizeApplication));
                // Avisar al resto de la app que hay datos frescos disponibles
                window.dispatchEvent(new CustomEvent('turnes_app_sync'));
            }
        } catch (err) {
            // Ignorar cancelaciones de React Strict Mode
            if (err.name === 'AbortError' || err.message?.includes('AbortError')) return;

            showToast(UI_STRINGS.COMMON.ERROR_FETCH_CANDIDATES, 'error');
            setCandidatos([]);
        } finally {
            setIsLoading(false);
        }
    }, [user, normalizeApplication, showToast]);

    // ─── Sincronización con eventos globales ────────────────────────────────
    useEffect(() => {
        cargarDatos();

        // Guard: sólo recargar si la pestaña está visible (ahorra recursos de red)
        const handleSync = () => {
            if (document.visibilityState === 'visible') cargarDatos();
        };

        // ⚠️ NO escuchar 'turnes_app_sync' — este hook lo dispara → causaría bucle infinito
        window.addEventListener('wallet_update',           handleSync);
        window.addEventListener('turnes_contract_update',  handleSync);

        return () => {
            window.removeEventListener('wallet_update',          handleSync);
            window.removeEventListener('turnes_contract_update', handleSync);
        };
    }, [cargarDatos]);

    // ─── Filtrado ───────────────────────────────────────────────────────────
    // ⚠️ 'pendiente' y 'visto' van a la tarjeta de Mis Vacantes, no a este panel
    const candidatosFiltrados = useMemo(() => ({
        pendientes: candidatos.filter(c => c.status === 'contratado' || c.status === 'chat_abierto'),
        historial:  candidatos.filter(c => c.status === 'finalizado')
    }), [candidatos]);

    // ─── Acciones ───────────────────────────────────────────────────────────

    /** Actualización optimista de un candidato (ej: seleccionar estrellas antes de confirmar) */
    const updateCandidato = useCallback((id, updates) => {
        setCandidatos(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }, []);

    /**
     * Archivar un registro del historial.
     * Optimistic UI: lo saca inmediatamente; revierte si la BD falla.
     */
    const dismissFromHistory = useCallback(async (applicationId) => {
        setCandidatos(prev => prev.filter(c => c.id !== applicationId)); // optimistic

        const { error } = await CandidateService.archiveApplication(applicationId);

        if (error) {
            showToast('No se pudo archivar. Inténtalo de nuevo.', 'error');
            cargarDatos(); // rollback: recargar estado real desde la BD
        } else {
            showToast('Registro archivado. Los datos y calificaciones se conservan.', 'success');
        }
    }, [cargarDatos, showToast]);

    /**
     * Sellar turno: califica al candidato y cierra el ciclo del contrato.
     * Valida estrellas → actualización optimista → RPC atómica → eco global.
     */
    const sellarTurno = useCallback(async (id) => {
        const target = candidatos.find(c => c.id === id);

        if (!target?.rating) {
            showToast('Faltan Estrellas: Por favor califica al candidato seleccionando al menos 1 estrella.', 'warning');
            return;
        }

        updateCandidato(id, { justSent: true }); // optimistic

        const { error } = await CandidateService.rateAndSealCandidate(
            id,
            target.candidateId,
            target.rating,
            target.comentarioPublico || '',
            target.asistio !== false
        );

        if (error) {
            updateCandidato(id, { justSent: false }); // rollback
            showToast(`Error del Servidor: ${error.message || 'No se pudo guardar la calificación.'}`, 'error');
            return;
        }

        // Eco global: avisar al Chat y a la Red de Confianza que un contrato cambió
        window.dispatchEvent(new CustomEvent('turnes_contract_update'));
        showToast('Ciclo Finalizado: El candidato ha sido calificado y movido a tu Red de Confianza (Historial).', 'success');
        cargarDatos();
    }, [candidatos, cargarDatos, updateCandidato, showToast]);

    // ─── Estadísticas ────────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        totalPendientes: candidatosFiltrados.pendientes.length,
        totalHistorial:  candidatosFiltrados.historial.length,
    }), [candidatosFiltrados]);

    return {
        activeTab,
        setActiveTab,
        pendientes:      candidatosFiltrados.pendientes,
        historial:       candidatosFiltrados.historial,
        stats,
        isLoading,
        refresh:         cargarDatos,
        updateCandidato,
        sellarTurno,
        dismissFromHistory
    };
};