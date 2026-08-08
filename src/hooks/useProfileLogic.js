import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UI_STRINGS } from '../domain/uiTranslations';
import { ReputationService } from '../services/reputationService';
import { ContractService } from '../services/contractService';
import { authService } from '../services/authService';
import { CIUDADES_COORDS } from '../domain/geography.config';

/**
 * 💼 BUSINESS PROFILE LOGIC (SENIOR)
 * Maneja la edición de perfiles de empresa con seguridad total.
 */
export const useProfileLogic = () => {
    const { user, actualizarPerfil, logout: authLogout } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // 1. ESTADO DEL FORMULARIO (Sincronizado con User)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        nit: '',
        address: '',
        location: '',  // alias de address — usado por el LocationSelector del form
        lat: null,
        lng: null,
        bio: '',
        avatar: '',
        sector: '',
        skills: []
    });

    useEffect(() => {
        if (user) {
            const addr = user.direccion || user.location || '';
            setFormData({
                name:    user.nombre_display || user.name || '',
                email:   user.email || '',
                phone:   user.telefono || '',
                company: user.nombre_empresa || user.empresas?.nombre_comercial || '',
                nit:     user.nit_rut || user.nit || '',
                address: addr,
                location: addr,   // sincronizado con address
                lat:     user.lat  ?? user.empresas?.lat  ?? null,
                lng:     user.lng  ?? user.empresas?.lng  ?? null,
                bio:     user.bio || '',
                avatar:  user.avatar_url || '',
                sector:  user.sector || user.empresas?.sector_industrial || '',
                skills:  user.skills || []
            });
        }
    }, [user]);

    // 2. CÁLCULO DE ESTADÍSTICAS REALES
    const [stats, setStats] = useState({ turnos: 0, rating: '5.0' });

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.id) return;
            try {
                const [ratingReal, contractStats] = await Promise.all([
                    ReputationService.getRating(user.id),
                    ContractService.getStats(user.id)
                ]);

                setStats({
                    turnos: contractStats.completed || 0,
                    rating: parseFloat(ratingReal) > 0 ? ratingReal : 'Nuevo'
                });
            } catch (error) {
                console.error("Error loading stats:", error);
                setStats({ turnos: 0, rating: 'Nuevo' });
            }
        };
        fetchStats();
    }, [user]);

    // 3. MANEJADORES DE ACCIÓN
    const handleInputChange = (field, value) => {
        setFormData(prev => {
            // Mantener address y location siempre en sync y resolver coordenadas
            if (field === 'address' || field === 'location') {
                const cityMatch = Object.entries(CIUDADES_COORDS).find(
                    ([name, data]) => name === value || `${name}, ${data.departamento}` === value
                );
                return { 
                    ...prev, 
                    address: value, 
                    location: value,
                    lat: cityMatch ? cityMatch[1].lat : prev.lat,
                    lng: cityMatch ? cityMatch[1].lng : prev.lng 
                };
            }
            return { ...prev, [field]: value };
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (actualizarPerfil) {
                await actualizarPerfil(formData);
                showToast(UI_STRINGS.TOASTS.PROFILE_UPDATED, 'success');
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error guardando perfil", error);
            showToast(UI_STRINGS.TOASTS.PROFILE_ERROR, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            const addr = user.direccion || user.location || '';
            setFormData({
                name:    user.nombre_display || user.name || '',
                email:   user.email || '',
                phone:   user.telefono || '',
                company: user.nombre_empresa || user.empresas?.nombre_comercial || '',
                nit:     user.nit_rut || user.nit || '',
                address: addr,
                location: addr,
                lat:     user.lat  ?? user.empresas?.lat  ?? null,
                lng:     user.lng  ?? user.empresas?.lng  ?? null,
                bio:     user.bio || '',
                avatar:  user.avatar_url || '',
                sector:  user.sector || user.empresas?.sector_industrial || '',
                skills:  user.skills || []
            });
        }
        setIsEditing(false);
    };

    const handleSkillToggle = (skill) => {
        setFormData(prev => {
            const currentSkills = prev.skills || [];
            if (currentSkills.includes(skill)) {
                return { ...prev, skills: currentSkills.filter(s => s !== skill) };
            }
            if (currentSkills.length >= 5) return prev; // Límite de 5 skills
            return { ...prev, skills: [...currentSkills, skill] };
        });
    };

    const handleChangePassword = async (oldPass, newPass) => {
        setLoading(true);
        try {
            await authService.updatePassword(newPass);
            showToast(UI_STRINGS.TOASTS.PASSWORD_UPDATED, 'success');
            return true;
        } catch (error) {
            console.error("Error changing password", error);
            showToast(UI_STRINGS.TOASTS.PASSWORD_ERROR, 'error');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authLogout();
            showToast(UI_STRINGS.TOASTS.LOGOUT_SUCCESS, 'info');
            navigate('/login');
        } catch (err) {
            console.error("Logout Err", err);
        }
    };

    return {
        user,
        formData,
        stats,
        isEditing,
        loading,
        setIsEditing,
        handleInputChange,
        handleSkillToggle,
        handleChangePassword,
        handleSave,
        handleCancel,
        logout,
        navigateToRecharge: () => navigate('/dashboard/finanzas/recargar')
    };
};