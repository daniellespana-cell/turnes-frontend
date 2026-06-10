import React from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import RechargeAmount from '../../components/finance/RechargeAmount';
import PaymentMethods from '../../components/finance/PaymentMethods';
import RechargeSummary from '../../components/finance/RechargeSummary';
import TransactionSuccess from '../../components/finance/TransactionSuccess';
import TransactionError from '../../components/finance/TransactionError';
import Toast from '../../components/common/Toast';
import ConfirmNavigationModal from '../../components/common/ConfirmNavigationModal';

import { typography } from '../../styles/typography';

// Componentes UI

// Lógica
import { useRechargePageLogic } from '../../hooks/useRechargePageLogic';

const RechargePage = () => {
  const {
    status,
    amount,
    setAmount,
    method,
    setMethod,
    transactionId,
    toast,
    setToast,
    blocker,
    handlePayment,
    handleReset,
    handleDownloadReceipt,
    triggerToast,
    navigate
  } = useRechargePageLogic();

  // --- RENDERIZADO DE ESTADOS FINALES ---
  if (status === 'success') {
    return (
      <div className="max-w-5xl mx-auto p-4 font-manrope min-h-screen">
        <TransactionSuccess
          amount={amount}
          transactionId={transactionId}
          onDownloadPDF={handleDownloadReceipt}
        />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-5xl mx-auto p-4 font-manrope min-h-screen">
        <TransactionError onRetry={handlePayment} onCancel={handleReset} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 pt-4 md:pt-8 px-4 md:px-6 text-zinc-300 antialiased font-manrope min-h-screen">

      <header className="flex flex-row items-center gap-4 md:gap-6 mb-8 md:mb-12 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-zinc-900 rounded-full border border-transparent active:scale-95 transition-all shadow-lg shrink-0 group hover:bg-white/5"
        >
          <ArrowLeft size={20} className="md:size-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <div className="flex-1 min-w-0 space-y-0.5">
          <h1 className={typography.pageTitle}>
            Recargar <span className={typography.gradient}>Saldo</span>
          </h1>
          <nav className="flex items-center gap-2 mt-1 md:mt-2 opacity-60">
            <span className={typography.sectionTitle + " cursor-pointer hover:text-white transition-colors text-[9px]"} onClick={() => navigate('/dashboard/finanzas')}>Finanzas</span>
            <ChevronRight size={10} className="text-zinc-600" />
            <span className={typography.sectionTitle + " text-emerald-500 text-[9px]"}>Fondos</span>
          </nav>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6 max-w-5xl mx-auto">

        <div className={`lg:col-span-8 space-y-6 transition-all duration-500 ${status === 'processing' ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'
          }`}>
          <RechargeAmount
            amount={amount}
            setAmount={setAmount}
            onAmountChange={(msg) => triggerToast('info', msg)}
          />
          <PaymentMethods method={method} setMethod={setMethod} />
        </div>

        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          <RechargeSummary
            amount={amount}
            isProcessing={status === 'processing'}
            onPay={handlePayment}
          />

          <footer className="px-6 opacity-40">
            <p className="text-[8px] text-zinc-600 font-bold uppercase text-center leading-relaxed tracking-tighter">
              PCI-DSS Compliant Infrastructure • Turnes v4.0. <br />
              Las transacciones son procesadas bajo protocolos de cifrado de grado militar.
            </p>
          </footer>
        </aside>

      </div>

      {toast && <Toast data={toast} onClose={() => setToast(null)} />}

      {blocker && blocker.state === "blocked" && (
        <ConfirmNavigationModal
          isOpen={true}
          onConfirm={() => blocker.proceed()}
          onCancel={() => blocker.reset()}
        />
      )}
    </div>
  );
};

export default RechargePage;
