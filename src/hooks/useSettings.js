
import { useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const DEFAULT_SETTINGS = {
    notifications: {
        email: true,
        marketing: false
    },
    privacy: {
        profileVisibility: 'public',
        showOnlineStatus: true
    }
};

/**
 * 🚀 SENIOR HOOK: useSettings (Cloud-First Edition)
 * Centraliza la lógica de preferencias de Privacidad y Notificaciones en la DB.
 */
export const useSettings = () => {
    const { user, actualizarPerfil } = useAuth();

    // 1. Source of Truth: DB > LocalStorage > Default
    const settings = useMemo(() => {
        if (user?.configuraciones) {
            return { ...DEFAULT_SETTINGS, ...user.configuraciones };
        }
        
        try {
            const stored = localStorage.getItem('turnes_app_settings');
            return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
        } catch {
            return DEFAULT_SETTINGS;
        }
    }, [user?.configuraciones]);

    // 2. Cache for instant boot
    useEffect(() => {
        localStorage.setItem('turnes_app_settings', JSON.stringify(settings));
    }, [settings]);

    // 3. Actions: Persistent Updates
    const updateSettings = async (newSettings) => {
        const merged = { ...settings, ...newSettings };
        if (actualizarPerfil) {
            await actualizarPerfil({ configuraciones: merged });
        }
    };

    const toggleNotification = (key) => {
        const newNotifications = {
            ...settings.notifications,
            [key]: !settings.notifications[key]
        };
        updateSettings({ notifications: newNotifications });
    };

    return {
        settings,
        toggleNotification,
        updateSettings
    };
};
