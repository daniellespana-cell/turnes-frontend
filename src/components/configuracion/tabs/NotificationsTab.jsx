import React from 'react';
import ToggleItem from '../ToggleItem';

import { Mail, Globe, Smartphone } from 'lucide-react';
import { useSettings } from '../../../hooks/useSettings';
import { usePushNotifications } from '../../../hooks/usePushNotifications';

const NotificationsTab = () => {
    const { settings, toggleNotification } = useSettings();
    const { isSupported, isSubscribed, loading, subscribe, unsubscribe } = usePushNotifications();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Preferencias de Notificaciones</h2>
                <p className="text-zinc-400 text-sm">Elige cómo y cuándo quieres que te contactemos.</p>
            </div>

            <div className="grid gap-4">
                <ToggleItem
                    icon={Mail}
                    title="Alertas por Email"
                    desc="Recibe resúmenes semanales y notificaciones importantes en tu correo."
                    checked={settings.notifications.email}
                    onChange={() => toggleNotification('email')}
                />
                
                {isSupported && (
                    <div className="relative">
                        <ToggleItem
                            icon={Smartphone}
                            title="Notificaciones Push (App)"
                            desc="Recibe alertas en la pantalla de tu celular para nuevos mensajes y postulaciones."
                            checked={isSubscribed}
                            onChange={() => {
                                if (isSubscribed) unsubscribe();
                                else subscribe();
                            }}
                        />
                        {loading && (
                            <div className="absolute inset-0 bg-[#0a0a0a]/50 flex items-center justify-center rounded-2xl backdrop-blur-sm z-10">
                                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                )}
                <ToggleItem
                    icon={Globe}
                    title="Novedades y Marketing"
                    desc="Recibe noticias sobre nuevas funcionalidades y promociones."
                    checked={settings.notifications.marketing}
                    onChange={() => toggleNotification('marketing')}
                />
            </div>
        </div>
    );
};

export default NotificationsTab;
