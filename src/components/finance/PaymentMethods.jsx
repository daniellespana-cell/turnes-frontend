import React from 'react';
import { Landmark, CreditCard, Zap, Wallet } from 'lucide-react';

const MethodItem = ({ id, active, icon: Icon, title, subtitle, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 active:scale-[0.99] group ${active
        ? 'border-emerald-500/30 bg-emerald-500/5'
        : 'border-white/[0.03] bg-transparent hover:border-white/10 hover:bg-white/[0.02]'
      }`}
  >
    <div className="flex items-center gap-3">
      {/* Icono */}
      <div className={`p-2 rounded-lg transition-colors ${active ? 'bg-emerald-500 text-white' : 'bg-zinc-900 text-zinc-600 group-hover:text-zinc-400'
        }`}>
        <Icon size={16} strokeWidth={2} />
      </div>

      <div className="text-left">
        <p className={`text-xs font-bold tracking-tight ${active ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
          {title}
        </p>
        <p className="text-zinc-600 text-[9px] font-medium mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>

    {/* Radio Indicator Minimal */}
    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${active ? 'border-emerald-500' : 'border-zinc-800'
      }`}>
      {active && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
    </div>
  </button>
);

const PaymentMethods = ({ method, setMethod }) => (
  <div className="bg-[#0f0f10] border border-white/5 rounded-2xl p-5 space-y-4">
    <header className="flex items-center gap-2.5 mb-1">
      <div className="p-1.5 bg-zinc-900 rounded-md text-emerald-400 border border-white/5">
        <Landmark size={14} />
      </div>
      <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Método de Pago</h2>
    </header>

    <div className="grid grid-cols-1 gap-2">
      <MethodItem
        id="card"
        active={method === 'card'}
        icon={CreditCard}
        title="Tarjeta Global"
        subtitle="Crédito o Débito (Stripe)"
        onClick={setMethod}
      />

      <MethodItem
        id="pse"
        active={method === 'pse'}
        icon={Zap}
        title="Transferencia / PSE"
        subtitle="Bancos locales, Nequi, Davi"
        onClick={setMethod}
      />

      <MethodItem
        id="wallet"
        active={method === 'wallet'}
        icon={Wallet}
        title="Billetera Turnes"
        subtitle="Usar créditos acumulados"
        onClick={setMethod}
      />
    </div>
  </div>
);

export default PaymentMethods;