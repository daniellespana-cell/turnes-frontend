import { useDashboard } from '../../hooks/useDashboard';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import { Star, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();
  const {
    user,
    balance,
    unreadChats,
    activeProcess
  } = useDashboard();

  // 🔥 SENIOR METRICS
  const { fillRate, averageRating, percentile, totalVacancies, loading: metricsLoading } = useDashboardMetrics();

  const appState = {
    walletActive: (user?.saldo || 0) > 0,
    vacancyPublished: totalVacancies > 0,
    isLoading: metricsLoading
  };

  const hasUrgentAction = activeProcess && activeProcess.id;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in font-manrope pb-20 pt-4 px-4 antialiased">

      {/* 00. Banner Elite — solo aparece al comprar pase Elite (se cierra vía BD) */}
      <EliteBanner userName={user?.name || user?.nombre_display} />

      {/* 0. Alertas del Sistema */}
      <ProfileBanner />

      {/* 1. Header Minimalista */}
      <DashboardHeader
        name={user?.name}
        balance={balance}
        unread={unreadChats}
      />

      {/* 1.1 🔥 STRATEGIC METRICS ROW (Senior Scale) */}
      {!metricsLoading && (
        <section className="grid grid-cols-3 gap-2 md:gap-4 px-1">
          {[
            { label: 'Match Rate', val: `${fillRate}%`, icon: Target, color: 'text-emerald-400', bg: 'from-emerald-500/10' },
            { label: 'Reputación', val: averageRating || 'Nuevo', icon: Star, color: 'text-amber-400', bg: 'from-amber-500/10' },
            { label: 'Ecosistema', val: percentile, icon: Zap, color: 'text-purple-400', bg: 'from-purple-500/10' }
          ].map((m, i) => (
            <div key={i} className={`bg-gradient-to-br ${m.bg} to-transparent glass-card p-3 md:p-4 flex flex-col gap-1 border-white/5`}>
              <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                <m.icon size={12} className={m.color} />
                <span className="text-[8px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest truncate">{m.label}</span>
              </div>
              <span className="text-sm md:text-xl font-black text-white tabular-nums tracking-tight">{m.val}</span>
            </div>
          ))}
        </section>
      )}

      <GlowDivider />

      {/* 2. 🔥 COMMAND CENTER (JobToday Style Magnetic Card) */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative"
      >
        {hasUrgentAction && (
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse z-0" />
        )}

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={`border rounded-3xl p-6 relative overflow-hidden cursor-pointer z-10 transition-all duration-500
            ${hasUrgentAction
              ? 'bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border-indigo-400/30 shadow-[0_10px_40px_rgba(99,102,241,0.2)]'
              : 'bg-gradient-to-br from-emerald-600/10 to-teal-600/5 border-emerald-500/20 shadow-[0_10px_40px_rgba(52,211,153,0.1)]'
            }`}
          onClick={() => {
            const searchPath = hasUrgentAction 
              ? `/dashboard/buscar-talento?q=${encodeURIComponent(activeProcess.title.split(':').pop().trim())}` 
              : '/dashboard/buscar-talento';
            navigate(searchPath);
          }}
        >
          <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl transition-all ${hasUrgentAction ? 'bg-indigo-500/30' : 'bg-emerald-500/20'}`} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-4 relative z-10">
            <div className="flex gap-4 items-start w-full">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner
                ${hasUrgentAction ? 'bg-indigo-500/30 border-indigo-400/50' : 'bg-emerald-500/20 border-emerald-400/30'}
              `}>
                <CheckCircle2 size={24} className="text-white drop-shadow-md" />
              </div>
              <div className="flex-1">
                <span className={`text-[10px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-1 block ${hasUrgentAction ? 'text-indigo-300' : 'text-emerald-400'}`}>
                  {hasUrgentAction ? 'Acción Requerida' : 'Ecosistema Optimizado'}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight mb-1">{activeProcess.title}</h3>
                <p className={`text-[11px] sm:text-xs font-medium ${hasUrgentAction ? 'text-indigo-200/80' : 'text-emerald-200/60'}`}>{activeProcess.meta}</p>
              </div>
            </div>

            <motion.button
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
              className={`flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-3 sm:py-2.5 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shrink-0
                ${hasUrgentAction
                  ? 'bg-indigo-500 hover:bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                }
              `}
            >
              {hasUrgentAction ? 'Resolver' : 'Explorar'} <ChevronRight size={14} strokeWidth={3} />
            </motion.button>
          </div>
        </motion.div>
      </motion.section>

      <GlowDivider />

      {/* 2.1 🔥 AI TALENT RADAR (Active Discovery) */}
      <section className="pt-2">
        <TalentRadar />
      </section>

      <GlowDivider />

      {/* 3. Onboarding (Solo si falta configuración) */}
      <QuickStart
        walletActive={appState.walletActive}
        vacancyPublished={appState.vacancyPublished}
        isLoading={appState.isLoading}
      />

      {/* 4. Soluciones Secundarias (Main Menu) */}
      <section className={`pt-4 ${hasUrgentAction ? 'opacity-80 hover:opacity-100 transition-opacity' : ''}`}>
        <SolutionsLobby />
      </section>

      {/* 5. Crecimiento (Upsell) */}
      {user?.plan !== 'Pro' && (
        <section className="pt-8">
          <PremiumBanner currentPlan={user?.plan || 'Básico'} savingsAmount="$24.500" />
        </section>
      )}
    </div>
  );
};

export default DashboardPage;
