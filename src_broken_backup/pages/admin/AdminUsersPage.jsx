import { useState } from 'react';
import { Users } from 'lucide-react';
import { useAdminUsers } from '../../hooks/admin/useAdminUsers';
import { ROLE_TABS } from '../../domain/admin.config';

const AdminUsersPage = () => {
    const {
        loading, actionLoading, roleFilter, setRoleFilter,
        searchQuery, setSearchQuery, page, setPage,
        filteredUsers, handleBan, handleResetPassword, limit
    } = useAdminUsers();

    const [banTarget, setBanTarget] = useState(null);
    const [banInput, setBanInput] = useState('');

    const confirmBan = async () => {
        if (banTarget) {
            await handleBan(banTarget.id, banTarget.name, banInput);
            setBanTarget(null);
            setBanInput('');
        }
    };

    const getName = (u) => u.empresas?.nombre_comercial || u.nombre_display || 'Sin Completar';
    const getEmoji = (u) => u.rol === 'empresa' ? '🏢' : '👤';

    return (
        <div className="w-full h-full p-4 md:p-8 overflow-y-auto font-manrope">
            <div className="max-w-6xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-black text-white">Directorio de <span className="text-blue-400">Usuarios</span></h1>
                    <p className="text-zinc-500 text-xs mt-1">Auditoría global de talento y corporativos</p>
                </div>

                {/* Toolbar */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between overflow-hidden">
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 w-full md:w-auto overflow-x-auto whitespace-nowrap scrollbar-hide flex-nowrap">
                        {ROLE_TABS.map(tab => (
                            <button key={tab.id} onClick={() => { setRoleFilter(tab.id); setPage(0); }} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${roleFilter === tab.id ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}>{tab.label}</button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input type="search" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50" />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-zinc-900/20 border border-white/5 rounded-2xl overflow-hidden relative">
                    {actionLoading && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center">
                            <span className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold uppercase"><Spinner size="sm" variant="white" /> Procesando...</span>
                        </div>
                    )}

                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead><tr className="border-b border-white/5 bg-zinc-900/40 text-[10px] uppercase font-black tracking-widest text-zinc-500">
                                <th className="px-6 py-4">Identity</th><th className="px-6 py-4">Rol</th><th className="px-6 py-4">KYC</th><th className="px-6 py-4">Alta</th><th className="px-6 py-4 text-right">Acción</th>
                            </tr></thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="p-12 text-center"><Spinner size="md" variant="blue" center /></td></tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr><td colSpan="5"><AdminEmptyState icon={Users} message="Sin resultados" /></td></tr>
                                ) : filteredUsers.map(user => (
                                    <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-white/5 hover:bg-white/[0.02]">
                                        <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0"><span className="text-xs">{getEmoji(user)}</span></div><div><p className="text-sm font-bold text-white">{getName(user)}</p><p className="text-[10px] text-zinc-500 mt-0.5 truncate max-w-[200px]">{user.email || 'N/A'}</p></div></div></td>
                                        <td className="px-6 py-4"><span className="text-xs font-bold text-zinc-400 capitalize">{user.rol}</span></td>
                                        <td className="px-6 py-4"><KycBadge verified={user.verificado} /></td>
                                        <td className="px-6 py-4"><p className="text-xs text-white">{new Date(user.created_at).toLocaleDateString('es-CO')}</p></td>
                                        <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleResetPassword(getName(user))} className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg"><RefreshCw size={14} /></button>
                                            <button onClick={() => setBanTarget({ id: user.id, name: getName(user) })} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Ban size={14} /></button>
                                        </div></td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile */}
                    <div className="block md:hidden">
                        {loading ? <div className="p-8 flex justify-center"><Spinner size="md" variant="blue" /></div>
                        : filteredUsers.length === 0 ? <AdminEmptyState icon={Users} message="Sin resultados" />
                        : <div className="divide-y divide-white/5">{filteredUsers.map(user => (
                            <div key={user.id} className="p-5 flex flex-col gap-4">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex gap-3 min-w-0 flex-1">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0"><span>{getEmoji(user)}</span></div>
                                        <div className="min-w-0"><p className="text-sm font-bold text-white truncate">{getName(user)}</p><p className="text-[10px] text-zinc-500 truncate">{user.email}</p></div>
                                    </div>
                                    <span className="text-[9px] font-bold text-zinc-400 capitalize border border-white/5 rounded-md px-2 py-1">{user.rol}</span>
                                </div>
                                <div className="flex items-center justify-between"><KycBadge verified={user.verificado} /><p className="text-[10px] text-zinc-500">{new Date(user.created_at).toLocaleDateString('es-CO')}</p></div>
                                <div className="flex items-center justify-end gap-2 border-t border-white/5 pt-3">
                                    <button onClick={() => handleResetPassword(getName(user))} className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase text-blue-400 bg-blue-500/10 rounded border border-blue-500/20"><RefreshCw size={12} /> Reset</button>
                                    <button onClick={() => setBanTarget({ id: user.id, name: getName(user) })} className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase text-red-400 bg-red-500/10 rounded border border-red-500/20"><Ban size={12} /> Suspender</button>
                                </div>
                            </div>
                        ))}</div>}
                    </div>
                    <AdminPagination page={page} setPage={setPage} total={filteredUsers.length} limit={limit} />
                </div>

                {/* Ban Modal */}
                {banTarget && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setBanTarget(null)}>
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
                            <h3 className="text-sm font-black text-white">⚠️ Suspender a {banTarget.name}</h3>
                            <p className="text-xs text-zinc-400">Escribe <span className="font-mono text-red-400">BAN</span> para confirmar.</p>
                            <input type="text" value={banInput} onChange={e => setBanInput(e.target.value)} placeholder="BAN" className="w-full bg-black/40 border border-red-500/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50" autoFocus />
                            <div className="flex gap-3">
                                <button onClick={() => { setBanTarget(null); setBanInput(''); }} className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-bold">Cancelar</button>
                                <button onClick={confirmBan} disabled={banInput !== 'BAN'} className="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-black uppercase disabled:opacity-50">Suspender</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsersPage;
