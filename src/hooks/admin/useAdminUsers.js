import { useState, useEffect, useMemo, useCallback } from 'react';
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

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await AdminService.getUsers(roleFilter, ADMIN_PAGE_LIMIT, page * ADMIN_PAGE_LIMIT);
            if (error) showToast('Fallo al obtener red de usuarios.', 'error');
            else setUsers(data || []);
        } finally {
            setLoading(false);
        }
    }, [roleFilter, page, showToast]);

    useEffect(() => { 
        loadUsers(); 
    }, [loadUsers]);

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
     * @param {string} _name
     * @param {string} confirmText - Texto ingresado por el usuario para confirmar
     */
    const handleBan = async (userId, _name, confirmText) => {
        if (confirmText !== 'BAN') {
            showToast('Operación abortada. Se requiere verificación manual.', 'info');
            return false;
        }
        setActionLoading(userId);
        try {
            const { error } = await AdminService.suspendUser(userId);
            if (error) throw error;
            showToast(`Cuenta suspendida (Baneo Total y Audit Log generado).`, 'success');
            loadUsers(); // Refrescar lista
            return true;
        } catch (error) {
            console.error(error);
            showToast('No se pudo suspender a este usuario.', 'error');
            return false;
        } finally {
            setActionLoading(null);
        }
    };

    const handleResetPassword = async (email, _name) => {
        try {
            const { error } = await AdminService.resetUserPassword(email);
            if (error) throw error;
            showToast(`Enlace oficial de reseteo enviado a ${email}.`, 'success');
        } catch (error) {
            console.error(error);
            showToast('Fallo al enviar correo de reseteo.', 'error');
        }
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
