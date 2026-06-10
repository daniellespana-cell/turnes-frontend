import React from 'react';
import { Archive } from 'lucide-react';
import ContractHeader from './ContractHeader';
import TalentInfo from './TalentInfo';
import ActionSteps from './ActionSteps';

import { useAuth } from '../../context/AuthContext';

// Hooks & Subcomponents
import { useContractSidebar } from '../../hooks/useContractSidebar';

export const ContractSidebar = (props) => {
  const { user } = useAuth();
  const isEmpresa = user?.role === 'empresa' || user?.role === 'BUSINESS_ROLE';

  // 1. LOGIC EXTRACTION (The Brain)
  const {
    config,
    transactionId,
    status,
    setConfirmingPay,
    actions
  } = useContractSidebar(props);

  return (
    <div className="h-full flex flex-col p-5 space-y-6 overflow-y-auto border-l border-white/5 no-scrollbar relative">

      {/* WATERMARK */}
      {status.isSealed && (
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden opacity-10 flex items-center justify-center">
          <p className="text-[80px] font-black uppercase -rotate-45 text-white border-8 border-white px-10 select-none">
            SELLADO
          </p>
        </div>
      )}

      {/* HEADER */}
      <ContractHeader
        isSealed={status.isSealed}
        isConfirmed={props.permisos?.confirmado}
        transactionId={transactionId}
      />

      {/* INFO CARD */}
      <TalentInfo
        candidate={props.candidate}
        config={config}
        isPaid={status.isPaid}
        isRehire={status.isRehire}
        isSealed={status.isSealed}
        isEmpresa={isEmpresa}
      />

      {/* ACTIONS (Steps 1-4) - Valid only for Business */}
      <div className="space-y-4 pb-2 relative z-[60]">

        {status.isSealed || props.permisos?.isClosed ? (
          <div className="w-full py-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex flex-col items-center justify-center gap-1">
            <Archive size={16} className="text-blue-400 mb-1" />
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
              Ciclo Sellado
            </span>
          </div>
        ) : isEmpresa ? (
          <ActionSteps
            activeStep={props.activeStep}
            isPaid={status.isPaid}
            status={status}
            permisos={props.permisos}
            config={config}
            actions={{ ...actions, setConfirmingPay }}
            onExecute={props.onExecute}
            onFinalize={props.onFinalize}
            onVideoInvite={props.onVideoInvite}
          />
        ) : (
          <div className="text-center py-4 border border-transparent rounded-xl bg-zinc-900/10">
            <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">
              Esperando acción de la empresa
            </span>
          </div>
        )}

        {/* FOOTER VERSION */}
        <div className="text-[6px] text-zinc-800 font-black uppercase tracking-[0.6em] text-center pt-2 select-none">
          Turnes Protocol v2.6
        </div>
      </div>
    </div>
  );
};

export default ContractSidebar;