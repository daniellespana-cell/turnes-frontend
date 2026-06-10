import { useNavigate } from 'react-router-dom';
import { Shield, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useVerificationQueue } from '../../hooks/admin/useVerificationQueue';
import { STATUS_CONFIG } from '../../domain/admin.config';
import { AssetResolver } from '../../utils/assetHelper';

const ICON_MAP = { Clock, Shield, CheckCircle, XCircle };

const VerificationQueuePage = () => {
    const navigate = useNavigate();
    const {
        loading, statusFilter, setStatusFilter,
        searchQuery, setSearchQuery, dateFilter, setDateFilter,
        page, setPage, filteredQueue, limit
    } = useVerificationQueue();

    const renderRow = (req) => {
        const sc = STATUS_CONFIG[req.status];
        const StatusIcon = ICON_MAP[sc?.icon] || Shield;
        const name = req.perfiles?.empresas?.nombre_comercial || req.perfiles?.nombre_display || 'Desconocido';
        const role = req.user_role;
        const docs = req.documents || [];
        return { sc, StatusIcon, name, role, docs };
    };

    return (
        <div className="w-full h-full p-4 md:p-8 overflow-y-auto font-manrope">
            <div className="max-w-6xl mx-auto space-y-6">

                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-white">Cola de <span className="text-blue-400">Verificaciones</span></h1>
                        <p className="text-zinc-500 text-xs mt-1">Revisión de identidades KYC y Onboarding corporativo</p>
                    </div>
                    <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 hover:border-white/20 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors">
                        <Download size={14} /> Exportar Reporte CSV
                    </button>
                </div>

                {/* Toolbar */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between overflow-hidden">
                    <div className="flex bg-black/40 p-1 rounded-xl w-full md:w-auto overflow-x-auto whitespace-nowrap scrollbar-hide flex-nowrap border border-white/5">
                        {['pending', 'in_review', 'approved', 'rejected', 'all'].map(tab => (
                            <button key={tab} onClick={() => { setStatusFilter(tab); setPage(0); }} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${statusFilter === tab ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}>
                                {tab === 'all' ? 'Todas' : STATUS_CONFIG[tab]?.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 w-full sm:w-64">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input type="search" placeholder="Buscar empresa o usuario..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50" />
                        </div>
                        <div className="relative w-full sm:w-40">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 min-w-[140px] [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:invert" />
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-zinc-900/20 border border-white/5 rounded-2xl overflow-hidden">
                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead><tr className="border-b border-white/5 bg-zinc-900/40 text-[10px] uppercase font-black tracking-widest text-zinc-500">
                                <th className="px-6 py-4">Entidad</th><th className="px-6 py-4">Tipo</th><th className="px-6 py-4">Fecha</th><th className="px-6 py-4">Evidencias</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4 text-right">Acción</th>
                            </tr></thead>
                            <tbody><AnimatePresence>
                                {loading ? (
                                    <tr><td colSpan="6" className="p-8 text-center"><Spinner size="lg" variant="blue" center /></td></tr>
                                ) : filteredQueue.length === 0 ? (
                                    <tr><td colSpan="6"><AdminEmptyState icon={Shield} message="No existen solicitudes bajo estos criterios" /></td></tr>
                                ) : filteredQueue.map((req, idx) => {
                                    const { sc, StatusIcon, name, role, docs } = renderRow(req);
                                    return (
                                        <motion.tr key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} onClick={() => navigate(`/admin/verificaciones/${req.id}`)} className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer group">
                                            <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">{req.perfiles?.avatar_url ? <img src={AssetResolver.getAvatar(req.perfiles.avatar_url)} className="w-full h-full object-cover rounded-lg" alt={name} /> : <span className="text-xs">{role === 'empresa' ? '🏢' : '👤'}</span>}</div><div><p className="text-sm font-bold text-white">{name}</p><p className="text-[10px] text-zinc-500 mt-0.5">ID: {req.id.split('-')[0]}</p></div></div></td>
                                            <td className="px-6 py-4"><span className="text-xs font-bold text-zinc-300 capitalize">{role}</span></td>
                                            <td className="px-6 py-4"><p className="text-xs text-white">{new Date(req.created_at).toLocaleDateString('es-CO')}</p><p className="text-[10px] text-zinc-500">{new Date(req.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p></td>
                                            <td className="px-6 py-4"><div className="flex items-center gap-1"><FileText size={14} className="text-zinc-500" /><span className="text-xs font-bold text-zinc-400">{docs.length} Archivos</span></div></td>
                                            <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${sc?.color}`}><StatusIcon size={12} />{sc?.label}</span></td>
                                            <td className="px-6 py-4 text-right"><ChevronRight size={16} className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all inline-block" /></td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence></tbody>
                        </table>
                    </div>

                    {/* Mobile */}
                    <div className="block md:hidden">
                        {loading ? <div className="p-8 flex justify-center"><Spinner size="lg" variant="blue" center /></div>
                        : filteredQueue.length === 0 ? <AdminEmptyState icon={Shield} message="Sin solicitudes" />
                        : <div className="divide-y divide-white/5">{filteredQueue.map(req => {
                            const { sc, StatusIcon, name, role, docs } = renderRow(req);
                            return (
                                <motion.div key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => navigate(`/admin/verificaciones/${req.id}`)} className="p-5 flex flex-col gap-4 cursor-pointer hover:bg-white/[0.02]">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">{req.perfiles?.avatar_url ? <img src={AssetResolver.getAvatar(req.perfiles.avatar_url)} className="w-full h-full object-cover rounded-lg" alt={name} /> : <span>{role === 'empresa' ? '🏢' : '👤'}</span>}</div>
                                            <div><p className="text-sm font-bold text-white">{name}</p><p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">{role}</p></div>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[9px] font-black uppercase border ${sc?.color}`}><StatusIcon size={10} /> {sc?.label}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-zinc-400">
                                        <div className="flex items-center gap-1.5"><Calendar size={14} className="text-zinc-500" /><span>{new Date(req.created_at).toLocaleDateString('es-CO')}</span></div>
                                        <div className="flex items-center gap-1.5 font-bold"><FileText size={14} className="text-zinc-500" /><span>{docs.length} Archivos</span></div>
                                    </div>
                                </motion.div>
                            );
                        })}</div>}
                    </div>
                    <AdminPagination page={page} setPage={setPage} total={filteredQueue.length} limit={limit} label={`Mostrando ${filteredQueue.length} de ${limit} permitidos`} />
                </div>
            </div>
        </div>
    );
};

export default VerificationQueuePage;
