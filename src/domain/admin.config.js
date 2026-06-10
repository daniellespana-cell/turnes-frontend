/**
 * ⚙️ ADMIN CONFIG — Constantes y configuración del módulo Admin
 * Centraliza la configuración visual y de negocio de las páginas de administración.
 */

/** Configuración de estados de verificación KYC */
export const STATUS_CONFIG = {
    pending:   { label: 'Pendiente',   color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',   icon: 'Clock' },
    in_review: { label: 'En Revisión', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',     icon: 'Shield' },
    approved:  { label: 'Aprobado',    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: 'CheckCircle' },
    rejected:  { label: 'Rechazado',   color: 'bg-red-500/10 text-red-400 border-red-500/20',        icon: 'XCircle' }
};

/** Acciones de navegación rápida del dashboard */
export const ADMIN_NAV_ACTIONS = [
    {
        label: 'Despacho de Verificaciones',
        desc: 'Aprobación KYC y documentos legales',
        iconName: 'Shield',
        path: '/admin/verificaciones',
        color: 'blue',
        badgeKey: 'pendingVerifications'
    },
    {
        label: 'Directorio de Perfiles',
        desc: 'Auditoría, Suspensión y Reset de passwords',
        iconName: 'Users',
        path: '/admin/usuarios',
        color: 'zinc'
    },
    {
        label: 'Ledger Financiero',
        desc: 'Transacciones y matriz de cobro directa',
        iconName: 'TrendingUp',
        path: '/admin/transacciones',
        color: 'emerald'
    }
];

/** Filtros de roles para Users */
export const ROLE_TABS = [
    { id: 'all',        label: 'Todos' },
    { id: 'empresa',    label: 'Cuentas Empresa' },
    { id: 'postulante', label: 'Talento' }
];

/** Filtros de flujo para Finances */
export const FLOW_TABS = [
    { id: 'all', label: 'Flujo Constante' },
    { id: 'in',  label: 'Cargos Positivos [IN]' },
    { id: 'out', label: 'Flujos [OUT]' }
];

/** Tabs principales de finanzas */
export const FINANCE_TABS = [
    { id: 'ledger',   label: 'Flujo Crudo (Ledger)',  iconName: 'ListFilter' },
    { id: 'wompi',    label: 'Pasarela Wompi',         iconName: 'CreditCard' },
    { id: 'balances', label: 'Ranking Liquidez',       iconName: 'Users' }
];

/** Filtros de categoría Wompi */
export const WOMPI_FILTER_TABS = [
    { id: 'all',          label: 'Todas' },
    { id: 'recarga',      label: '💰 Recargas' },
    { id: 'plan',         label: '📦 Planes' },
    { id: 'verificacion', label: '🛡️ Verificaciones' }
];

/** Categorías de concepto Wompi para clasificar transacciones */
export const WOMPI_CONCEPT_LABELS = {
    recarga:       { label: 'Recarga de Billetera',   color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    plan:          { label: 'Compra de Plan',         color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
    microservicio: { label: 'Microservicio',           color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
    verificacion:  { label: 'Verificación KYC',       color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20' },
    unknown:       { label: 'Operación Gateway',      color: 'text-zinc-400',    bg: 'bg-zinc-500/10 border-zinc-500/20' }
};

/**
 * Clasifica un concepto de transacción en una categoría Wompi.
 * @param {string} concepto
 * @returns {Object} { label, color, bg }
 */
export const classifyWompiConcept = (concepto) => {
    if (!concepto) return WOMPI_CONCEPT_LABELS.unknown;
    const c = concepto.toLowerCase();
    if (c.includes('recarga') || c.includes('wallet') || c.includes('saldo')) return WOMPI_CONCEPT_LABELS.recarga;
    if (c.includes('plan') || c.includes('suscripción') || c.includes('suscripcion')) return WOMPI_CONCEPT_LABELS.plan;
    // Orden importa: 'verificación' antes de 'servicio' para evitar falsos positivos
    if (c.includes('verificación') || c.includes('verificacion') || c.includes('kyc')) return WOMPI_CONCEPT_LABELS.verificacion;
    if (c.includes('microservicio') || c.includes('micro')) return WOMPI_CONCEPT_LABELS.microservicio;
    return WOMPI_CONCEPT_LABELS.unknown;
};

/** Límite de registros por página */
export const ADMIN_PAGE_LIMIT = 50;

/**
 * Extrae el nombre de usuario desde un objeto de perfil.
 * @param {Object} profile - Objeto de perfil de Supabase
 * @returns {string}
 */
export const resolveUserName = (profile) => {
    if (!profile) return 'Entidad Desconocida';
    return profile.empresas?.nombre_comercial || profile.nombre_display || 'Entidad Desconocida';
};
