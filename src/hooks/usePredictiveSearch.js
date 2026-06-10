import { useMemo } from 'react';
import { getAllSearchTags } from '../domain/vacantes.taxonomy';

export const usePredictiveSearch = (query) => {
    return useMemo(() => {
        if (!query || query.trim().length < 2) return [];
        const q = query.toLowerCase().trim();
        const all = getAllSearchTags();
        const startsWith = all.filter(t => t.toLowerCase().startsWith(q));
        const contains   = all.filter(t => !t.toLowerCase().startsWith(q) && t.toLowerCase().includes(q));
        return [...startsWith, ...contains].slice(0, 6);
    }, [query]);
};
