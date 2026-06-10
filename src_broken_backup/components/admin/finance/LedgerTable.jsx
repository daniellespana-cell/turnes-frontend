import { Database } from 'lucide-react';

/**
 * Tabla de transacciones del Ledger Financiero (Desktop + Mobile Cards).
 */
const LedgerTable = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="p-12 flex justify-center">
                <Spinner size="md" variant="emerald" />
            </div>
        );
    }

    if (data.length === 0) {
        return <AdminEmptyState icon={Database} message="La tabla transaccional está vacía." />;
    }

    return (
        <>
            {/* Vista Desktop */}
            <div className="hidden md:block overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-white/5 bg-zinc-900/40 text-[10px] uppercase font-black tracking-widest text-zinc-500">
                            <th scope="col" className="px-6 py-4">Firma (ID Transacción)</th>
                            <th scope="col" className="px-6 py-4">Contraparte</th>
                            <th scope="col" className="px-6 py-4">Contexto de Movimiento</th>
                            <th scope="col" className="px-6 py-4 text-right">Volumen Cop</th>
                            <th scope="col" className="px-6 py-4 text-right">Integridad Wompi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((trx) => {
                            return (
                                <motion.tr
                                    key={trx.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold font-mono text-zinc-400">TRX-{trx.id.split('-')[0]}</p>
                                        <p className="text-[10px] text-zinc-600 mt-1">{new Date(trx.dateFull).toLocaleString('es-CO')}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-white">{trx.counterpart}</p>
                                        <p className="text-[10px] text-zinc-500 truncate mt-0.5">{trx.counterpartEmail}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-zinc-300 capitalize">{trx.business}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <MontoDisplay monto={trx.monto} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <WompiBadge hasWompi={!!trx.metadata?.wompi_id} />
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Vista Móvil */}
            <div className="block md:hidden divide-y divide-white/5">
                {data.map((trx) => {
                    return (
                        <motion.div
                            key={trx.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-5 flex flex-col gap-3"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-bold text-white">{trx.counterpart}</p>
                                    <p className="text-[10px] font-mono text-zinc-500 mt-0.5">TRX-{trx.id.split('-')[0]}</p>
                                </div>
                                <MontoDisplay monto={trx.monto} />
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                    <WompiBadge hasWompi={!!trx.metadata?.wompi_id} small />
                                    <p className="text-xs font-bold text-zinc-300 capitalize truncate max-w-[150px]">{trx.business}</p>
                                </div>
                                <p className="text-[10px] text-zinc-500">{new Date(trx.dateFull).toLocaleDateString()}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </>
    );
};

/** Componente de display de monto con icono de dirección */
const MontoDisplay = ({ monto }) => {
    const val = monto || 0;
    return (
        <div className="flex items-center justify-end gap-1 font-mono text-sm font-black">
            {val > 0 ? (
                <span className="text-emerald-400 flex items-center"><ArrowUpRight size={14} className="mr-1" />+${val.toLocaleString()}</span>
            ) : (
                <span className="text-red-400 flex items-center"><ArrowDownRight size={14} className="mr-1" />-${Math.abs(val).toLocaleString()}</span>
            )}
        </div>
    );
};

/** Badge de integridad Wompi */
const WompiBadge = ({ hasWompi, small }) => (
    <span className={`px-2 py-1 rounded border ${small ? 'text-[9px]' : 'text-[10px]'} font-bold uppercase ${hasWompi ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-zinc-800 text-zinc-400 border-white/10'}`}>
        {hasWompi ? (small ? 'Wompi' : 'Wompi Liquidado') : 'Interno'}
    </span>
);

export default LedgerTable;
