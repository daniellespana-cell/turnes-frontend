import { resolveUserName } from '../../../domain/admin.config';
import { AssetResolver } from '../../../utils/assetHelper';

/**
 * Tabla de ranking de liquidez por empresa/usuario.
 */
const BalancesTable = ({ data }) => {
    if (data.length === 0) {
        return (
            <div className="px-6 py-12 text-center text-zinc-500 font-bold">
                No se encontraron billeteras con ese término.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-zinc-900/80 text-xs uppercase font-bold text-zinc-500 border-b border-white/5">
                    <tr>
                        <th className="px-6 py-4">Ranking de Empresa / Usuario</th>
                        <th className="px-6 py-4">Rol en Red</th>
                        <th className="px-6 py-4 text-right">Liquidez Guardada (Billetera)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {data.map((b, i) => {
                        const userName = resolveUserName(b.perfiles);
                        return (
                            <tr key={b.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative shrink-0">
                                            {b.perfiles?.avatar_url ? (
                                                <img src={AssetResolver.getAvatar(b.perfiles.avatar_url)} className="w-12 h-12 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-zinc-700 transition-all" alt="Avatar" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-lg ring-2 ring-transparent group-hover:ring-zinc-700 transition-all">
                                                    {b.perfiles?.nombre_display?.charAt(0) || '?'}
                                                </div>
                                            )}
                                            <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-blue-600 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                                                #{i + 1}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-base truncate max-w-[200px] md:max-w-[400px]">{userName}</p>
                                            <p className="text-xs text-zinc-500 font-medium truncate max-w-[200px] md:max-w-[400px]">{b.perfiles?.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 rounded-md bg-zinc-800/80 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                                        {b.perfiles?.rol || 'Postulante'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <p className="text-xl font-black text-emerald-400 drop-shadow-sm">
                                        ${(b.saldo || 0).toLocaleString()} <span className="text-xs text-emerald-600/50">COP</span>
                                    </p>
                                    <p className="text-[10px] text-zinc-600 mt-1 uppercase font-bold tracking-widest">Saldo Disponible</p>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default BalancesTable;
