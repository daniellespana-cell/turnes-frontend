import React from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Hash } from 'lucide-react';
import AdminEmptyState from '../shared/AdminEmptyState';

import { CreditCard, ShieldCheck, Zap, TrendingUp } from 'lucide-react';
import { resolveUserName, classifyWompiConcept, WOMPI_FILTER_TABS } from '../../../domain/admin.config';

/**
 * 💳 WompiGateway — Vista dedicada a transacciones procesadas por Wompi.
 * Muestra KPIs por categoría, tabla de transacciones y desglose.
 */

// --- SUB-COMPONENTES ---

/** KPI card de Wompi */
const WompiKpiCard = ({ icon: Icon, label, value, sub, accent }) => {
    // Extraer el color base del accent (ej: 'bg-purple-500/10' -> 'purple-500')
    const colorBase = accent.replace('bg-', '').replace(/\/\d+/, '');
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 relative overflow-hidden group"
        >
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${accent}`} />
            <div className="relative z-10 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${colorBase}/20 shrink-0`}>
                    <Icon size={20} className={`text-${colorBase}`} />
                </div>
                <div>
                    <p className="text-2xl font-black text-white tabular-nums">{value}</p>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">{label}</p>
                    {sub && <p className="text-[10px] text-zinc-600 mt-0.5">{sub}</p>}
                </div>
            </div>
        </motion.div>
    );
};

/** Badge de categoría Wompi */
const ConceptBadge = ({ concepto }) => {
    const cat = classifyWompiConcept(concepto);
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${cat.bg}`}>
            <span className={cat.color}>{cat.label}</span>
        </span>
    );
};



const WompiGateway = ({ wompiLedger, wompiKPIs, wompiFilter, setWompiFilter }) => {
    return (
        <div className="space-y-6">
            {/* Hero Banner */}
            <div className="relative bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-emerald-500/5 border border-purple-500/20 rounded-3xl p-6 md:p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                                <CreditCard size={28} className="text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">Pasarela de Pagos Wompi</h2>
                                <p className="text-xs text-purple-400/80 font-medium mt-0.5">Registro inmutable de pagos procesados por pasarela externa</p>
                            </div>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-4xl font-black text-purple-400 tabular-nums">
                                ${wompiKPIs.totalVolume.toLocaleString()} <span className="text-sm text-purple-500/50">COP</span>
                            </p>
                            <p className="text-[10px] font-black text-purple-500/60 uppercase tracking-widest mt-1">
                                Volumen Total Procesado ({wompiKPIs.totalCount} transacciones)
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Category KPI Cards */}
            {wompiKPIs.byCategory.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <WompiKpiCard
                        icon={TrendingUp}
                        label="Volumen Total Gateway"
                        value={`$${wompiKPIs.totalVolume.toLocaleString()}`}
                        sub={`${wompiKPIs.totalCount} operaciones validadas`}
                        accent="bg-purple-500/10"
                    />
                    {wompiKPIs.byCategory.map(cat => (
                        <WompiKpiCard
                            key={cat.label}
                            icon={cat.label.includes('Recarga') ? Zap : cat.label.includes('Plan') ? CreditCard : ShieldCheck}
                            label={cat.label}
                            value={`$${cat.volume.toLocaleString()}`}
                            sub={`${cat.count} transacciones`}
                            accent={cat.bg.split(' ')[0]}
                        />
                    ))}
                </div>
            )}
            {/* Filter Tabs */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 overflow-x-auto whitespace-nowrap scrollbar-hide flex-nowrap w-full md:w-auto">
                {WOMPI_FILTER_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setWompiFilter(tab.id)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                            wompiFilter === tab.id
                                ? 'bg-purple-500/20 text-purple-300 shadow-sm border border-purple-500/30'
                                : 'text-zinc-500 hover:text-white'
                        }`}
                        type="button"
                        aria-label="Acción">
                        {tab.label}
                    </button>
                ))}
            </div>
            {/* Transactions Table */}
            <div className="bg-zinc-900/20 border border-white/5 rounded-2xl overflow-hidden">

                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-white/5 bg-zinc-900/40 text-[10px] uppercase font-black tracking-widest text-zinc-500">
                                <th scope="col" className="px-6 py-4">Referencia Wompi</th>
                                <th scope="col" className="px-6 py-4">Contraparte</th>
                                <th scope="col" className="px-6 py-4">Categoría</th>
                                <th scope="col" className="px-6 py-4">Fecha Procesamiento</th>
                                <th scope="col" className="px-6 py-4 text-right">Monto COP</th>
                                <th scope="col" className="px-6 py-4 text-right">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {wompiLedger.length === 0 ? (
                                    <tr><td colSpan="6"><AdminEmptyState icon={CreditCard} message="No hay transacciones Wompi bajo estos criterios" /></td></tr>
                                ) : wompiLedger.map((trx, idx) => {
                                    const userName = resolveUserName(trx.billeteras?.perfiles);
                                    return (
                                        <motion.tr
                                            key={trx.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="border-b border-white/5 hover:bg-purple-500/[0.03] transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Hash size={12} className="text-purple-500/50" />
                                                    <div>
                                                        <p className="text-xs font-bold font-mono text-purple-400">{trx.metadata?.wompi_id?.slice(0, 16) || 'N/A'}</p>
                                                        <p className="text-[10px] text-zinc-600 mt-0.5 font-mono">TRX-{trx.id?.split('-')[0]}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-white">{userName}</p>
                                                <p className="text-[10px] text-zinc-500 mt-0.5 truncate max-w-[180px]">{trx.billeteras?.perfiles?.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <ConceptBadge concepto={trx.concepto} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-white">{new Date(trx.created_at).toLocaleDateString('es-CO')}</p>
                                                <p className="text-[10px] text-zinc-500">{new Date(trx.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-sm font-black text-emerald-400 tabular-nums">
                                                    +${Math.abs(trx.monto || 0).toLocaleString()} <span className="text-[10px] text-zinc-500">COP</span>
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase text-emerald-400">
                                                    <ShieldCheck size={10} /> Liquidado
                                                </span>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Mobile */}
                <div className="block md:hidden">
                    {wompiLedger.length === 0 ? (
                        <AdminEmptyState icon={CreditCard} message="No hay transacciones Wompi" />
                    ) : (
                        <div className="divide-y divide-white/5">
                            {wompiLedger.map(trx => {
                                const userName = resolveUserName(trx.billeteras?.perfiles);
                                return (
                                    <motion.div key={trx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-bold text-white">{userName}</p>
                                                <p className="text-[10px] font-mono text-purple-400/70 mt-0.5">
                                                    <Hash size={10} className="inline mr-0.5" />{trx.metadata?.wompi_id?.slice(0, 12) || 'N/A'}
                                                </p>
                                            </div>
                                            <p className="text-sm font-black text-emerald-400 tabular-nums">+${Math.abs(trx.monto || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <ConceptBadge concepto={trx.concepto} />
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                                                    <ShieldCheck size={8} /> OK
                                                </span>
                                                <p className="text-[10px] text-zinc-500">{new Date(trx.created_at).toLocaleDateString('es-CO')}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-zinc-900/40 p-3 border-t border-white/5 flex items-center justify-between px-6">
                    <span className="text-[10px] font-bold text-purple-500/60 uppercase tracking-widest">
                        {wompiLedger.length} transacciones Wompi verificadas
                    </span>
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                        <ShieldCheck size={10} className="text-emerald-500" /> Integridad Criptográfica Activa
                    </span>
                </div>
            </div>
        </div>
    );
};

export default WompiGateway;
