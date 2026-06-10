import React from 'react';

import { formatCurrency } from '../../services/financeService';

const WalletPaymentMethod = ({ user, item, payWithWallet, isProcessingWallet, walletError }) => {
    return (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Pago Express con Saldo</h3>
            <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-[2rem] p-6 shadow-[inset_0_4px_20px_rgba(16,185,129,0.05)]">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-black">
                            $
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase leading-none mb-1">Tu Saldo</p>
                            <p className="text-lg font-black text-white">{formatCurrency(user.saldo)}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase leading-none mb-1">Costo Total</p>
                        <p className="text-lg font-black text-white">{formatCurrency(item.rawPrice)}</p>
                    </div>
                </div>

                {walletError && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 font-medium">
                        {walletError}
                    </div>
                )}

                <button
                    onClick={payWithWallet}
                    disabled={isProcessingWallet}
                    className={`group relative overflow-hidden w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-white transition-all active:scale-[0.98]
                        ${isProcessingWallet ? 'bg-zinc-800 text-zinc-500' : 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_10px_30px_rgba(16,185,129,0.2)]'}
                    `}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {isProcessingWallet ? "Procesando Cobro..." : (item.type === 'plan' ? `Pagar mes con mi saldo` : `Pagar servicio con mi saldo`)}
                    </span>
                </button>
                <p className="text-[9px] text-zinc-600 text-center mt-3 font-medium italic">
                    {item.type === 'plan'
                        ? "* El próximo mes se renovará automáticamente de tu saldo o medio de pago guardado."
                        : "* Pago único por este servicio. No se realizarán cobros recurrentes."
                    }
                </p>
            </div>

            {/* DIVISOR CON ESTILO */}
            <div className="relative py-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-[#0a0a0a] px-4 text-[9px] font-black text-zinc-700 uppercase tracking-widest leading-none">o con un medio de pago externo</span>
                </div>
            </div>
        </div>
    );
};

export default WalletPaymentMethod;
