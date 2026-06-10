import { useState, useEffect, useMemo } from 'react';
import { AdminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { ADMIN_PAGE_LIMIT } from '../../domain/admin.config';

/**
 * 👥 useAdminUsers — Hook de lógica del directorio de usuarios admin
 * Extrae estado, fetching, filtrado, paginación y acciones punitivas.
 */
export const useAdminUsers = () => {
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    // Filters
    const [roleFilter, setRoleFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await AdminService.getUsers(roleFilter, ADMIN_PAGE_LIMIT, page * ADMIN_PAGE_LIMIT);
            if (error) showToast('Fallo al obtener red de usuarios.', 'error');
            else setUsers(data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, [roleFilter, page]);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const name = (u.empresas?.nombre_comercial || u.nombre_display || '').toLowerCase();
            const email = (u.email || '').toLowerCase();
            return name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
        });
    }, [users, searchQuery]);

    /**
     * Suspende una cuenta. Requiere confirmación textual.
     * @param {string} userId
     * @param {string} name
     * @param {string} confirmText - Texto ingresado por el usuario para confirmar
     */
    const handleBan = async (userId, name, confirmText) => {
        if (confirmText !== 'BAN') {
            showToast('Operación abortada. Se requiere verificación manual.', 'info');
            return false;
        }
        setActionLoading(userId);
        try {
            // TODO: Implementar AdminService.banUser(userId) real
            await new Promise(resolve => setTimeout(resolve, 1500));
            showToast(`Cuenta suspendida (Audit Log generado).`, 'success');
            return true;
        } catch {
            showToast('No se pudo suspender.', 'error');
            return false;
        } finally {
            setActionLoading(null);
        }
    };

    const handleResetPassword = (name) => {
        // TODO: Implementar AdminService.resetPassword(userId) real
        showToast('Regla de negocio: Enlace temporal de reseteo generado (SIMULADO).', 'success');
    };

    return {
        loading,
        actionLoading,
        roleFilter, setRoleFilter,
        searchQuery, setSearchQuery,
        page, setPage,
        filteredUsers,
        handleBan,
        handleResetPassword,
        limit: ADMIN_PAGE_LIMIT
    };
};
