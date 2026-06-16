import { Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import Spinner from '../ui/Spinner';

import { formatCurrency } from '../../services/financeService';

const TransactionList = ({ history, hasMore, loadMore, isLoadingMore }) => {
    return (
        <section className="space-y-4 mt-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 px-2">
                <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Movimientos Recientes</h2>
                <span className="text-[10px] font-bold text-emerald-500/60 bg-emerald-500/5 px-2 py-1 rounded-full">{history.length} TRANSACCIONES</span>
            </div>
            
            {history.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-white/5 rounded-[2rem]">
                    <p className="text-zinc-600 text-sm italic">Aún no hay movimientos registrados en tu historial.</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {history.map((tx) => {
                        const isIncome = tx.type === 'deposit';

                        return (
                            <div key={tx.id} className="group flex items-center justify-between py-5 border-b border-white/[0.03] hover:bg-white/[0.02] px-2 rounded-xl transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl bg-zinc-900 border border-transparent flex items-center justify-center shrink-0 transition-colors ${isIncome ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {isIncome ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-[15px]">{tx.business}</h4>
                                        <span className="text-zinc-500 text-[11px] font-medium">{tx.date}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-black text-lg tracking-tighter ${isIncome ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                                    </div>
                                    <span className="text-zinc-600 text-[9px] uppercase font-black tracking-widest">
                                        {tx.status || 'Confirmado'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}


                    {/* LOAD MORE BUTTON */}
                    {hasMore && (
                        <button
                            onClick={loadMore}
                            disabled={isLoadingMore}
                            className="w-full mt-6 py-4 bg-zinc-900/50 border border-transparent rounded-2xl text-zinc-500 text-xs font-black uppercase tracking-widest hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoadingMore ? (
                                <>
                                    <Spinner size="sm" variant="white" />
                                    Cargando...
                                </>
                            ) : (
                                <>
                                    Cargar más movimientos
                                    <Download className="w-3 h-3 opacity-50" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}
        </section>
    );
};

export default TransactionList;
