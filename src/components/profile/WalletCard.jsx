import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, CreditCard } from 'lucide-react';

const WalletCard = ({ saldo, onRecharge }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-[#1a0b2e] to-[#0f172a] border border-purple-500/10 relative overflow-hidden group hover:border-purple-500/30 transition-all shadow-lg"
        >
            {/* Glow Effects (Subtle) */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-[60px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-2 mb-3 relative z-10">
                <div className="p-1.5 bg-gradient-to-br from-purple-500/20 to-emerald-500/20 rounded-lg text-white border border-white/5">
                    <Wallet size={14} className="text-purple-400" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Saldo Disponible</span>
            </div>

            <div className="flex flex-col gap-0.5 mb-4 relative z-10">
                <span className="text-2xl font-black text-white tracking-tight drop-shadow-md">
                    ${saldo?.toLocaleString() || '0'}
                </span>
                <span className="text-[10px] text-zinc-600 font-mono">COP</span>
            </div>

            <button
                onClick={onRecharge}
                className="w-full py-2 bg-brand-primary/90 hover:bg-brand-primary border border-brand-success hover:border-white/70 shadow-md shadow-brand-primary/30 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-1.5 active:scale-95 border-white/10 relative z-10 overflow-hidden group"
            >
                <CreditCard size={12} className="relative z-10" /> <span className="relative z-10">Recargar</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite] z-0" />
            </button>
        </motion.div>
    );
};

export default WalletCard;
