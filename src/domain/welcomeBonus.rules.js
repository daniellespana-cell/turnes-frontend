/**
 * 🎁 WELCOME BONUS RULES (SSOT)
 * Reglas de negocio y validación para el beneficio de Primer Turno Temporal Gratis.
 */

export const REQUIRED_COMPANY_PROFILE_FIELDS = [
    { key: 'nombre_comercial', label: 'Nombre Comercial' },
    { key: 'nit_rut', label: 'NIT / RUT' },
    { key: 'logo_url', label: 'Logo o Foto de Empresa' },
    { key: 'sector_industrial', label: 'Sector Industrial' }
];

/**
 * Valida si el perfil de la empresa cumple con el 100% de los requisitos para el bono
 * @param {object} companyData - Datos de la empresa
 * @returns {boolean}
 */
export const isCompanyProfileComplete = (companyData) => {
    if (!companyData || typeof companyData !== 'object') return false;

    const hasNombre = Boolean(companyData.nombre_comercial?.trim());
    const hasNit = Boolean(companyData.nit_rut?.trim());
    const hasLogo = Boolean(companyData.logo_url?.trim() || companyData.avatar_url?.trim());
    const hasSector = Boolean(companyData.sector_industrial?.trim() || companyData.sector?.trim());

    return hasNombre && hasNit && hasLogo && hasSector;
};

/**
 * Retorna la lista de campos faltantes para completar el perfil al 100%
 * @param {object} companyData 
 * @returns {string[]}
 */
export const getMissingCompanyProfileFields = (companyData) => {
    if (!companyData) return REQUIRED_COMPANY_PROFILE_FIELDS.map(f => f.label);

    const missing = [];
    if (!companyData.nombre_comercial?.trim()) missing.push('Nombre Comercial');
    if (!companyData.nit_rut?.trim()) missing.push('NIT / RUT');
    if (!companyData.logo_url?.trim() && !companyData.avatar_url?.trim()) missing.push('Logo');
    if (!companyData.sector_industrial?.trim() && !companyData.sector?.trim()) missing.push('Sector Industrial');

    return missing;
};

/**
 * Términos y Condiciones Legales Claros e Inequívocos
 */
export const WELCOME_BONUS_CONDITIONS = {
    TITLE: 'Términos y Condiciones del Primer Turno Gratis',
    LEGAL_TEXT: 'El beneficio de "Primer Turno Gratis" aplica de manera única y exclusiva para la exoneración del 100% de la comisión en la primera contratación de un Turno Ocasional / Temporal. Este beneficio NO aplica para contrataciones de Turnos Fijos. Para redimir el bono, la empresa debe tener su perfil verificado al 100% (Nombre Comercial, NIT/RUT, Logo y Sector). El beneficio es personal, intransferible, no acumulable con otras promociones y en ningún caso es canjeable por dinero en efectivo.',
    ELIGIBILITY_ALERT: 'Solo aplica para Turnos Temporales/Ocasionales. Turnos Fijos no aplican.',
    FIXED_EXCLUSION_REASON: 'El beneficio de bienvenida es exclusivo para Turnos Temporales y no aplica en Turnos Fijos.'
};
