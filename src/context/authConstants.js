// src/context/authConstants.js

/** 
 * 🛡️ Global Singleton: Deduplicates concurrent boot calls across re-mounts.
 * Outside the component to survive React.StrictMode and HMR re-renders.
 */
const _authGlobal = {
    activeProfilePromise: null,
};

/**
 * Plan config (business logic)
 */
export const PLANS_CONFIG = {
  'Básico': { name: 'Básico', price: 0, commission: 0.06, fixedJobCost: 19900, includedFixed: 0, features: ['Publicaciones turnos ilimitadas', 'Comisión 6% por turno', 'Chat interno', 'Soporte estándar'] },
  'Micro':  { name: 'Micro',  price: 29900, commission: 0.04, fixedJobCost: 0, includedFixed: 7,  features: ['Comisión reducida (4%)', '7 Vacantes fijas gratis', '3 Publicaciones destacadas', 'Soporte prioritario'] },
  'Pro':    { name: 'Pro',    price: 79900, commission: 0, fixedJobCost: 0, includedFixed: 30, features: ['Sin comisiones (0%)', '30 Vacantes fijas gratis', 'Acceso Top Worker', 'Soporte Premium'] },
};

/**
 * Mapeo de Identidad: Front-End (UI) a Back-End (Supabase Enum)
 */
export const ROLE_MAP_DB = {
    jobseeker: 'postulante',
    company: 'empresa'
};
