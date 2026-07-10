/**
 * 🌍 UI TRANSLATIONS — Diccionario Central de Cadenas de Texto (Frontend)
 * Este archivo centraliza los textos que aparecen en la interfaz para evitar el hardcode.
 * Sigue un esquema de "Seniority": nombres claros y estructura escalable.
 */

export const UI_STRINGS = {
    PRICING: {
        FREE: 'Gratis',
        FOREVER: 'Para siempre',
        MONTHLY: 'Mensual',
        SINGLE_PAYMENT: 'Pago Único',
        RECURRING_SUB: 'Suscripción autorrenovable.',
        NON_RECURRING: 'Pago único. Sin cargos recurrentes.',
        IMMEDIATE_ACTIVATION: 'Activación Inmediata',
        PRIORITY_SUPPORT: 'Soporte Prioritario',
    },
    VACANCY: {
        UNTITLED: 'Sin título',
        TO_BE_NEGOTIATED: 'A Convenir',
        PENDING: 'Pendiente',
        CONFIDENTIAL_COMPANY: 'Empresa Confidencial',
        PROTECTED_LOCATION: 'Ubicación Protegida (Privacidad)',
        TODAY: 'HOY',
        BY_CONFIRMING: 'Por confirmar',
        DATE_PENDING: 'Fecha por confirmar',
    },
    PROFILE: {
        DEFAULT_NAME: 'Talento Turnes',
        DEFAULT_ROLE: 'Talento',
        NO_BIO: 'Sin biografía disponible',
        DEFAULT_COMPANY: 'Empresa',
        DEFAULT_CANDIDATE: 'Candidato',
    },
    BUSINESS: {
        INVITE_MODAL_TITLE: 'Invitar a un Turno',
        INVITE_DESCRIPTION: 'Selecciona una vacante activa para enviar un mensaje directo a',
        NO_ACTIVE_VACANCIES: 'No tienes vacantes activas',
        NO_ACTIVE_VACANCIES_DESC: 'Para invitar a candidatos directamente, debes tener al menos un turno publicado y activo.',
        INVITE_SUCCESS: '¡Invitación iniciada! Dile hola en el chat 👋',
        INVITE_ALREADY_EXISTS: 'ya está postulado o invitado a esta vacante.',
        CREATE_NEW_VACANCY: 'Crear Nueva Vacante',
        TYPE_FIXED: 'Contrato Fijo',
        TYPE_OCCASIONAL: 'Turno Suelto',
    },
    REVIEWS: {
        ANONYMOUS_USER: 'Usuario Anónimo',
        NO_COMMENT: 'Calificación otorgada sin comentario público.',
        SYSTEM_ROLE: 'Turnes',
    },
    TOASTS: {
        PROFILE_UPDATED: 'Perfil actualizado correctamente.',
        PROFILE_ERROR: 'No se pudo guardar el perfil.',
        PASSWORD_UPDATED: 'Contraseña actualizada correctamente.',
        PASSWORD_ERROR: 'No se pudo actualizar la contraseña.',
        LOGOUT_SUCCESS: 'Sesión Finalizada: Has salido de forma segura.',
        VACANCY_PUBLISHED: '✅ Vacante publicada con éxito',
        VACANCY_CLOSED: 'Vacante Completada: La vacante se ha cerrado exitosamente.',
        VACANCY_CLOSE_ERROR: 'No se pudo cerrar la vacante.',
        VACANCY_DELETE_ERROR: 'No se pudo eliminar la vacante.',
        VACANCY_DUPLICATED: 'Copia creada con éxito',
        VACANCY_DELETED: 'Vacante eliminada permanentemente',
        SKILLS_LIMIT: 'Has alcanzado el límite de 20 habilidades.',
        SYNC_ERROR: 'No se pudieron sincronizar los cambios. Intenta nuevamente.',
        NETWORK_ERROR: 'No se pudo procesar la acción. Revisa tu conexión de red.',
        SUBSCRIPTION_ERROR: 'No se pudo actualizar el estado de suscripción.',
        CONNECTION_ERROR: 'Error de conexión. Revisa tu internet o intenta de nuevo.',
    },
    VALIDATION: {
        PROCESSING: 'Ya estamos procesando tu vacante... 🚀',
        CALCULATING_PRICE: 'Calculando precio, espera un momento...',
        TAGS_REQUIRED: 'Agrega al menos 1 cargo o etiqueta al turno',
        CITY_REQUIRED: 'Selecciona una ciudad o municipio',
        MIN_SALARY: 'La oferta mínima permitida es de $50,000 COP',
        DATE_REQUIRED: 'Elige la fecha del turno',
        DATE_PAST: 'La fecha del turno no puede estar en el pasado',
        DESCRIPTION_MIN: 'Escribe una descripción de al menos 10 caracteres',
        DESCRIPTION_PII: 'Retira teléfonos o direcciones de la descripción',
        PRIVACY_REQUIRED: 'Debes aceptar la política de privacidad para continuar.',
        GEO_NOT_SUPPORTED: 'Tu navegador no soporta geolocalización.',
    },
    CHAT: {
        PAYMENT_SUCCESS: '¡Pago procesado con éxito! Canal de contacto desbloqueado.',
        PAYMENT_ERROR: 'Hubo un problema procesando el pago. Intenta nuevamente.',
        INSUFFICIENT_FUNDS: 'Fondos insuficientes. Recarga tu billetera e intenta nuevamente.',
        NO_BALANCE: 'No tienes saldo suficiente.',
        PAYMENT_RETRY: 'Error procesando el pago. Intenta nuevamente.',
        AGREEMENT_ERROR: 'Error de Conexión: No se pudo formalizar el acuerdo en el servidor.',
        SEALED_SUCCESS: '¡Chat Sellado! Se ha generado el precinto de la Red de Confianza.',
    },
    FINANCE: {
        RECHARGE_MIN: 'Monto Inválido: Mínimo $10.000 COP.',
        RECHARGE_MAX: 'Límite Excedido: Máximo $5.000.000 COP.',
    },
    COMMON: {
        ERROR_FETCH_VACANCIES: 'No pudimos cargar tus vacantes.',
        ERROR_INVITE_CANDIDATE: 'Hubo un error al iniciar la invitación.',
        ERROR_FETCH_CANDIDATES: 'Error de Conexión: No pudimos cargar tus candidatos.',
        LOADING: 'Cargando...',
    },
    NOTIFICATIONS: {
        FALLBACK_TITLE: 'Notificación del Sistema',
        FALLBACK_BODY: 'Hay una novedad en tu cuenta.',
    }
};

/**
 * Helper para obtener una cadena con fallback
 * @param {string} path - Ruta en el objeto UI_STRINGS (ej. 'PRICING.FREE')
 * @returns {string}
 */
const getUIString = (path) => {
    return path.split('.').reduce((obj, key) => obj?.[key], UI_STRINGS) || `[${path}]`;
};
