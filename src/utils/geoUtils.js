/**
 * 🌍 GEO UTILS (Senior Edition)
 * Lógica pura para normalización y búsqueda geográfica.
 */

/**
 * Normaliza un string para comparaciones seguras (sin acentos, minúsculas).
 */
export const normalizeStr = (str) =>
    str?.toLowerCase()
       .normalize("NFD")
       .replace(/[\u0300-\u036f]/g, "") || "";

/**
 * Motor de búsqueda predictiva para ciudades.
 */
export const filterCities = (source, query) => {
    if (!query || !source) return [];
    
    const searchVal = normalizeStr(query);
    
    const exactMatches = source.filter(item => normalizeStr(item) === searchVal);
    const startsWithMatches = source.filter(item => 
        normalizeStr(item).startsWith(searchVal) && normalizeStr(item) !== searchVal
    );
    const includesMatches = source.filter(item => 
        normalizeStr(item).includes(searchVal) && !normalizeStr(item).startsWith(searchVal)
    );

    return [...exactMatches, ...startsWithMatches, ...includesMatches].slice(0, 5);
};
