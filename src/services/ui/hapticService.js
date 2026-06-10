/**
 * HapticFeedbackService
 * Provee feedback físico (vibración) para acciones críticas.
 * Solo funciona en dispositivos móviles compatibles.
 */
class HapticFeedbackService {
    /**
     * Vibración corta y sutil para clics exitosos o navegación.
     */
    light() {
        if ('vibrate' in navigator) {
            navigator.vibrate(15);
        }
    }

    /**
     * Vibración media para confirmaciones de pago o matches.
     */
    success() {
        if ('vibrate' in navigator) {
            navigator.vibrate([30, 50, 30]);
        }
    }

    /**
     * Vibración de error o alerta.
     */
    error() {
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
    }
}

export const haptic = new HapticFeedbackService();
