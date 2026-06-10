import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const SecurityTab = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Seguridad y Acceso</h2>
                <p className="text-zinc-400 text-sm">Gestiona tus credenciales y métodos de inicio de sesión.</p>
            </div>

            <div className="bg-white/5 border border-transparent rounded-2xl p-6 space-y-6 shadow-sm transition-all hover:shadow-md">
                <SecurityRow
                    icon={Mail}
                    title="Correo Electrónico"
                    value={user?.email}
                    badge="Solo lectura"
                />

                <div className="w-full h-px bg-white/5" />

                <SecurityRow
                    icon={Lock}
                    title="Contraseña"
                    value="Gestión centralizada via Supabase"
                    actionLabel="Actualizar"
                    onAction={() => navigate('/update-password')}
                />
            </div>

            {/* Verification Status Card */}
            <VerificationCard verified={user?.verificado} onVerify={() => navigate('/plan-action/verify')} />
        </div>
    );
};

// Sub-components for cleaner code
const SecurityRow = ({ icon: Icon, title, value, badge, actionLabel, onAction }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-900 rounded-xl text-zinc-400 group-hover:bg-zinc-800 transition-colors">
                <Icon size={20} />
            </div>
            <div>
                <h3 className="font-bold text-sm text-white">{title}</h3>
                <p className="text-xs text-zinc-500">{value}</p>
            </div>
        </div>
        {badge && (
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded border border-zinc-700 font-medium">
                {badge}
            </span>
        )}
        {actionLabel && (
            <button
                onClick={onAction}
                className="text-xs font-bold text-white bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-700 transition-all hover:scale-105"
            >
                {actionLabel}
            </button>
        )}
    </div>
);

const VerificationCard = ({ verified, onVerify }) => (
    <div className={`p-6 rounded-2xl border transition-all duration-300 ${verified ? 'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10' : 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10'}`}>
        <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${verified ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                <Shield size={24} />
            </div>
            <div className="flex-1">
                <h4 className={`text-base font-bold ${verified ? 'text-blue-400' : 'text-amber-400'}`}>
                    {verified ? 'Cuenta Verificada' : 'Cuenta No Verificada'}
                </h4>
                <p className={`text-sm mt-1 leading-relaxed ${verified ? 'text-blue-300/70' : 'text-amber-300/70'}`}>
                    {verified
                        ? 'Tu identidad ha sido confirmada. Disfrutas de todos los beneficios de seguridad y confianza en la plataforma.'
                        : 'Verifica tu cuenta para acceder a mejores oportunidades, destacar en búsquedas y generar confianza.'}
                </p>
                {!verified && (
                    <button
                        onClick={onVerify}
                        className="mt-4 text-xs font-bold bg-amber-500 text-black px-4 py-2 rounded-lg hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5"
                    >
                        Verificar Ahora →
                    </button>
                )}
            </div>
        </div>
    </div>
);

export default SecurityTab;
