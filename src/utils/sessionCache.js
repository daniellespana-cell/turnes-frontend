/**
 * @typedef {Object} SessionCache
 * @property {any} data - La sesión del usuario (Supabase Session)
 * @property {boolean} fetched - Indica si ya se intentó recuperar de la API
 */

/** @type {SessionCache} */
let _cache = { data: null, fetched: false };

/** 
 * Retorna la sesión actual del caché.
 * @returns {SessionCache}
 */
export const getSessionCache = () => {
    if (!_cache) return { data: null, fetched: false }; // Safety
    return _cache;
};

/** 
 * Actualiza el caché con una sesión resuelta.
 * @param {any} session - Objeto de sesión de Supabase
 */
export const setSessionCache = (session) => {
    _cache = { data: session, fetched: true };
};

/** 
 * Invalida el caché. Debe llamarse al cerrar sesión.
 */
export const clearSessionCache = () => {
    _cache = { data: null, fetched: false };
};
