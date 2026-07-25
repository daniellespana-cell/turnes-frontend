import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UI_STRINGS } from '../domain/uiTranslations';
import { getCategoriasList, SECTOR_MAP } from '../domain/vacantes.taxonomy';
import { authService } from '../services/authService';

/**
 * Construye el estado inicial del formulario a partir del objeto user.
 * Función pura: sin side-effects, extraída para eliminar la duplicación
 * entre la hydration inicial (useEffect) y el reset (handleCancel).
 */
const buildFormData = (user) => ({
    name:            user?.name || '',
    email:           user?.email || '',
    phone:           user?.telefono || user?.phone || '',
    bio:             user?.bio || '',
    sector:          user?.sector || '',
    skills:          user?.skills || [],
    location:        user?.direccion || user?.location || user?.address || '',
    lat:             user?.lat ?? null,
    lng:             user?.lng ?? null,
    availability:    user?.availability || 'full_time',
    experienceYears: user?.experienceYears || 0,
});

export const useWorkerProfileLogic = () => {
    const { user, actualizarPerfil, logout: authLogout } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(() => buildFormData(user));

    // Hydration: sincronizar cuando el user llega desde AuthContext
    useEffect(() => {
        if (user) setFormData(buildFormData(user));
    }, [user]);

    const stats = useMemo(() => ({
        turnos: user?.completed_shifts || 0,
        rating: user?.rating || 'Nuevo',
    }), [user]);

    // --- HANDLERS (todos con useCallback para estabilidad de referencia) ---

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSectorChange = useCallback((sectorKey) => {
        setFormData(prev => ({ ...prev, sector: sectorKey, skills: [] }));
    }, []);

    const handleSkillToggle = useCallback((skillLabel) => {
        setFormData(prev => {
            const current = prev.skills || [];
            if (current.includes(skillLabel)) {
                return { ...prev, skills: current.filter(s => s !== skillLabel) };
            }
            if (current.length >= 20) {
                showToast(UI_STRINGS.TOASTS.SKILLS_LIMIT, 'info');
                return prev;
            }
            return { ...prev, skills: [...current, skillLabel] };
        });
    }, [showToast]);

    const handleSave = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            await actualizarPerfil(formData);
            showToast(UI_STRINGS.TOASTS.PROFILE_UPDATED, 'success');
            setIsEditing(false);
        } catch (error) {
            console.error('Error al guardar perfil:', error);
            showToast(UI_STRINGS.TOASTS.SYNC_ERROR, 'error');
        } finally {
            setLoading(false);
        }
    }, [user?.id, formData, actualizarPerfil, showToast]);

    // Reset limpio: usa la misma función pura que la hydration inicial
    const handleCancel = useCallback(() => {
        setFormData(buildFormData(user));
        setIsEditing(false);
    }, [user]);

    const handleChangePassword = useCallback(async (_oldPass, newPass) => {
        setLoading(true);
        try {
            await authService.updatePassword(newPass);
            showToast(UI_STRINGS.TOASTS.PASSWORD_UPDATED, 'success');
            return true;
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            showToast(error.message || 'No se pudo actualizar la contraseña.', 'error');
            return false;
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const logout = useCallback(async () => {
        try {
            authLogout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, [authLogout, navigate]);

    return {
        user,
        formData,
        stats,
        isEditing,
        loading,
        setIsEditing,
        handleInputChange,
        handleSectorChange,
        handleSkillToggle,
        handleSave,
        handleCancel,
        handleChangePassword,
        logout,
        sectors: getCategoriasList().map(c => [c.id, SECTOR_MAP.get(c.id)]),
        currentSectorData: formData.sector ? SECTOR_MAP.get(formData.sector) : null,
    };
};
