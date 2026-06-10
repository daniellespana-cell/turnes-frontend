/**
 * 🗺️ ROUTE PATHS CONFIGURATION
 * Centralized source of truth for all application routes.
 * Avoids hardcoded strings and makes refactoring URL structures safe.
 */

export const PATHS = {
    // 🌍 PUBLIC & LEGAL
    PUBLIC: {
        HOME: '/',
        LOGIN: '/login',
        REGISTER: '/register',
        FORGOT_PASSWORD: '/forgot-password',
        UPDATE_PASSWORD: '/update-password',
        SEARCH: '/search',
        EXPLORE: '/explorar',
        PRICING: '/precios',
        ABOUT: '/about',
        CONTACT: '/contacto',
        LEGAL: {
            PAYMENTS: '/politica-pagos',
            PRIVACY: '/privacidad',
            TERMS: '/terminos',
            USERS: '/politicas',
            COOKIES: '/politica-cookies',
        }
    },

    // 💼 BUSINESS (EMPRESA) ROUTES
    BUSINESS: {
        DASHBOARD: '/dashboard',
        FAVORITES: '/dashboard/favoritos',
        CANDIDATES: '/candidatos', // Corrected path based on App.jsx analysis
        ACTIVE_VACANCY: '/dashboard/vacantes/activa', // Shortcut
        PUBLISH: '/publicar',
        VACANCIES: '/dashboard/vacantes', // Verify this vs App.jsx
        FINANCES: '/wallet',
        RECHARGE: '/dashboard/finanzas/recargar',
        TRANSACTION_SUCCESS: '/dashboard/finanzas/success',
        UPGRADE: '/dashboard/upgrade',
        CHATS: '/dashboard/chats',
        TALENT_SEARCH: '/dashboard/buscar-talento',
        PROFILE: '/dashboard/perfil', // Centralized dashboard profile path
        RATINGS: '/dashboard/calificaciones',
        SETTINGS: '/configuracion'
    },

    // 👷 WORKER (CANDIDATO) ROUTES
    WORKER: {
        DASHBOARD: '/dashboard',
        PROFILE: '/perfil',
        EXPLORE: '/dashboard/explorar', // Review this vs App.jsx, App.jsx uses /perfil 
        APPLICATIONS: '/dashboard/postulaciones',
        CHATS: '/dashboard/chats',
        RATINGS: '/dashboard/calificaciones',
        FINANCES: '/dashboard/finanzas',
        SETTINGS: '/configuracion'
    },

    // 🔄 SHARED / DYNAMIC
    SHARED: {
        CHAT: (id = ':id') => `/dashboard/chat/${id}`,
        NOTIFICATIONS: '/dashboard/notifications',
        PUBLIC_PROFILE: (id = ':id') => `/perfil/${id}`, // Universal Profile viewer
        VACANCY_DETAIL: (id = ':id') => `/dashboard/vacantes/${id}`,
        ROLE_DETAIL: (slug = ':rolSlug') => `/explorar/${slug}`,
        PLAN_ACTION: (slug = ':planSlug') => `/plan-action/${slug}`,
        ONBOARDING: '/onboarding'
    }
};
