import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { VACANTES_TAXONOMY } from '../domain/vacantes.taxonomy';

export const useDetalleVacante = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [hiredId, setHiredId] = useState(null);

  const getFirstName = useCallback((fullName) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  }, []);

  const ejecutarAccion = useCallback((tipo, cand, vacanteId) => {
    // 1. Buscamos los datos reales de la vacante para heredar el presupuesto
    const vacantes = JSON.parse(localStorage.getItem('turnes_vacantes') || '[]');
    let vacanteActual = vacantes.find(v => String(v.id) === String(vacanteId));

    // --- GUARDIA DE INTEGRIDAD (Solicitud de Arquitectura) ---
    // Si no existe (Cache borrado), aplicamos PROTOCOLO DE RECUPERACIÓN (Phantom Vacancy)
    if (!vacanteActual) {
      console.warn("[IntegrityGuard] Vacante no encontrada. Generando Vacante Fantasma...");

      const phantomVacante = {
        id: vacanteId,
        titulo: "Vacante Recuperada (Cache Limpio)",
        categoria: "generico",
        payment: 50000,
        billingConfig: { plan: "Básico", cargoServicio: 3000, comisionPorcentaje: 6 },
        type: 'temporal_recovery'
      };

      // La guardamos para la próxima
      vacantes.push(phantomVacante);
      localStorage.setItem('turnes_vacantes', JSON.stringify(vacantes));

      // Asignamos la fantasma como actual
      vacanteActual = phantomVacante;

      showToast('⚠️ Vacante recuperada de emergencia. Revisa los datos.', 'warning');
    }


    // --- REGLA DE COMPETENCIA: MÁXIMO 6 ENTREVISTAS (Nuevo) ---
    const redExistente = JSON.parse(localStorage.getItem('turnes_validados') || '[]');
    const entrevistasActivas = redExistente.filter(c =>
      String(c.fromVacante) === String(vacanteId) && c.isPaid === true
    ).length;

    if (entrevistasActivas >= 6) {
      showToast('Límite Alcanzado: Ya tienes 6 entrevistas en curso para esta vacante.', 'error');
      return;
    }
    // -----------------------------------------------------------

    // Validación Financiera (Soft Fail): 
    // Si falta data, autocompletamos con defaults en vez de bloquear al usuario.
    const safePayment = vacanteActual.payment || 50000;
    const safeBilling = vacanteActual.billingConfig || { plan: "Básico", cargoServicio: 3000, comisionPorcentaje: 6 };

    if (!vacanteActual.payment || !vacanteActual.billingConfig) {
      console.warn("[IntegrityGuard] Datos financieros incompletos. Usando defaults:", safePayment, safeBilling);
      // No bloqueamos, solo avisamos en consola
    }

    // Validación de Dominio (Taxonomía)
    const categoriasValidas = Object.keys(VACANTES_TAXONOMY);
    if (vacanteActual.categoria && !categoriasValidas.includes(vacanteActual.categoria)) {
      console.warn("[IntegrityGuard] Categoría desconocida, pero permitiendo flujo (Soft Fail):", vacanteActual.categoria);
    }
    // ---------------------------------------------------------


    const intenciones = {
      MATCH: {
        label: "Contratación Directa",
        msg: `Match instantáneo con ${cand.name}`,
        route: `/dashboard/chat/${cand.id}`,
        color: "success",
        payload: { type: 'match', status: 'pending' }
      },
      CITA: {
        label: "Entrevista",
        msg: `Solicitando cita a ${cand.name}`,
        route: `/dashboard/chat/${cand.id}`,
        color: "info",
        payload: { type: 'interview', status: 'pending' }
      },
      INTERES: {
        label: "Señal de Interés",
        msg: `Señal enviada a ${cand.name}`,
        route: `/dashboard/chat/${cand.id}`,
        color: "info",
        payload: { type: 'interest', status: 'open' }
      }
    };

    const accion = intenciones[tipo];
    if (!accion) return;

    // 2. PERSISTENCIA EN RED DE CONFIANZA (turnes_validados)
    const redConfianza = JSON.parse(localStorage.getItem('turnes_validados') || '[]');

    // Si el candidato ya existe, lo actualizamos; si no, lo creamos.
    // Usamos el ID de la vacante para traer el sueldo y el billingConfig con certeza gracias al Guardia.
    const nuevoRegistro = {
      ...cand,
      estadoTurno: tipo === 'MATCH' ? 'POSTULADO' : 'PENDIENTE',
      isPaid: false,
      videoHabilitado: false,
      calificacionEnviada: false,
      trabajadorYaCalifico: false,
      cicloCerrado: false,
      cicloCerrado: false,
      fromVacante: vacanteId,
      vacanteId: vacanteId, // ✅ ALIAS CRÍTICO: Para compatibilidad con CandidatoCard y sellarTurno

      // --- CONEXIÓN FINANCIERA BLINDADA ---
      payment: safePayment,
      billingConfig: safeBilling
    };

    // Actualizamos la lista sin duplicados
    const nuevaRed = redConfianza.filter(c => String(c.id) !== String(cand.id));
    localStorage.setItem('turnes_validados', JSON.stringify([...nuevaRed, nuevoRegistro]));

    if (tipo === 'MATCH') setHiredId(cand.id);
    showToast(accion.msg, accion.color);

    // 3. NAVEGACIÓN CON ESTADO ENRIQUECIDO
    navigate(`${accion.route}?intent=${accion.payload.type}`, {
      state: {
        fromVacante: vacanteId,
        candidato: nuevoRegistro, // Pasamos el registro ya con dinero validado
        metadata: {
          ...accion.payload,
          payment: nuevoRegistro.payment,
          billingConfig: nuevoRegistro.billingConfig,
          type: vacanteActual.type || 'temporal'
        },
        timestamp: new Date().toISOString()
      }
    });
  }, [navigate, showToast]);

  return { hiredId, ejecutarAccion, getFirstName };
};