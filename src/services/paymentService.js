/**
 * 💳 PAYMENT SERVICE (Wompi Integration)
 * Maneja la inicialización del Widget de Wompi.
 */
import { logger } from '../utils/logger';

class PaymentService {
    constructor() {
        this.wompiScriptId = 'wompi-script';
        this.publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY;

        if (!this.publicKey) {
            logger.error('[PaymentService] CRITICAL: VITE_WOMPI_PUBLIC_KEY no está configurada en .env');
        }
    }

    /**
     * Carga dinámica del script de Wompi
     */
    async loadWompi() {
        return new Promise((resolve, reject) => {
            if (document.getElementById(this.wompiScriptId)) {
                return resolve(window.WidgetCheckout);
            }

            const script = document.createElement('script');
            script.id = this.wompiScriptId;
            script.src = 'https://checkout.wompi.co/widget.js';
            if (this.publicKey) {
                script.setAttribute('data-public-key', this.publicKey);
            }
            script.async = true;
            script.onload = () => resolve(window.WidgetCheckout);
            script.onerror = () => reject(new Error('Falló la carga de Wompi'));
            document.body.appendChild(script);
        });
    }

    /**
     * Abre el Widget de Pago
     * @param {object} params
     * @param {number} params.amountInCents - Monto en centavos (COP)
     * @param {string} params.reference - Referencia única de pago
     * @param {string} params.email - Email del pagador
     * @param {string} params.integritySignature - Firma de integridad (SHA256)
     */
    async openWidget({ amountInCents, reference, email, integritySignature, redirectUrl, itemType, itemId }) {
        await this.loadWompi();

        // Runtime check for keys
        const rawKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY;
        logger.dev('🔑 [PaymentService] Verificando llave pública de Wompi');

        const publicKey = String(rawKey || '').trim();

        if (!publicKey || publicKey === 'undefined' || publicKey === 'null') {
            logger.error('[PaymentService] CRITICAL: VITE_WOMPI_PUBLIC_KEY no encontrada o es inválida (undefined). Revisa las variables de entorno de tu hosting.');
            return;
        }

        const checkoutConfig = {
            currency: 'COP',
            amountInCents: amountInCents,
            reference: reference,
            publicKey: publicKey,
            customerData: {
                email: email || 'cliente@turnes.co' // Evitar undefined que rompe el widget
            },
            signature: { integrity: integritySignature }
        };

        // Solo agregar redirectUrl si existe (evitar pasar undefined)
        if (redirectUrl) {
            checkoutConfig.redirectUrl = redirectUrl;
        }

        logger.dev('💳 [PaymentService] Config cargada (llave oculta)');

        const checkout = new window.WidgetCheckout(checkoutConfig);

        checkout.open(function (result) {
            const transaction = result.transaction;
            logger.dev('🏁 Transacción Wompi finalizada:', transaction.status);

            // MANEJO MANUAL DE REDIRECCIÓN (Para Localhost)
            if (transaction.status === 'APPROVED') {
                // Redirigir manualmente a la página de éxito incluyendo context de item
                let successUrl = `/dashboard/finanzas/success?id=${transaction.id}&env=test`;
                if (itemType && itemId) {
                    successUrl += `&itemType=${itemType}&itemId=${itemId}`;
                }
                window.location.href = successUrl;
            } else if (transaction.status === 'DECLINED' || transaction.status === 'ERROR') {
                logger.warn(`[PaymentService] Transacción rechazada: ${transaction.status_message || 'Sin detalle'}`);
            }
        });
    }
}

const paymentService = new PaymentService();
export default paymentService;
