import { UI_STRINGS } from '../domain/uiTranslations';

/**
 * 🛠️ UNIVERSAL FORMATTERS — Turnes (Senior Helpers)
 */

/**
 * Formatea una fecha para visualización en reseñas o actividades.
 * @param {string | Date} date - Fecha a formatear
 * @param {'short' | 'long'} style - Estilo del mes
 * @returns {string} Ej: "oct. 2025" o "Octubre 2025"
 */
export const formatDateMY = (date, style = 'short') => {
    if (!date) return UI_STRINGS.VACANCY.DATE_PENDING;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat('es-CO', {
        month: style,
        year: 'numeric'
    }).format(dateObj);
};

/**
 * Traduce el tipo de turno a una etiqueta amigable de UI.
 * @param {string} type - 'fijo' | 'ocasional' | 'suelto'
 * @returns {string}
 */
export const getTurnoTypeLabel = (type) => {
    const B = UI_STRINGS.BUSINESS;
    switch (type?.toLowerCase()) {
        case 'fijo':
            return B.TYPE_FIXED;
        case 'ocasional':
        case 'suelto':
        default:
            return B.TYPE_OCCASIONAL;
    }
};

/**
 * Formatea un monto de dinero a COP local (Pesos).
 * @param {number} amount - Valor numérico
 * @returns {string} Ej: "$ 50,000"
 */
export const formatCurrencyCOP = (amount) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(amount);
};
