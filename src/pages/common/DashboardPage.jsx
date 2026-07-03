import React from 'react';
import DashboardHeader from '../../components/Dashboard/DashboardHeader';
import SolutionsLobby from '../../components/Dashboard/SolutionsLobby';
import PremiumBanner from '../../components/finance/PremiumBanner';
import QuickStart from '../../components/Dashboard/QuickStart';
import ProfileBanner from '../../components/Dashboard/ProfileBanner';
import TalentRadar from '../../components/Dashboard/TalentRadar';
import EliteBanner from '../../components/Dashboard/EliteBanner';
import MetricsRow from '../../components/Dashboard/MetricsRow';
import CommandCenterWidget from '../../components/Dashboard/CommandCenterWidget';
import GlowDivider from '../../components/common/GlowDivider';

import { useDashboard } from '../../hooks/useDashboard';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in font-manrope pb-20 pt-2 md:pt-4 antialiased w-full px-4 md:px-0">

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
      <MetricsRow 
        fillRate={fillRate} 
        averageRating={averageRating} 
        percentile={percentile} 
        loading={metricsLoading}
      />

      <GlowDivider />

      {/* 2. 🔥 COMMAND CENTER (JobToday Style Magnetic Card) */}
      <CommandCenterWidget 
        activeProcess={activeProcess}
        hasUrgentAction={hasUrgentAction}
        onNavigate={() => {
          const searchPath = hasUrgentAction 
            ? `/dashboard/buscar-talento?q=${encodeURIComponent(activeProcess.title.split(':').pop().trim())}` 
            : '/dashboard/buscar-talento';
          navigate(searchPath);
        }}
      />

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
