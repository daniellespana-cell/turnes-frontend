import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotificationsContext } from '../context/NotificationsContext';
import { VACANTES_TAXONOMY } from '../domain/vacantes.taxonomy';

export const useWorkerProfileLogic = () => {
    const { user, login } = useAuth(); // login usado para actualizar el contexto global
    const { addNotification } = useNotificationsContext();

    // Estado de Edición
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Estado del Formulario
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        sector: '', // Sector Principal
        skills: [], // Lista combinada de Roles y Skills
        availability: 'full_time',
        location: '',
        experienceYears: 0
    });

    // 1. CARGA INICIAL (Hydration)
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
                sector: user.sector || '',
                skills: user.skills || [],
                location: user.location || user.address || ''
            }));
        }
    }, [user]);

    // 2. ESTADÍSTICAS (Calculadas en tiempo real)
    const stats = useMemo(() => {
        // En un escenario real, esto vendría de una DB.
        // Aquí leemos el historial local para contar turnos.
        let completedShifts = 0;
        try {
            const history = JSON.parse(localStorage.getItem('turnes_validados') || '[]');
            // Contamos donde el candidato sea el usuario actual (id simulado match)
            // Como turnes_validados almacena candidatos, asumimos que "yo" soy el candidato.
            completedShifts = history.filter(h => h.estadoTurno === 'EJECUTADO' || h.estadoTurno === 'FINALIZADO').length;
        } catch (e) { }

        return {
            turnos: completedShifts,
            rating: "4.9", // Mock estático por ahora
            onTime: "100%"
        };
    }, []);

    // 3. HANDLERS
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSectorChange = (sectorKey) => {
        // Al cambiar sector, limpiamos skills para evitar inconsistencias
        // O podríamos conservarlas si son transversales, pero por senioridad, es mejor limpiar.
        setFormData(prev => ({
            ...prev,
            sector: sectorKey,
            skills: []
        }));
    };

    const handleSkillToggle = (skillLabel) => {
        setFormData(prev => {
            const current = prev.skills || [];
            if (current.includes(skillLabel)) {
                return { ...prev, skills: current.filter(s => s !== skillLabel) };
            } else {
                // Límite de Skills (Opcional, UX Senior)
                if (current.length >= 15) {
                    addNotification('info', 'Límite de Habilidades', 'Selecciona las más relevantes.');
                    return prev;
                }
                return { ...prev, skills: [...current, skillLabel] };
            }
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Simulación Network
            await new Promise(r => setTimeout(r, 800));

            // 1. Persistencia Local (Simulando Backend)
            // Actualizamos el objeto USER en el AuthContext
            const updatedUser = {
                ...user,
                ...formData
            };

            // Hack: AuthContext suele guardar en localStorage 'turnes_user'
            localStorage.setItem('turnes_user', JSON.stringify(updatedUser));

            // Forzamos actualización en contexto (si el método login soporta update, sino recarga)
            // Asumimos que login(user) actualiza el estado.
            login(updatedUser);

            // 2. Feedback
            addNotification('success', 'Perfil Actualizado', 'Tu información profesional está al día.');
            setIsEditing(false);

        } catch (error) {
            console.error(error);
            addNotification('error', 'Error', 'No se pudieron guardar los cambios.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Revertir cambios
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
                sector: user.sector || '',
                skills: user.skills || [],
                location: user.location || ''
            });
        }
        setIsEditing(false);
    };

    // Mock Change Password
    const handleChangePassword = async (oldPass, newPass) => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1000));
        setLoading(false);
        addNotification('success', 'Contraseña Actualizada', 'Usa tu nueva credencial al ingresar.');
        return true;
    };

    return {
        user, // Raw User
        formData, // Editable State
        stats, // Derived Metrics
        isEditing,
        loading,
        setIsEditing,
        handleInputChange,
        handleSectorChange,
        handleSkillToggle,
        handleSave,
        handleCancel,
        handleChangePassword,
        // Helpers
        sectors: Object.entries(VACANTES_TAXONOMY),
        currentSectorData: formData.sector ? VACANTES_TAXONOMY[formData.sector] : null
    };
};
