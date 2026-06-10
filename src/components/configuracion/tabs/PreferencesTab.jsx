import React from 'react';
import { Globe, Moon, Sun } from 'lucide-react';
import ToggleItem from '../ToggleItem';

import { Eye, UserCheck } from 'lucide-react';
import { useSettings } from '../../../hooks/useSettings';

const PreferencesTab = () => {
    const { settings, setLanguage, setTheme, updateSettings } = useSettings();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Preferencias Generales</h2>
                <p className="text-zinc-400 text-sm">Personaliza tu experiencia y gestiona tu privacidad.</p>
            </div>

            {/* Privacidad */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white px-1">Privacidad</h3>
                <div className="grid gap-4">
                    <ToggleItem
                        icon={Eye}
                        title="Perfil Público"
                        desc="Permite que empresas y otros talentos encuentren tu perfil en las búsquedas."
                        checked={settings.privacy.profileVisibility === 'public'}
                        onChange={() => {
                            const newValue = settings.privacy.profileVisibility === 'public' ? 'private' : 'public';
                            updateSettings({ privacy: { ...settings.privacy, profileVisibility: newValue } });
                        }}
                    />
                    <ToggleItem
                        icon={UserCheck}
                        title="Estado de Conexión"
                        desc="Muestra si estás activo ahora mismo a otros usuarios."
                        checked={settings.privacy.showOnlineStatus}
                        onChange={() => {
                            updateSettings({ privacy: { ...settings.privacy, showOnlineStatus: !settings.privacy.showOnlineStatus } });
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PreferencesTab;
