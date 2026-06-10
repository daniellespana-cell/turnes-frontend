/**
 * 🛡️ LOGGER — Sistema de Logging con Niveles (Turnes)
 *
 * Centraliza todos los logs del sistema. En producción, los niveles
 * `dev` y `info` son silenciados automáticamente para evitar filtrar
 * información sensible (tokens, payloads, emails) en la consola.
 *
 * Uso:
 *   import { logger } from '../utils/logger';
 *   logger.dev('Datos de debug', payload);   // Solo en desarrollo
 *   logger.info('Operación completada');      // Solo en desarrollo
 *   logger.warn('Situación inesperada');      // Siempre visible
 *   logger.error('Fallo crítico', err);       // Siempre visible
 */

const IS_DEV = import.meta.env?.DEV ?? false;

const noop = () => {};

export const logger = {
    /** Solo en desarrollo — para datos de debug, payloads, traces */
    dev: IS_DEV ? console.log.bind(console) : noop,

    /** Solo en desarrollo — para flujos informativos */
    info: IS_DEV ? console.info.bind(console) : noop,

    /** Siempre visible — advertencias operativas */
    warn: console.warn.bind(console),

    /** Siempre visible — errores críticos */
    error: console.error.bind(console),
};
