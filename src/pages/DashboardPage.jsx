import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { typography } from '../styles/typography';
import { DashboardHeader } from '../components/Dashboard/DashboardHeader';
import { PriorityBlock } from '../components/Dashboard/PriorityBlock';
import { SolutionsLobby } from '../components/Dashboard/SolutionsLobby';
import { ProcessList } from '../components/Dashboard/ProcessList';
import { FavoritesAside } from '../components/Dashboard/FavoritesAside';
import PremiumBanner from '../components/finance/PremiumBanner';
import { QuickStart } from '../components/Dashboard/QuickStart';

const DashboardPage = () => {
  /**
   * REGLA SENIOR: Todos los Hooks se declaran SIEMPRE al inicio de la función.
   * No debe haber ningún 'return' antes de estas llamadas para evitar 
   * el error de inconsistencia en el renderizado de Hooks.
   */
  const {
    user,
    balance,
    unreadChats,
    priorities,
    activeProcess,
    performance,
    loading
  } = useDashboard();

  /**
   * Una vez declarados los Hooks, ahora sí gestionamos el estado de carga.
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-t-emerald-500 border-white/5 rounded-full animate-spin" />
        <span className="font-bold text-[10px] tracking-widest text-zinc-500 uppercase">
          Sincronizando Ecosistema
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in font-manrope pb-20 pt-4 px-4 antialiased">

      {/* 1. Identidad y Finanzas */}
      <DashboardHeader
        name={user?.name}
        balance={balance}
        unread={unreadChats}
      />

      {/* 2. Centro de Acción Urgente o Onboarding */}
      <QuickStart
        balance={balance}
        hasVacancies={activeProcess?.length > 0}
      />

      <PriorityBlock items={priorities} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Lado Izquierdo: Foco en Crecimiento y Operación */}
        <div className="lg:col-span-8 space-y-16">
          <SolutionsLobby />
          <ProcessList activeProcess={activeProcess} />
        </div>

        {/* Lado Derecho: Recurrencia, Plan y Reputación */}
        <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-8">
          <FavoritesAside />

          <PremiumBanner
            currentPlan={user?.plan || 'Básico'}
            savingsAmount="$24.500"
          />

          {/* Card de Rendimiento (Gamificación) */}
          <div className="p-6 bg-zinc-900/10 border border-white/5 rounded-2xl space-y-4">
            <p className={typography.sectionTitle}>
              Rendimiento Mensual
            </p>
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Crecimiento</p>
                <h4 className="text-3xl font-light text-white tracking-tighter leading-none">
                  {performance?.growth || '0%'}
                </h4>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">
                  Percentil
                </span>
                <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest bg-white/5 border border-white/5 px-2 py-0.5 rounded-lg">
                  {performance?.percentile || 'Top --'}
                </span>
              </div>
            </div>
          </div>

          {/* Estatus de Cifrado */}
          <div className="px-6 py-4 border border-white/5 rounded-2xl flex items-center gap-3 opacity-30">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
            <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest leading-tight">
              Protocolo Shield v4.0 activo
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DashboardPage;