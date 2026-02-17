/**
 * 💳 PAYMENT SERVICE (Wompi Integration)
 * Maneja la inicialización del Widget de Wompi.
 */

class PaymentService {
    constructor() {
        this.wompiScriptId = 'wompi-script';
        // TODO: Move to .env
        this.publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY || 'pub_test_Q5yOA9bX8CA111a11111111111111111';
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
    async openWidget({ amountInCents, reference, email, integritySignature, redirectUrl }) {
        await this.loadWompi();

        const checkout = new window.WidgetCheckout({
            currency: 'COP',
            amountInCents: amountInCents,
            reference: reference,
            publicKey: this.publicKey,
            redirectUrl: redirectUrl || window.location.href, // Redirige a la misma página por defecto
            customerData: {
                email: email,
                fullName: 'Cliente Turnes', // Deberíamos pasar el nombre real si lo tenemos
                phoneNumber: '3000000000', // Opcional
                phoneNumberPrefix: '+57'
            },
            integritySignature: integritySignature // CRITICO: Debe venir del backend
        });

        checkout.open(function (result) {
            const transaction = result.transaction;
            console.log('Transaction result:', transaction);
            // Aquí Wompi redirige, así que este callback a veces no se alcanza a ver
        });
    }
}

const paymentService = new PaymentService();
export default paymentService;
