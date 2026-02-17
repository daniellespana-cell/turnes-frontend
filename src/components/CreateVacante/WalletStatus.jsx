import React from 'react';
import { Wallet, AlertCircle } from 'lucide-react';

const WalletStatus = ({ balance, hasFunds, formatCurrency }) => (
  <div className={`p-4 rounded-[1.5rem] mb-6 flex items-center gap-4 border transition-all duration-500 ${
    hasFunds ? 'bg-zinc-800/20 border-white/[0.04]' : 'bg-red-500/5 border-red-500/20 ring-1 ring-red-500/10'
  }`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
      hasFunds ? 'bg-zinc-800 text-emerald-500' : 'bg-red-500/20 text-red-500'
    }`}>
      <Wallet size={20} />
    </div>
    <div className="flex-1">
      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Saldo Turnes</p>
      <p className="text-sm font-bold text-white tracking-tight">{formatCurrency(balance)}</p>
    </div>
    {!hasFunds && <AlertCircle size={16} className="text-red-500 animate-bounce" />}
  </div>
);

export default WalletStatus;