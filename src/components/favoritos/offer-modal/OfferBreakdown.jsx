import React from 'react';
import { formatCurrency } from '../../../services/financeService';

export const OfferBreakdown = ({ userPlan, comision }) => {
  return (
    <div className="bg-zinc-900/40 rounded-2xl p-3.5 border border-white/5 space-y-2 font-manrope">
      <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest">
        <span className="text-zinc-500">Plan Actual</span>
        <span className="text-purple-400 font-black">{userPlan}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-black text-zinc-400 uppercase">Comisión Turnes</span>
        <span className="text-[11px] font-black text-emerald-400 tabular-nums">
          {comision === 0 ? 'GRATIS' : formatCurrency(comision)}
        </span>
      </div>
    </div>
  );
};

export default OfferBreakdown;
