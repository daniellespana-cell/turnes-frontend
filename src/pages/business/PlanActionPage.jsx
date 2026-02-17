import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; // Import ArrowLeft
import { useAuth } from '../../context/AuthContext';
import { useNotificationsContext } from '../../context/NotificationsContext';
import PlanSummaryCard from '../../components/checkout/PlanSummaryCard';
import SecurePaymentForm from '../../components/checkout/SecurePaymentForm';

// === DATOS DE CONTRATO/PLAN (SIMULADOS) ===
const planDetails = {
    'basic': {
        title: "Plan Básico",
        price: "$0",
        period: "Para siempre",
        accent: "emerald",
        features: ["Tasas estándar del mercado", "Soporte vía Ticket", "Acceso a la comunidad basic"],
        terms: "Plan sin permanencia."
    },
    'micro': {
        title: "Plan Micro",
        price: "$29.900",
        period: "Mensual",
        accent: "indigo",
        features: ["Comisión 4% por turno", "7 Publicaciones Gratis", "Soporte Prioritario", "Acceso anticipado a candidatos"],
        terms: "Suscripción mensual autorrenovable."
    },
    'pro': {
        title: "Plan Pro Business",
        price: "$79.900",
        period: "Mensual",
        accent: "pink",
        features: ["0% Comisión por turno", "Puestos ilimitados", "Soporte VIP 24/7", "Algoritmo de Prioridad Alta"],
        terms: "Suscripción mensual autorrenovable. Facturación electrónica."
    }
};

const PlanActionPage = () => {
    const { planSlug } = useParams();
    const navigate = useNavigate();
    const { actualizarPerfil } = useAuth(); // BRAIN 1: Auth Integration
    const { addNotification } = useNotificationsContext(); // BRAIN 2: Notification Integration

    const plan = planDetails[planSlug] || planDetails['basic'];

    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

    const handleSuccess = async () => {
        setPaymentSuccess(true);

        // 1. MAPPING SLUG TO AUTH CONFIG KEYS
        const planMap = {
            'basic': 'Básico',
            'micro': 'Micro',
            'pro': 'Pro'
        };
        const newPlanName = planMap[planSlug] || 'Básico';

        // 2. CONNECTING BRAINS
        await actualizarPerfil({ plan: newPlanName });

        addNotification(
            'success',
            '¡Suscripción Activada!',
            `Has actualizado tu cuenta a Plan ${newPlanName}. Disfruta los beneficios.`,
            '/dashboard'
        );

        setTimeout(() => {
            navigate('/dashboard');
        }, 4000); // 4 seconds to enjoy the confetti
    };

    return (
        <>
            {/* CONFETTI OVERLAY */}
            {paymentSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent animate-pulse" />
                    </div>
                    <div className="text-center animate-bounce z-10 relative">
                        <h1 className="text-6xl mb-4">🎉</h1>
                        <h2 className="text-3xl font-bold text-white mb-2">¡Bienvenido al Club!</h2>
                        <p className="text-zinc-400">Tu plan ha sido activado exitosamente.</p>
                    </div>
                </div>
            )}

            {/* MAIN CONTAINER - CENTERED (Slightly) & COMPACT */}
            {/* MAIN CONTAINER - CENTERED (Slightly) & COMPACT */}
            <div className="w-full max-w-6xl mx-auto px-6 py-12 md:pl-20"> {/* Added left padding/margin to nudge it right ("correlo mas al centro") */}

                {/* BOTÓN DE RETROCESO (Estilo App) */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-zinc-500 hover:text-white transition-all active:scale-95 group flex items-center justify-center rounded-full hover:bg-white/5"
                    >
                        <ArrowLeft
                            size={24}
                            className="group-hover:-translate-x-0.5 transition-transform"
                        />
                    </button>
                </div>

                {/* Header Title Section */}
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3 text-white">
                        Configura tu Suscripción <span className={`text-${plan.accent}-400`}>Premium</span>
                    </h1>
                    <p className="text-sm md:text-base text-zinc-400">Finaliza los detalles de tu contrato digital y activa tu plan.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* LEFT PANEL: CONTRACT VISUAL (Collapsible on Mobile) */}
                    <div className="lg:col-span-5 relative z-10 order-1 lg:order-1">

                        {/* MOBILE TOGGLE BUTTON */}
                        <button
                            onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                            className="lg:hidden w-full flex items-center justify-between p-4 bg-zinc-900 border border-white/10 rounded-2xl mb-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full bg-${plan.accent}-500 shadow-[0_0_10px_currentColor]`} />
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white leading-none mb-1">Resumen del Contrato</p>
                                    <p className="text-xs text-zinc-500">{plan.title} • {plan.price}</p>
                                </div>
                            </div>
                            <ChevronDown className={`text-zinc-500 transition-transform duration-300 ${isSummaryExpanded ? 'rotate-180' : ''} w-5 h-5`} />
                        </button>

                        <div className={`${isSummaryExpanded ? 'block' : 'hidden'} lg:block lg:sticky lg:top-8 transition-all duration-300`}>
                            <PlanSummaryCard plan={plan} />
                        </div>
                    </div>

                    {/* RIGHT PANEL: PAYMENT FORM (60%) */}
                    <div className="lg:col-span-7 relative z-10 lg:pl-16 order-2 lg:order-2">
                        <SecurePaymentForm onPaymentSuccess={handleSuccess} />

                        {/* TRUST BADGES FOOTER */}
                        <div className="mt-8 flex flex-wrap justify-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="flex items-center gap-1">
                                <ShieldIcon className="w-4 h-4 text-zinc-500" />
                                <span className="text-[10px] font-bold text-zinc-500 tracking-widest">PCI COMPLIANT</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <LockIcon className="w-4 h-4 text-zinc-500" />
                                <span className="text-[10px] font-bold text-zinc-500 tracking-widest">256-BIT SSL</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </>
    );
};

// Helpers
const ChevronDown = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 9l6 6 6-6" /></svg>
)
const ShieldIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
)
const LockIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
)

export default PlanActionPage;