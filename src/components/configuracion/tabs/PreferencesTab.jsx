import React, { useState } from 'react';
import ToggleItem from '../ToggleItem';

import { Eye, UserCheck, Shield } from 'lucide-react';
import { useSettings } from '../../../hooks/useSettings';
import CookieSettingsModal from '../../common/cookies/CookieSettingsModal';

const PreferencesTab = () => {
    const { settings, setLanguage, setTheme, updateSettings } = useSettings();
    const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);

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

                    {/* Botón de Cookies */}
                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-800 rounded-lg">
                                <Shield size={18} className="text-emerald-500" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium text-sm">Privacidad y Cookies</h4>
                                <p className="text-zinc-500 text-xs">Gestiona tus preferencias de rastreo y cookies.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsCookieModalOpen(true)} 
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-sm text-white font-medium transition-colors"
                        >
                            Configurar
                        </button>
                    </div>
                </div>
            </div>

            <CookieSettingsModal isOpen={isCookieModalOpen} onClose={() => setIsCookieModalOpen(false)} />
        </div>
    );
};

export default PreferencesTab;
