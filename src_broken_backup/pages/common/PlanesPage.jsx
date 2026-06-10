import { companyPlans } from '../../data/companyPlans';
import { formatCurrency } from '../../services/financeService';
import { useAuth } from '../../context/AuthContext';

// =====================================================================
// === ANIMATION VARIANTS (High Impact) ===
// =====================================================================
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const staggerContainer = {
    visible: { transition: { staggerChildren: 0.1 } }
};

// =====================================================================
// === COMPONENTS ===
// =====================================================================

const FeatureItem = ({ feature, highlight = false }) => (
    <li className="flex items-start gap-3">
        <div className={`mt-1 p-0.5 rounded-full ${highlight ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
            <Check size={12} strokeWidth={4} />
        </div>
        <span className={`text-sm ${highlight ? 'text-zinc-200 font-medium' : 'text-zinc-400'}`}>{feature}</span>
    </li>
);

const PricingCard = ({ plan, userLoggedIn }) => {
    const isPopular = plan.isPopular;
    const isPro = plan.id === 'pro';

    // Formatting Price
    const priceFormatted = plan.priceValue === 0 ? "Gratis" : formatCurrency(plan.priceValue).replace(',00', '');
    const suffix = plan.priceValue === 0 ? "PARA SIEMPRE" : "PESOS / MES";

    // Formatting Commission
    const commissionText = `${plan.commissionRate * 100}% por turno`;

    // Static features list
    const featuresList = plan.features || [];

    // Link Logic
    const linkTo = userLoggedIn ? `/dashboard/upgrade` : '/register';

    return (
        <motion.div
            variants={fadeInUp}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className={`
                relative flex flex-col rounded-3xl overflow-hidden transition-all duration-300 h-full
                ${isPopular
                    ? 'bg-zinc-900 border-2 border-emerald-500/50 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] z-10 scale-105 md:scale-110'
                    : 'bg-zinc-900/50 border border-transparent  hover:bg-zinc-900/80'
                }
            `}
        >
            {isPopular && (
                <div className="absolute top-0 inset-x-0 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest text-center py-1">
                    Más Vendido
                </div>
            )}

            <div className="p-8 pb-4">
                <h3 className={`text-lg font-bold mb-2 ${isPopular ? 'text-emerald-400' : 'text-white'}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-black text-white tracking-tighter uppercase">{priceFormatted}</span>
                </div>
                <span className="text-xs font-bold text-zinc-500 block mb-2">{suffix}</span>

                <p className="text-sm font-medium text-emerald-400 mb-2">{commissionText}</p>
                <p className="text-xs text-zinc-500 leading-relaxed h-10 line-clamp-2">{plan.description}</p>
            </div>

            <div className="p-8 pt-4 flex flex-col flex-grow">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-6"></div>

                <ul className="space-y-4 mb-8 flex-grow">
                    {featuresList.map((feature, i) => (
                        <FeatureItem key={i} feature={feature} highlight={isPopular || isPro} />
                    ))}
                </ul>

                <Link
                    to={linkTo}
                    className={`
                        w-full flex items-center justify-center py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 group
                        ${isPopular
                            ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/25'
                            : 'bg-white text-black hover:bg-zinc-200'
                        }
                    `}
                >
                    {plan.priceValue === 0 ? "Comenzar Gratis" : "Elegir Plan"} <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </motion.div>
    );
};

// =====================================================================
// === MAIN PAGE COMPONENT ===
// =====================================================================

const PlanesPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-zinc-950 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">

            <main className="pt-12 md:pt-16 pb-24 text-zinc-200 relative overflow-hidden">

                {/* --- AMBIENT BACKGROUNDS (Optimized) --- */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                    {/* --- HEADER (Marketing Focus) --- */}
                    <motion.header
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
                            No pagues de más
                        </span>
                        <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
                            Invierte en <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Velocidad</span>
                        </h1>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
                            Planes flexibles diseñados para escalar. Desde cubrir una vacante urgente hasta gestionar cientos de turnos al mes.
                        </p>
                    </motion.header>

                    {/* --- PRICING GRID --- */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {companyPlans.map((plan) => (
                            <PricingCard key={plan.id} plan={plan} userLoggedIn={!!user} />
                        ))}
                    </motion.div>

                    {/* --- ONE-TIME PURCHASE SECTION (Static) --- */}
                    <motion.div
                        className="mt-20 max-w-4xl mx-auto"
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900/50 to-zinc-900 border border-indigo-500/30 ">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                            <div className="relative md:flex items-center p-8 md:p-12 gap-12">
                                <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Zap className="text-yellow-400" fill="currentColor" />
                                        <span className="font-bold text-indigo-200">¿Solo necesitas un turno fijo?</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-4">Contratación Flash</h3>
                                    <p className="text-indigo-200/80 mb-6 leading-relaxed">
                                        La solución perfecta para imprevistos. Publica una vacante fija única con visibilidad premium por 15 días. Sin suscripciones.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link
                                            to="/publicar-turno"
                                            className="px-8 py-3 bg-white text-indigo-950 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg shadow-white/10 text-center"
                                        >
                                            Pagar Turno Único
                                        </Link>
                                    </div>
                                </div>

                                <div className="mt-8 md:mt-0 flex-shrink-0 text-center md:text-right">
                                    <span className="block text-sm font-medium text-indigo-300 uppercase tracking-wider mb-1">Pago Único</span>
                                    <span className="block text-5xl font-black text-white tracking-tighter">$19.900</span>
                                    <span className="block text-xs font-bold text-indigo-400 mt-2 bg-indigo-950/50 py-1 px-3 rounded-full inline-block">
                                        IVA INCLUIDO
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </main>
        </div>
    );
};

export default PlanesPage;