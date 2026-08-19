/**
 * Diccionario de Notificaciones — Turnes (Empresa ↔ Candidato)
 * El Observer despacha eventos neutrales ('PAYMENT_SUCCESS'), este
 * archivo los traduce al texto correcto según el rol del usuario.
 * Tokens de interpolación: {{key}} → reemplazado por `metadata.key`
 */

const D = '/dashboard';

const FALLBACK = { title: 'Notificación del Sistema', body: 'Hay una novedad en tu cuenta.', icon: '🔔', color: 'zinc', link: `${D}/notifications` };

export const NOTIFICATION_DICTIONARY = {
    INVITE_RECEIVED: {
        empresa:   { title: 'Invitación Enviada',       body: 'Invitaste a un talento a {{jobTitle}}. Procede al pago para desbloquear el chat.',           icon: '📨', color: 'blue',    link: `/candidatos` },
        candidato: { title: '¡Te invitaron a un Turno!', body: '{{companyName}} quiere contratarte para {{jobTitle}}. Revisa la oferta en tus postulaciones.', icon: '🎯', color: 'emerald', link: `/dashboard/chat/{{entityId}}` },
    },
    REHIRE_OFFER_RECEIVED: {
        empresa:   { title: 'Oferta Directa Enviada',   body: 'Enviamos tu propuesta a {{candidateName}}. Descontamos la comisión de tu billetera.',        icon: '💎', color: 'purple',  link: `/dashboard/chats` },
        candidato: { title: '¡Nueva Oferta Directa!',    body: '{{companyName}} te ha enviado una oferta de recontratación para {{jobTitle}}.',             icon: '🔥', color: 'purple',  link: `/dashboard/chat/{{entityId}}` },
    },
    INVITATION_ACCEPTED: {
        empresa:   { title: 'Invitación Aceptada',  body: '{{candidateName}} aceptó tu invitación para {{jobTitle}}. ¡Abre el chat!', icon: '🤝', color: 'emerald', link: `/dashboard/chat/{{entityId}}` },
        candidato: { title: 'Invitación Aceptada',  body: 'Aceptaste la invitación de {{companyName}} para {{jobTitle}}.',            icon: '✅', color: 'emerald', link: `/dashboard/chat/{{entityId}}` },
    },
    MATCH_ESTABLISHED: {
        empresa:   { title: 'Nuevo Match',          body: '{{candidateName}} coincide con tu búsqueda. Evalúa su perfil y procede al contacto.',              icon: '🤝', color: 'emerald', link: `/dashboard/buscar-talento?perfil={{candidateId}}` },
        candidato: { title: 'Te han encontrado',    body: '{{companyName}} está interesada en tu perfil para {{jobTitle}}. Revisa el chat.',                  icon: '🔔', color: 'blue',    link: `/dashboard/chat/{{entityId}}` },
    },
    CHAT_MESSAGE: {
        empresa:   { title: 'Mensaje de {{senderName}}',  body: '"{{messagePreview}}"', icon: '💬', color: 'purple', link: `/dashboard/chat/{{entityId}}` },
        candidato: { title: 'Mensaje de {{senderName}}', body: '"{{messagePreview}}"', icon: '💬', color: 'purple', link: `/dashboard/chat/{{entityId}}` },
    },
    JOB_APPLIED: {
        empresa:   { title: 'Nueva Postulación',  body: '{{candidateName}} se postuló a {{jobTitle}}. Ingresa a revisar su perfil.',                  icon: '📋', color: 'amber',   link: `/dashboard/vacantes` },
        candidato: { title: 'Postulación Enviada', body: 'Te postulaste a {{jobTitle}} en {{companyName}}. Te avisaremos al haber novedades.',           icon: '✅', color: 'emerald', link: D },
    },
    PAYMENT_SUCCESS: {
        empresa:   { title: 'Comisión Pagada',    body: 'Pago de ${{amount}} COP aprobado. Canal de {{candidateName}} desbloqueado. Procede a Validación Visual.',  icon: '💳', color: 'yellow',  link: `/dashboard/chat/{{entityId}}` },
        candidato: { title: 'Canal de Contacto Activo', body: '{{companyName}} ha activado la comunicación directa contigo. Tu chat está disponible.',                 icon: '🔓', color: 'emerald', link: `/dashboard/chat/{{entityId}}` },
    },
    CALL_SCHEDULED: {
        empresa:   { title: 'Validación Iniciada',     body: 'Invitaste a {{candidateName}} a videollamada. Esperando que acepte.',                       icon: '🎥', color: 'blue', link: `/dashboard/chat/{{entityId}}` },
        candidato: { title: '¡Invitación a Video!',    body: '{{companyName}} desea validar tu identidad. Acepta cuando estés listo.',                    icon: '📹', color: 'blue', link: `/dashboard/chat/{{entityId}}` },
    },
    CONTRACT_SIGNED: {
        empresa:   { title: 'Acuerdo Firmado',     body: 'El acuerdo con {{candidateName}} fue formalizado. Puedes proceder a finalizar.',                icon: '📝', color: 'purple',  link: `/dashboard/chat/{{entityId}}` },
        candidato: { title: '¡Fuiste Seleccionado!', body: '{{companyName}} firmó el acuerdo. ¡Felicitaciones! Preséntate puntualmente.',               icon: '🎉', color: 'emerald', link: `/dashboard/chat/{{entityId}}` },
    },
    CONTRACT_SEALED: {
        empresa:   { title: 'Proceso Completado', body: 'Turno con {{candidateName}} sellado. Recuerda calificarlo para tu Red de Confianza.',           icon: '🔒', color: 'zinc', link: `/candidatos` },
        candidato: { title: 'Turno Finalizado',   body: 'El proceso con {{companyName}} concluyó. El empleador pronto te dejará una calificación.',     icon: '🏁', color: 'zinc', link: `/dashboard/finanzas` },
    },
    RATING_RECEIVED: {
        empresa:   { title: 'Nueva Evaluación',    body: '{{authorName}} dejó su evaluación. Revísala en tus Calificaciones.',                     icon: '⭐', color: 'amber', link: `/dashboard/calificaciones` },
        candidato: { title: 'Te Calificaron',      body: '{{authorName}} ha evaluado tu trabajo. Envía tu calificación para descubrir la tuya.',       icon: '⭐', color: 'amber', link: `/dashboard/calificaciones` },
    },
    NEW_JOB_ZONE: {
        empresa:   { title: 'Trabajadores Notificados',  body: 'Tu vacante {{jobTitle}} fue enviada a los talentos cercanos.',                           icon: '🚀', color: 'emerald', link: D },
        candidato: { title: '¡Nueva Vacante en tu Zona!',    body: '{{companyName}} acaba de publicar: {{jobTitle}}. ¡Postúlate ahora mismo!',           icon: '📍', color: 'emerald', link: `/dashboard/explorar?vacante={{entityId}}` },
    },
    VACANCY_CLOSED: {
        empresa:   { title: 'Vacante Cerrada',              body: 'Cerraste el proceso de {{jobTitle}}. Se notificó a todos los candidatos pendientes.',         icon: '📦', color: 'zinc',    link: `/dashboard/vacantes` },
        candidato: { title: 'Proceso Finalizado',           body: '{{companyName}} cerró la vacante de {{jobTitle}}. ¡Gracias por participar!',                  icon: '📋', color: 'zinc',    link: `/dashboard/postulaciones` },
    },
    RECHARGE_SUCCESS: {
        empresa:   { title: 'Recarga Exitosa',  body: 'Tu billetera ha sido recargada con ${{amount}} COP.', icon: '💰', color: 'emerald', link: `/dashboard/finanzas/recargar` },
        candidato: { title: 'Recarga Exitosa',  body: 'Tu billetera ha sido recargada con ${{amount}} COP.', icon: '💰', color: 'emerald', link: `/dashboard/finanzas` },
    },
    PLAN_UPGRADED: {
        empresa:   { title: '¡Plan Mejorado!',  body: 'Tu suscripción ha mejorado al plan {{new_plan}}. Has ganado: {{gained}}.', icon: '🚀', color: 'purple', link: `/dashboard/upgrade` },
        candidato: { title: '¡Plan Mejorado!',  body: 'Tu cuenta ha mejorado al plan {{new_plan}}. Has ganado: {{gained}}.', icon: '🚀', color: 'purple', link: `/dashboard/upgrade` },
    },
    PLAN_DOWNGRADED: {
        empresa:   { title: 'Cambio de Plan',  body: 'Has cambiado al plan {{new_plan}}. Perdiste: {{lost}}.', icon: 'ℹ️', color: 'blue', link: `/dashboard/upgrade` },
        candidato: { title: 'Cambio de Plan',  body: 'Has cambiado al plan {{new_plan}}. Perdiste: {{lost}}.', icon: 'ℹ️', color: 'blue', link: `/dashboard/upgrade` },
    },

    // ─── VERIFICACIÓN ELITE ────────────────────────────────────────────────────
    VERIFICATION_APPROVED: {
        empresa: {
            title: '🛡️ ¡Eres una Empresa Verificada Elite!',
            body:  'Tu cuenta ahora tiene el sello de confianza de Turnes. Desde hoy: apareces primero en búsquedas de talento, tu perfil muestra el badge "Elite Verificado", accedes a candidatos con mayor calificación y generas más postulaciones. ¡Exprime al máximo tu nuevo estatus!',
            icon:  '🛡️',
            color: 'blue',
            link:  `/dashboard/perfil`,
        },
        candidato: {
            title: '🛡️ ¡Perfil Verificado Elite!',
            body:  'Tu identidad fue validada por el equipo de Turnes. Desde hoy: las empresas ven tu badge de confianza, apareces con mayor visibilidad en el radar de talento y tu tasa de contacto aumenta significativamente.',
            icon:  '🛡️',
            color: 'blue',
            link:  `/perfil`,
        },
    },

    VERIFICATION_REJECTED: {
        empresa: {
            title: 'Solicitud de Verificación Rechazada',
            body:  'Tu solicitud no fue aprobada. Razón: {{reason}}. El monto pagado fue reembolsado automáticamente a tu billetera. Puedes volver a solicitar la verificación con la documentación correcta.',
            icon:  '❌',
            color: 'red',
            link:  `/dashboard/upgrade`,
        },
        candidato: {
            title: 'Solicitud de Verificación Rechazada',
            body:  'Tu solicitud no fue aprobada. Razón: {{reason}}. El monto fue reembolsado a tu billetera. Revisa tus documentos y vuelve a intentarlo.',
            icon:  '❌',
            color: 'red',
            link:  `/dashboard/upgrade`,
        },
    },
};

/**
 * Resuelve el texto de UI a partir de un evento de la BD.
 * @param {string} tipo - Tipo de evento ('PAYMENT_SUCCESS', etc.)
 * @param {string} userRole - 'empresa' | 'candidato'
 * @param {object} [metadata={}] - Datos para interpolación de tokens {{key}}
 * @param {string} [entityId=null] - ID de la entidad relacionada (Ej. conversacion_id)
 */
export function resolveNotificationText(tipo, userRole, metadata = {}, entityId = null) {
    const entry = NOTIFICATION_DICTIONARY[tipo];
    if (!entry) return FALLBACK;

    const tmpl = entry[userRole] || entry.empresa || FALLBACK;
    const payload = { ...metadata, entityId };
    const ip = (s) => s ? s.replace(/\{\{(\w+)\}\}/g, (_, k) => payload[k] ?? `[${k}]`) : '';

    return { ...tmpl, title: ip(tmpl.title), body: ip(tmpl.body), link: ip(tmpl.link) };
}
