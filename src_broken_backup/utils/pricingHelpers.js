import { formatCurrency } from '../services/financeService';
import { UI_STRINGS } from '../domain/uiTranslations';

/**
 * Normaliza las propiedades de un plan o microservicio obtenido de la API
 * para que la interfaz (UI) pueda consumirlo de forma estandarizada.
 * 
 * @typedef {Object} RawPricingData
 * @property {string} id - UUID del plan/servicio
 * @property {string} slug - Identificador único (pro, micro, verify, etc.)
 * @property {string} [nombre] - Nombre del plan
 * @property {string} [title] - Título del servicio
 * @property {number} [costo_mensual] - Costo en COP (centavos o base)
 * @property {number} [price] - Precio explícito
 * @property {string[]} [features] - Lista de beneficios
 * @property {string} [description] - Descripción corta
 * 
 * @param {RawPricingData} data - Datos crudos de la BD/API
 * @param {"plan" | "service"} type - Categoría del ítem
 * @returns {Object} Ítem normalizado para la UI de Checkout
 */
export const normalizeCheckoutItem = (data, type) => {
    const P = UI_STRINGS.PRICING;

    // 💡 INTERCEPTOR: Algunos microservicios viven en la tabla 'planes' por legado.
    // Los detectamos por su slug para forzarlos como 'service' de pago único.
    const isActuallyService = data.slug === 'verify' || data.slug === 'boost';

    if (type === 'plan' && !isActuallyService) {
        const isFree = data.costo_mensual === 0;
        return {
            id: data.id,
            slug: data.slug,
            title: data.nombre,
            price: isFree ? P.FREE : formatCurrency(data.costo_mensual).replace(',00', ''),
            rawPrice: Number(data.costo_mensual || 0),
            period: isFree ? P.FOREVER : P.MONTHLY,
            accent: data.slug === 'pro' ? 'pink' : data.slug === 'micro' ? 'indigo' : 'emerald',
            features: data.features || [],
            terms: P.RECURRING_SUB,
            type: 'plan'
        };
    }

    // Falla hacia 'service' explícito para microservicios reales o camuflados
    const title = data.title || data.nombre;
    const priceRaw = data.price !== undefined ? data.price : data.costo_mensual;

    return {
        id: isActuallyService ? data.slug : data.id,
        slug: data.slug,
        title: title,
        price: formatCurrency(priceRaw).replace(',00', ''),
        rawPrice: Number(priceRaw || 0),
        period: P.SINGLE_PAYMENT,
        accent: data.slug === 'verify' ? 'blue' : (data.slug === 'boost' ? 'orange' : 'teal'),
        features: data.features || [data.description, P.IMMEDIATE_ACTIVATION, P.PRIORITY_SUPPORT],
        terms: P.NON_RECURRING,
        type: 'service'
    };
};
