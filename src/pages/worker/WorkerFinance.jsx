import React from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, DollarSign, Calendar,
    ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2
} from 'lucide-react';
import { useWorkerFinance } from '../../hooks/useWorkerFinance';

const WorkerFinance = () => {
    const {
        balance,
        monthlyMetrics,
        history,
        stats
    } = useWorkerFinance();

    return (
        <div className="font-manrope pb-24 animate-fade-in space-y-8">

            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Mis Finanzas</h1>
                <p className="text-zinc-500 text-sm">Gestiona tus ganancias y retiros</p>
            </div>

            {/* BALANCE CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total Disponible */}
                <div className="bg-zinc-900/50 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-50" />
                    <div className="relative z-10 space-y-1">
                        <span className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                            <CheckCircle2 size={12} /> Disponible para Retiro
                        </span>
                        <div className="text-4xl font-black text-white tracking-tight">
                            ${balance.available.toLocaleString()}
                        </div>
                        <p className="text-zinc-500 text-xs mt-2">
                            Se procesa en tu cuenta en 1-2 horas.
                        </p>
                    </div>
                    <button className="mt-6 w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase text-xs tracking-widest rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
                        Solicitar Retiro
                    </button>
                </div>

                {/* Pendiente / En Proceso */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                    <div className="relative z-10 space-y-1">
                        <span className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                            <Clock size={12} /> Saldo Pendiente
                        </span>
                        <div className="text-3xl font-bold text-zinc-300 tracking-tight opacity-70">
                            ${balance.pending.toLocaleString()}
                        </div>
                        <p className="text-zinc-500 text-xs mt-2">
                            Turnos finalizados en validación (24h).
                        </p>
                    </div>
                </div>
            </div>

            {/* METRICS (CHART SIMULATION) */}
            <section className="space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp size={18} className="text-indigo-400" /> Rendimiento Semestral
                </h2>

                <div className="bg-zinc-900/50 border border-white/5 rounded-[1.5rem] p-6">
                    <div className="flex items-end justify-between h-32 gap-2">
                        {monthlyMetrics.map((item, index) => {
                            const maxVal = Math.max(...monthlyMetrics.map(m => m.value));
                            const heightPct = (item.value / maxVal) * 100;
                            const isCurrent = index === monthlyMetrics.length - 1;

                            return (
                                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                    {/* Tooltip Value */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-8 text-[10px] font-bold bg-zinc-800 text-white px-2 py-1 rounded">
                                        ${(item.value / 1000).toFixed(0)}k
                                    </div>

                                    {/* Bar */}
                                    <div className="w-full h-full flex items-end">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${heightPct}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 }}
                                            className={`w-full rounded-t-lg transition-colors ${isCurrent ? 'bg-gradient-to-t from-indigo-500 to-cyan-500' : 'bg-zinc-800 group-hover:bg-zinc-700'}`}
                                        />
                                    </div>
                                    {/* Label */}
                                    <span className={`text-[10px] font-bold uppercase tracking-wide ${isCurrent ? 'text-white' : 'text-zinc-500'}`}>
                                        {item.month}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* RECENT TRANSACTIONS */}
            <section className="space-y-4">
                <h2 className="text-lg font-bold text-white">Historial Reciente</h2>
                <div className="space-y-2">
                    {history.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 bg-zinc-900/30 border border-white/5 rounded-2xl hover:bg-zinc-900/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'withdrawal' ? 'bg-zinc-800 text-zinc-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                    {tx.type === 'withdrawal' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">{tx.business}</h4>
                                    <p className="text-zinc-500 text-xs font-medium flex items-center gap-1.5">
                                        {tx.date} • <span className={`capitalize ${tx.status === 'completed' ? 'text-zinc-500' : 'text-amber-500'}`}>{tx.status === 'completed' ? 'Completado' : 'Validando'}</span>
                                    </p>
                                </div>
                            </div>
                            <span className={`font-bold text-sm ${tx.type === 'withdrawal' ? 'text-white' : 'text-emerald-400'}`}>
                                {tx.type === 'withdrawal' ? '-' : '+'}${Math.abs(tx.amount).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
};

export default WorkerFinance;
