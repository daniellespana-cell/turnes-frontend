/**
 * seoHelpers.js
 *
 * Funciones puras para generar estructuras de datos SEO (JSON-LD, meta tags).
 * Sin side-effects. Sin imports de React. Sin acceso a DOM.
 * Fuente única de verdad para el schema de Google Jobs en Turnes.
 */

/** Valor base de compensación por hora para el schema de Google Jobs (COP) */
const BASE_HOURLY_RATE_COP = 60000;

/**
 * Construye el objeto JSON-LD de Google Jobs para una página de rol.
 * @see https://developers.google.com/search/docs/appearance/structured-data/job-posting
 *
 * @param {Object} roleNode    - Nodo del rol desde vacantes.taxonomy
 * @param {string} roleNode.id - ID único del rol (slug)
 * @param {Object} roleNode.marketing.job - Datos del trabajo de ejemplo
 * @returns {Object} JSON-LD válido para Google Jobs
 */
export const buildJobSchema = (roleNode) => {
    const rol = roleNode.marketing;

    // Calcular fechas de forma determinista sin polución en el componente
    const datePosted   = new Date().toISOString().split('T')[0];
    const validThrough = new Date(
        new Date().setMonth(new Date().getMonth() + 1)
    ).toISOString();

    return {
        '@context': 'https://schema.org',
        '@type':    'JobPosting',
        title:      rol.job.title,
        description: rol.description,
        identifier: {
            '@type': 'PropertyValue',
            name:    'Turnes',
            value:   roleNode.id
        },
        datePosted,
        validThrough,
        employmentType: 'CONTRACTOR',
        hiringOrganization: {
            '@type':  'Organization',
            name:     'Turnes',
            sameAs:   'https://turnes.app',
            logo:     'https://turnes.app/logo.png'
        },
        jobLocation: {
            '@type': 'Place',
            address: {
                '@type':           'PostalAddress',
                addressLocality:   'Girón',
                addressRegion:     'Santander',
                addressCountry:    'CO'
            }
        },
        baseSalary: {
            '@type':    'MonetaryAmount',
            currency:   'COP',
            value: {
                '@type':    'QuantitativeValue',
                value:      BASE_HOURLY_RATE_COP,
                unitText:   'HOUR'
            }
        }
    };
};
