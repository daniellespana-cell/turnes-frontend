import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import StatCard from '../../components/finance/StatCard';
import TransactionTable from '../../components/finance/TransactionTable';
import PremiumBanner from '../../components/finance/PremiumBanner';
import EmptyWalletState from '../../components/finance/EmptyWalletState';
import RechargeButton from '../../components/finance/RechargeButton';

import { Wallet, TrendingUp, CreditCard } from 'lucide-react';
import { typography } from '../../styles/typography';

// Componentes Core

// Servicios
import { formatCurrency } from '../../services/financeService';

// Lógica
import { useWalletPageLogic } from '../../hooks/useWalletPageLogic';

const WalletPage = () => {
  const { user, data, isLoading, error, fetchData } = useWalletPageLogic();

  if (error) {
    return (
      <div className="max-w-6xl mx-auto h-[60vh] flex flex-col items-center justify-center space-y-6 animate-fade-in font-manrope">
        <div className="p-6 bg-red-500/10 rounded-[2.5rem] border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
          <AlertCircle size={48} className="text-red-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-white font-black text-xl tracking-tight uppercase italic leading-none">Sincronización Interrumpida</h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest opacity-60">
            {error.message || "Ocurrió un problema al conectar con tu billetera."}
          </p>
        </div>
        <button
          onClick={() => fetchData()}
          className="flex items-center gap-2 bg-brand-primary/90 hover:bg-brand-primary border border-brand-success hover:border-white/70 shadow-md shadow-brand-primary/30 text-white px-8 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all active:scale-95 relative overflow-hidden group"
          type="button"
          aria-label="Acción">
          <RefreshCcw size={14} className="relative z-10" /> <span className="relative z-10">Reintentar ahora</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite] z-0" />
        </button>
      </div>
    );
  }

  const transactions = data?.transactions || [];
  const hasTransactions = transactions.length > 0;

  return (
    <div className="max-w-6xl mx-auto pb-20 pt-4 md:pt-8 px-4 md:px-6 min-h-screen text-zinc-300 antialiased font-manrope space-y-8">

      {/* HEADER DINÁMICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
        <div className="flex-1 min-w-0 space-y-0.5">
          <h1 className={typography.pageTitle}>
            Mi <span className={typography.gradient}>Billetera</span>
          </h1>
          <p className={typography.body + " mt-1 opacity-70"}>
            Gestión de fondos para <span className="text-white font-medium">{user?.name || 'tu cuenta'}</span>.
          </p>
        </div>

        <RechargeButton />
      </div>

      {/* MÉTRICAS FINANCIERAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Balance Disponible"
          // Importante: Priorizamos el balance del AuthContext (user.saldo) 
          // ya que es el que se actualiza en tiempo real tras un débito.
          value={formatCurrency(user?.saldo || data?.balance || 0)}
          icon={Wallet}
          colorClass="text-emerald-500"
        />
        <StatCard
          title="Ingresos del Mes"
          value={formatCurrency(data?.monthlyIncome || 0)}
          icon={TrendingUp}
          colorClass="text-zinc-400"
        />
        <StatCard
          title="Comisiones Turnes"
          value={formatCurrency(data?.commissionsPaid || 0)}
          icon={CreditCard}
          colorClass="text-zinc-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          {hasTransactions || isLoading ? (
            <TransactionTable transactions={transactions} isLoading={isLoading} />
          ) : (
            <EmptyWalletState />
          )}
        </div>
        <div className="lg:col-span-4 lg:sticky lg:top-8">
          <PremiumBanner
            currentPlan={user?.plan || data?.plan || 'Básico'}
            savingsAmount={formatCurrency(24500)}
          />
        </div>
      </div>

      {/* FOOTER TÉCNICO */}
      <div className="flex flex-col items-center gap-3 py-6 opacity-20">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] animate-pulse" />
          <p className="text-[8px] md:text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em]">
            Protocolo Cifrado Turnes v4.0 • PCI-DSS Compliant
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
