
/**
 * Tarjetas KPI del Ledger Financiero: Ingreso Bruto, Egreso, Balance Neto.
 */
const FinanceKpiCards = ({ globalKPIs }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 relative z-10">
                <TrendingUp size={20} className="text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-white relative z-10">${globalKPIs.grossInflow.toLocaleString()} <span className="text-xs text-zinc-500">COP</span></p>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1 relative z-10">Ingreso Bruto</p>
        </div>
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 relative z-10">
                <ArrowDownRight size={20} className="text-red-400" />
            </div>
            <p className="text-3xl font-black text-white relative z-10">${globalKPIs.grossOutflow.toLocaleString()} <span className="text-xs text-zinc-500">COP</span></p>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1 relative z-10">Egreso Neto</p>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 relative z-10">
                <Database size={20} className="text-blue-400" />
            </div>
            <p className={`text-3xl font-black relative z-10 ${globalKPIs.netRevenue < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                ${globalKPIs.netRevenue.toLocaleString()} <span className="text-xs text-zinc-500">COP</span>
            </p>
            <p className="text-xs font-bold text-blue-500/80 uppercase tracking-widest mt-1 relative z-10">Balance Neto Consolidado</p>
        </div>
    </div>
);

export default FinanceKpiCards;
