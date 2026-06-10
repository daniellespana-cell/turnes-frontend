import { useState, useEffect, useCallback, useMemo } from 'react';
import { VerificationService } from '../../services/verificationService';
import { ADMIN_PAGE_LIMIT } from '../../domain/admin.config';

/**
 * 🛡️ useVerificationQueue — Hook de lógica de cola de verificaciones
 * Extrae estado, fetching, filtrado multinivel y paginación.
 */
export const useVerificationQueue = () => {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [statusFilter, setStatusFilter] = useState('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // Paginación
    const [page, setPage] = useState(0);

    const loadQueue = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await VerificationService.getQueue(statusFilter, ADMIN_PAGE_LIMIT, page * ADMIN_PAGE_LIMIT);
            setQueue(data || []);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, page]);

    useEffect(() => { loadQueue(); }, [loadQueue]);

    // Filtrado local para búsqueda y fecha
    const filteredQueue = useMemo(() => {
        return queue.filter(req => {
            const name = (req.perfiles?.empresas?.nombre_comercial || req.perfiles?.nombre_display || '').toLowerCase();
            const email = (req.perfiles?.email || '').toLowerCase();
            const matchesSearch = name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());

            let matchesDate = true;
            if (dateFilter) {
                const reqDate = new Date(req.created_at).toISOString().split('T')[0];
                matchesDate = reqDate === dateFilter;
            }

            return matchesSearch && matchesDate;
        });
    }, [queue, searchQuery, dateFilter]);

    return {
        loading,
        statusFilter, setStatusFilter,
        searchQuery, setSearchQuery,
        dateFilter, setDateFilter,
        page, setPage,
        filteredQueue,
        limit: ADMIN_PAGE_LIMIT
    };
};
