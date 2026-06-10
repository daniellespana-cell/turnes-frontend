import { Mail, Globe } from 'lucide-react';
import { useSettings } from '../../../hooks/useSettings';
// Simplified path if in same folder, but wait, structure.

const NotificationsTab = () => {
    const { settings, toggleNotification } = useSettings();

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
