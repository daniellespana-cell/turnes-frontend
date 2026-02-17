import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from './useNotifications';

export const useProfileLogic = () => {
    const { user, actualizarPerfil } = useAuth();
    const navigate = useNavigate();
    const { addNotification } = useNotifications(); // <-- Hook

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
        bio: '',
        avatar: ''
    });

    // Efecto: Cuando carga el usuario, llenamos el formulario
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                company: user.company || '',
                nit: user.nit || '',
                address: user.address || '',
                bio: user.bio || '',
                avatar: user.avatar || ''
            });
        }
    }, [user]);

    // 2. CÁLCULO DE ESTADÍSTICAS REALES (Conexión con Historial)
    const stats = useMemo(() => {
        try {
            // Leemos todos los turnos del sistema
            const historial = JSON.parse(localStorage.getItem('turnes_validados') || '[]');

            // Filtramos turnos cerrados
            const misTurnos = historial.filter(t => t.cicloCerrado === true);
            const totalTurnos = misTurnos.length;

            // Calculamos promedio de rating
            const calificaciones = misTurnos.filter(t => t.ratingRecibido).map(t => t.ratingRecibido);
            const promedio = calificaciones.length > 0
                ? (calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length).toFixed(1)
                : '5.0';

            return {
                turnos: totalTurnos,
                rating: promedio
            };
        } catch (e) {
            return { turnos: 0, rating: '5.0' };
        }
    }, []);

    // 3. MANEJADORES
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (actualizarPerfil) {
                await actualizarPerfil(formData);
                // NOTIFICACIÓN ÉXITOSA
                addNotification(
                    'success',
                    'Perfil Actualizado',
                    'Tu información ha sido guardada correctamente.',
                    '/dashboard/perfil'
                );
            }

            setIsEditing(false);
        } catch (error) {
            console.error("Error guardando perfil", error);
            addNotification('error', 'Error', 'No se pudo guardar el perfil.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                company: user.company || '',
                nit: user.nit || '',
                address: user.address || '',
                bio: user.bio || '',
                avatar: user.avatar || ''
            });
        }
        setIsEditing(false);
    };

    const navigateToRecharge = () => navigate('/dashboard/finanzas/recargar');

    // 4. NUEVAS FUNCIONES: SKILLS & PASSWORD
    const handleSkillToggle = (skill) => {
        setFormData(prev => {
            const currentSkills = prev.skills || [];
            if (currentSkills.includes(skill)) {
                return { ...prev, skills: currentSkills.filter(s => s !== skill) };
            }
            if (currentSkills.length >= 4) {
                return prev; // Máximo 4 skills
            }
            return { ...prev, skills: [...currentSkills, skill] };
        });
    };

    const handleChangePassword = async (oldPass, newPass) => {
        setLoading(true);
        try {
            // Simulación de endpoint
            await new Promise(resolve => setTimeout(resolve, 1500));
            addNotification('success', 'Contraseña Actualizada', 'Tu contraseña ha sido cambiada.');
            return true;
        } catch (error) {
            console.error("Error cambiando contraseña", error);
            addNotification('error', 'Error', 'No se pudo cambiar la contraseña.');
            return false;
        } finally {
            setLoading(false);
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
        handleSkillToggle,     // <-- Nueva función expuesta
        handleChangePassword,  // <-- Nueva función expuesta
        handleSave,
        handleCancel,
        navigateToRecharge
    };
};